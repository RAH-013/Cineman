#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR" || exit 1

if [ -f .env ]; then
    source .env
fi

LOG_DIR="./logs/"
NOTIFIER_SCRIPT="./scripts/Notificador.sh"

FRONT_CONTAINER="cineman_frontend"
NGINX_CONTAINER="cineman_nginx"
BACKEND_CONTAINER="cineman_backend"
MYSQL_CONTAINER="cineman_mysql"

mkdir -p "$LOG_DIR"

declare -A STATES=(
    [$FRONT_CONTAINER]="OK"
    [$NGINX_CONTAINER]="OK"
    [$BACKEND_CONTAINER]="OK"
    [$MYSQL_CONTAINER]="OK"
)

handle_incident() {
    local CONTAINER=$1
    local COMPONENT=$2
    local FAIL_REASON=$3
    local RECOVERY_METHOD=$4
    local RECOVERY_RISK_LEVEL=$5 

    local TS_FILE=$(date +"%Y%m%d_%H%M%S")
    local REPORT_FILE="$LOG_DIR/report_cineman_${TS_FILE}.log"
    
    local DISPLAY_DATE=$(date +"%d/%m/%Y")
    local DISPLAY_TIME=$(date +"%H:%M:%S")

    local PREV_STATUS=$(docker inspect -f '{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo "No encontrado")
    local EXIT_CODE=$(docker inspect -f '{{.State.ExitCode}}' "$CONTAINER" 2>/dev/null || echo "N/A")
    local STARTED_AT=$(docker inspect -f '{{.State.StartedAt}}' "$CONTAINER" 2>/dev/null || echo "Desconocido")
    local RESTART_COUNT=$(docker inspect -f '{{.State.RestartCount}}' "$CONTAINER" 2>/dev/null || echo "0")
    local OOM_KILLED=$(docker inspect -f '{{.State.OOMKilled}}' "$CONTAINER" 2>/dev/null || echo "false")
    
    local UPTIME_STR="Desconocido"
    if [ "$STARTED_AT" != "Desconocido" ]; then
        UPTIME_STR=$(date -d "$STARTED_AT" +"%d/%m/%Y %H:%M:%S" 2>/dev/null || echo "$STARTED_AT")
    fi

    local RIESGO_HUMANO="Desconocido"
    case "$RECOVERY_RISK_LEVEL" in
        SUCCESS) RIESGO_HUMANO="BAJO (Fallo superficial / Recuperable)" ;;
        WARNING) RIESGO_HUMANO="MEDIO (Fallo de infraestructura / Pérdida de conexiones)" ;;
        ERROR)   RIESGO_HUMANO="ALTO (Fallo crítico / Requiere atención manual)" ;;
    esac

    local DIAGNOSTICO_EXTRA=""
    if [ "$OOM_KILLED" == "true" ]; then
        DIAGNOSTICO_EXTRA="El servidor se quedó sin memoria RAM disponible y el sistema operativo forzó la terminación del contenedor (OOM Killed)."
    elif [ "$PREV_STATUS" == "exited" ]; then
        if [ "$EXIT_CODE" == "0" ]; then
            DIAGNOSTICO_EXTRA="El contenedor se detuvo de forma limpia (Exit 0)."
        elif [ "$EXIT_CODE" == "137" ] || [ "$EXIT_CODE" == "255" ]; then
            DIAGNOSTICO_EXTRA="El contenedor fue forzado a cerrarse abruptamente (Exit $EXIT_CODE)."
        else
            DIAGNOSTICO_EXTRA="El contenedor colapsó por un error interno crítico de la aplicación (Exit $EXIT_CODE)."
        fi
    elif [ "$PREV_STATUS" == "running" ]; then
        DIAGNOSTICO_EXTRA="El contenedor sigue encendido eléctricamente, pero sus procesos internos o sockets de red dejaron de responder a las pruebas de salud."
    else
        DIAGNOSTICO_EXTRA="El contenedor se encontraba en un estado inestable no catalogado: $PREV_STATUS."
    fi

    echo "[$(date +"%Y-%m-%d %H:%M:%S")] 🚨 INCIDENTE DETECTADO: Contenedor [$CONTAINER] fuera de servicio. Redactando reporte..."

    {
        echo "=================================================="
        echo " REPORTE DE INCIDENCIA - CINEMAN"
        echo "=================================================="
        echo "FECHA Y HORA : $DISPLAY_DATE $DISPLAY_TIME"
        echo "CONTENEDOR   : $CONTAINER"
        echo "COMPONENTE   : $COMPONENT"
        echo "NIVEL RIESGO : $RIESGO_HUMANO"
        echo "--------------------------------------------------"
        echo "1. ¿QUÉ FALLÓ EXACTAMENTE?"
        echo "   El watchdog detectó una anomalía mediante la métrica: $RECOVERY_METHOD."
        echo "   - Estado del contenedor al fallar   : [$PREV_STATUS]"
        echo "   - Código de salida (Exit Code)      : [$EXIT_CODE]"
        echo "   - Inicializaciones previas         : $RESTART_COUNT reinicios automáticos."
        echo "   - Última vez que estuvo activo      : $UPTIME_STR"
        echo ""
        echo "2. DIAGNÓSTICO (¿POR QUÉ PASÓ?)"
        echo "   $FAIL_REASON"
        echo "   *Análisis Forense:* $DIAGNOSTICO_EXTRA"
        echo ""
        echo "3. PROTOCOLO DE RECUPERACIÓN (ACCIONES TOMADAS)"
    } > "$REPORT_FILE"

    local SERVICE_NAME=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.service"}}' "$CONTAINER" 2>/dev/null)
    if [ -z "$SERVICE_NAME" ]; then
        case "$CONTAINER" in
            "cineman_frontend") SERVICE_NAME="frontend" ;;
            "cineman_nginx")    SERVICE_NAME="nginx" ;;
            "cineman_backend")  SERVICE_NAME="backend" ;;
            "cineman_mysql")    SERVICE_NAME="mysql" ;;
        esac
    fi

    if [ "$SERVICE_NAME" == "frontend" ] || [ "$SERVICE_NAME" == "backend" ]; then
        echo "   -> Iniciando recreación inmutable desde Docker Compose..." >> "$REPORT_FILE"
        echo "[$(date +"%Y-%m-%d %H:%M:%S")] 🔄 Recreando contenedor inmutable: $SERVICE_NAME"
        docker compose up -d --force-recreate "$SERVICE_NAME" >> "$REPORT_FILE" 2>&1
    else
        if [ "$PREV_STATUS" == "running" ]; then
            echo "   -> Contenedor encendido pero irresponsivo. Ejecutando reinicio estándar..." >> "$REPORT_FILE"
            echo "[$(date +"%Y-%m-%d %H:%M:%S")] 🔄 Reiniciando servicio estándar: $CONTAINER"
            docker restart "$CONTAINER" >> "$REPORT_FILE" 2>&1
        else
            echo "   -> Contenedor apagado. Iniciando servicio estándar..." >> "$REPORT_FILE"
            echo "[$(date +"%Y-%m-%d %H:%M:%S")] 🔄 Encendiendo servicio estándar: $CONTAINER"
            docker start "$CONTAINER" >> "$REPORT_FILE" 2>&1
        fi
    fi
    
    sleep 10

    local IS_RECOVERED="false"

    case "$RECOVERY_METHOD" in
        HTTP_FRONT)
            for i in {1..5}; do
                local CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost)
                if [[ "$CODE" =~ ^[1-5][0-9]{2}$ ]]; then
                    IS_RECOVERED="true"
                    break
                fi
                sleep 2
            done
            ;;
        HTTP_NGINX)
            for i in {1..5}; do
                local CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:81)
                if [[ "$CODE" =~ ^[1-5][0-9]{2}$ ]]; then
                    IS_RECOVERED="true"
                    break
                fi
                sleep 2
            done
            ;;
        APACHE)
            for i in {1..5}; do
                if docker exec "$CONTAINER" pgrep apache2 > /dev/null 2>&1; then
                    IS_RECOVERED="true"
                    break
                fi
                sleep 2
            done
            ;;
        MYSQL)
            for i in {1..5}; do
                if docker exec "$CONTAINER" mysqladmin ping -h localhost -u root -p"${DB_ROOT_PASSWORD}" > /dev/null 2>&1; then
                    IS_RECOVERED="true"
                    break
                fi
                sleep 2
            done
            ;;
    esac

    local FINAL_STATUS=""
    local EMAIL_CONTENT=""

    echo "" >> "$REPORT_FILE"
    echo "4. EVALUACIÓN POST-REMEDICIÓN:" >> "$REPORT_FILE"

    if [ "$IS_RECOVERED" == "true" ]; then
        FINAL_STATUS="$RECOVERY_RISK_LEVEL"
        STATES[$CONTAINER]="OK"
        echo "   [ ✅ RECUPERADO ] El contenedor respondió con éxito a las pruebas tras la acción automática." >> "$REPORT_FILE"
        echo "[$(date +"%Y-%m-%d %H:%M:%S")] ✅ RECUPERACIÓN COMPLETA: El componente $COMPONENT ha sido restablecido."
        EMAIL_CONTENT="Se detectó una anomalía temporal en $COMPONENT, pero el sistema estabilizó el contenedor. Revisa el reporte adjunto."
    else
        FINAL_STATUS="ERROR"
        STATES[$CONTAINER]="DOWN"
        echo "   [ ❌ CRÍTICO ] El intento de mitigación falló. El servicio no responde y requiere intervención manual humana urgente." >> "$REPORT_FILE"
        echo "[$(date +"%Y-%m-%d %H:%M:%S")] ❌ FALLA CRÍTICA: La mitigación automática falló. El componente $COMPONENT sigue inactivo."
        EMAIL_CONTENT="Falla crítica en $COMPONENT. El sistema intentó recuperar el servicio pero continúa sin responder. Se requiere intervención humana inmediata."
    fi

    echo "==================================================" >> "$REPORT_FILE"

    echo "[$(date +"%Y-%m-%d %H:%M:%S")] 📧 Despachando notificación de alerta vía correo electrónico..."
    if bash "$NOTIFIER_SCRIPT" \
        -t "Alerta: $COMPONENT" \
        -c "$EMAIL_CONTENT" \
        -tpl "default" \
        -d "$DISPLAY_DATE" \
        -tm "$DISPLAY_TIME" \
        -s "$FINAL_STATUS" \
        -ct "$CONTAINER" \
        -a "$REPORT_FILE" > /dev/null 2>&1; then
        
        echo "[$(date +"%Y-%m-%d %H:%M:%S")] ✅ Correo enviado correctamente."
    else
        echo "[$(date +"%Y-%m-%d %H:%M:%S")] ⚠️ No se pudo enviar la notificación por correo."
    fi

    if [ "$IS_RECOVERED" == "false" ]; then
        echo "[$(date +"%Y-%m-%d %H:%M:%S")] 🛑 Deteniendo el Watchdog debido a error de recuperación persistente."
        exit 1
    fi
}

get_failure_reason() {
    local CONTAINER=$1
    local SPECIFIC_REASON=$2
    if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null)" != "true" ]; then
        echo "El contenedor se encuentra completamente apagado del ecosistema virtual."
    else
        echo "El contenedor se mantiene encendido a nivel Docker, pero $SPECIFIC_REASON"
    fi
}

check_container_is_running() {
    local CONTAINER=$1
    if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null)" != "true" ]; then
        return 1
    fi
    return 0
}

check_frontend() {
    if ! check_container_is_running "$FRONT_CONTAINER"; then
        REASON=$(get_failure_reason "$FRONT_CONTAINER" "está completamente apagado.")
        handle_incident "$FRONT_CONTAINER" "Frontend (Web)" "$REASON" "HTTP_FRONT" "SUCCESS"
        return
    fi

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost)
    
    if [[ "$HTTP_CODE" =~ ^[1-5][0-9]{2}$ ]]; then
        STATES[$FRONT_CONTAINER]="OK"
        return
    fi
        
    sleep 3
    HTTP_CODE_RETRY=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost)
    if [[ ! "$HTTP_CODE_RETRY" =~ ^[1-5][0-9]{2}$ ]]; then
        if [ "${STATES[$FRONT_CONTAINER]}" == "OK" ]; then
            REASON=$(get_failure_reason "$FRONT_CONTAINER" "la conexión fue rechazada o superó el tiempo de espera (Código HTTP: $HTTP_CODE).")
            handle_incident "$FRONT_CONTAINER" "Frontend (Web)" "$REASON" "HTTP_FRONT" "SUCCESS"
        fi
    fi
}

check_nginx() {
    if ! check_container_is_running "$NGINX_CONTAINER"; then
        REASON=$(get_failure_reason "$NGINX_CONTAINER" "está completamente apagado.")
        handle_incident "$NGINX_CONTAINER" "Nginx (Proxy)" "$REASON" "HTTP_NGINX" "SUCCESS"
        return
    fi

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:81)
    
    if [[ "$HTTP_CODE" =~ ^[1-5][0-9]{2}$ ]]; then
        STATES[$NGINX_CONTAINER]="OK"
        return
    fi
        
    sleep 3
    HTTP_CODE_RETRY=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:81)
    if [[ ! "$HTTP_CODE_RETRY" =~ ^[1-5][0-9]{2}$ ]]; then
        if [ "${STATES[$NGINX_CONTAINER]}" == "OK" ]; then
            REASON=$(get_failure_reason "$NGINX_CONTAINER" "la conexión fue rechazada o superó el tiempo de espera (Código HTTP: $HTTP_CODE).")
            handle_incident "$NGINX_CONTAINER" "Nginx (Proxy)" "$REASON" "HTTP_NGINX" "SUCCESS"
        fi
    fi
}

check_backend() {
    if ! check_container_is_running "$BACKEND_CONTAINER"; then
        REASON=$(get_failure_reason "$BACKEND_CONTAINER" "está completamente apagado.")
        handle_incident "$BACKEND_CONTAINER" "Apache2 (Backend)" "$REASON" "APACHE" "WARNING"
        return
    fi

    if ! docker exec $BACKEND_CONTAINER pgrep apache2 > /dev/null 2>&1; then
        sleep 3
        if ! docker exec $BACKEND_CONTAINER pgrep apache2 > /dev/null 2>&1; then
            if [ "${STATES[$BACKEND_CONTAINER]}" == "OK" ]; then
                REASON=$(get_failure_reason "$BACKEND_CONTAINER" "el hilo principal del proceso Apache2 colapsó o fue terminado internamente.")
                handle_incident "$BACKEND_CONTAINER" "Apache2 (Backend)" "$REASON" "APACHE" "WARNING"
            fi
        fi
    else
        STATES[$BACKEND_CONTAINER]="OK"
    fi
}

check_mysql() {
    if ! check_container_is_running "$MYSQL_CONTAINER"; then
        REASON=$(get_failure_reason "$MYSQL_CONTAINER" "está completamente apagado.")
        handle_incident "$MYSQL_CONTAINER" "MySQL (Database)" "$REASON" "MYSQL" "WARNING"
        return
    fi

    if ! docker exec $MYSQL_CONTAINER mysqladmin ping -h localhost -u root -p"${DB_ROOT_PASSWORD}" > /dev/null 2>&1; then
        sleep 3
        if ! docker exec $MYSQL_CONTAINER mysqladmin ping -h localhost -u root -p"${DB_ROOT_PASSWORD}" > /dev/null 2>&1; then
            if [ "${STATES[$MYSQL_CONTAINER]}" == "OK" ]; then
                REASON=$(get_failure_reason "$MYSQL_CONTAINER" "el motor de base de datos rechazó el ping administrativo o cerró sus conexiones.")
                handle_incident "$MYSQL_CONTAINER" "MySQL (Database)" "$REASON" "MYSQL" "WARNING"
            fi
        fi
    else
        STATES[$MYSQL_CONTAINER]="OK"
    fi
}

echo "[$(date +"%Y-%m-%d %H:%M:%S")] 🐕 Vigilancia Activa"

sleep 10

while true; do
    check_mysql
    check_backend
    check_nginx
    check_frontend
    
    sleep 10
done