#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ No se encontró el archivo .env"
    exit 1
fi

source "$ENV_FILE"

TITLE=""
CONTENT=""
TEMPLATE=""
ATTACHMENT=""
STATUS="SUCCESS"
CONTAINER_NAME="CINEMAN"
EVENT_DATE=""
EVENT_TIME=""

show_help() {
    echo ""
    echo "Uso:"
    echo "  bash scripts/Notificador.sh [opciones]"
    echo ""
    echo "Opciones Obligatorias:"
    echo "  -t, --title         Título del correo"
    echo "  -c, --content       Contenido del correo"
    echo "  -tpl, --template    Template HTML"
    echo "  -d, --date          Fecha del evento (ej. '23/05/2026')"
    echo "  -tm, --time         Hora del evento (ej. '15:30:00')"
    echo ""
    echo "Opciones Adicionales:"
    echo "  -s, --status        SUCCESS | ERROR | WARNING (Por defecto: SUCCESS)"
    echo "  -ct, --container    Nombre del contenedor (Por defecto: CINEMAN)"
    echo "  -a, --attach        Ruta al archivo adjunto (.txt o .log)"
    echo ""
    exit 1
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -t|--title) TITLE="$2"; shift 2 ;;
        -c|--content) CONTENT="$2"; shift 2 ;;
        -tpl|--template) TEMPLATE="$2"; shift 2 ;;
        -d|--date) EVENT_DATE="$2"; shift 2 ;;
        -tm|--time) EVENT_TIME="$2"; shift 2 ;;
        -s|--status) STATUS=$(echo "$2" | tr '[:lower:]' '[:upper:]'); shift 2 ;;
        -ct|--container) CONTAINER_NAME="$2"; shift 2 ;;
        -a|--attach) ATTACHMENT="$2"; shift 2 ;;
        *) echo "❌ Parámetro inválido: $1"; show_help ;;
    esac
done

if [[ -z "$TITLE" || -z "$CONTENT" || -z "$TEMPLATE" || -z "$EVENT_DATE" || -z "$EVENT_TIME" ]]; then
    echo "❌ Faltan parámetros obligatorios."
    show_help
fi

TEMPLATE_FILE="$SCRIPT_DIR/template/$TEMPLATE.html"

if [[ ! -f "$TEMPLATE_FILE" ]]; then
    echo "❌ Template no encontrado:"
    echo "   $TEMPLATE_FILE"
    exit 1
fi

ASSETS_DIR="$SCRIPT_DIR/template/assets"
LOGO_FILE="$ASSETS_DIR/Logo.png"
SUCCESS_FILE="$ASSETS_DIR/success.png"
ERROR_FILE="$ASSETS_DIR/error.png"
WARNING_FILE="$ASSETS_DIR/warning.png"

for file in "$LOGO_FILE" "$SUCCESS_FILE" "$ERROR_FILE" "$WARNING_FILE"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Asset faltante: $file"
        exit 1
    fi
done

LOGO_BASE64=$(base64 -w 0 "$LOGO_FILE")
SUCCESS_BASE64=$(base64 -w 0 "$SUCCESS_FILE")
ERROR_BASE64=$(base64 -w 0 "$ERROR_FILE")
WARNING_BASE64=$(base64 -w 0 "$WARNING_FILE")

case "$STATUS" in
    SUCCESS) STATUS_ICON="$SUCCESS_BASE64" ;;
    ERROR) STATUS_ICON="$ERROR_BASE64" ;;
    WARNING) STATUS_ICON="$WARNING_BASE64" ;;
    *) echo "❌ Estado inválido. Usa: SUCCESS | ERROR | WARNING"; exit 1 ;;
esac

ATTACHMENT_SECTION=""

if [[ -n "$ATTACHMENT" ]]; then
    if [[ ! -f "$ATTACHMENT" ]]; then
        echo "❌ Archivo adjunto no encontrado: $ATTACHMENT"
        exit 1
    fi

    EXT="${ATTACHMENT##*.}"

    if [[ "$EXT" != "txt" && "$EXT" != "log" ]]; then
        echo "❌ Solo se permiten archivos .txt y .log"
        exit 1
    fi

    ATTACHMENT_SECTION='
    <div style="margin-top:20px; padding:15px; border:1px solid #3c2661; border-radius:12px; background-color:#1e1433; text-align:center;">
        <div style="color:#d8b4fe; font-weight:bold; margin-bottom:5px;">📎 Archivo adjunto detectado</div>
        <div style="color:#9ca3af; font-size:13px;">Se adjuntó un archivo adicional en este correo.</div>
    </div>'
fi

HTML=$(cat "$TEMPLATE_FILE")

# Reemplazos de variables de texto
HTML="${HTML//\{\{TITLE\}\}/$TITLE}"
HTML="${HTML//\{\{CONTENT\}\}/$CONTENT}"
HTML="${HTML//\{\{STATUS\}\}/$STATUS}"
HTML="${HTML//\{\{DATE\}\}/$EVENT_DATE}"
HTML="${HTML//\{\{TIME\}\}/$EVENT_TIME}"
HTML="${HTML//\{\{HOSTNAME\}\}/$(hostname)}"
HTML="${HTML//\{\{CONTAINER\}\}/$CONTAINER_NAME}"
HTML="${HTML//\{\{ATTACHMENT_SECTION\}\}/$ATTACHMENT_SECTION}"

# Inyección de Base64 para imágenes
HTML="${HTML//\{\{LOGO_BASE64\}\}/$LOGO_BASE64}"
HTML="${HTML//\{\{STATUS_ICON_BASE64\}\}/$STATUS_ICON}"

BOUNDARY="MIXED_$(date +%s)"
TEMP_MAIL=$(mktemp)

{
echo "From: $SMTP_USER"
echo "To: $EMAIL_TO"
echo "Subject: $TITLE"
echo "MIME-Version: 1.0"
echo "Content-Type: multipart/mixed; boundary=\"$BOUNDARY\""
echo ""

echo "--$BOUNDARY"
echo "Content-Type: text/html; charset=UTF-8"
echo ""
echo "$HTML"
echo ""

if [[ -n "$ATTACHMENT" ]]; then
    FILENAME=$(basename "$ATTACHMENT")
    echo "--$BOUNDARY"
    echo "Content-Type: text/plain; name=\"$FILENAME\""
    echo "Content-Disposition: attachment; filename=\"$FILENAME\""
    echo "Content-Transfer-Encoding: base64"
    echo ""
    base64 "$ATTACHMENT"
    echo ""
fi

echo "--$BOUNDARY--"

} > "$TEMP_MAIL"

msmtp \
    --host="$SMTP_HOST" \
    --port="$SMTP_PORT" \
    --auth=on \
    --tls=on \
    --user="$SMTP_USER" \
    --from="$SMTP_USER" \
    --passwordeval="echo $SMTP_PASS" \
    "$EMAIL_TO" < "$TEMP_MAIL"

rm "$TEMP_MAIL"

echo ""
echo "========================================"
echo "✅ Correo enviado correctamente"
echo "========================================"
echo ""