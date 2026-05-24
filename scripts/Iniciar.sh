#!/bin/bash

clear

if [ "$EUID" -ne 0 ]; then
  echo "🔐 Este script requiere privilegios de administrador."
  exec sudo "$0" "$@"
  exit 1
fi

# Obtener carpeta raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR" || exit 1

# ==========================================
# GESTIÓN DEL FIREWALL
# ==========================================
if [ -f "./scripts/Firewall.sh" ]; then
    chmod +x ./scripts/Firewall.sh
    ./scripts/Firewall.sh
else
    echo "⚠️ No se encontró Firewall.sh"
fi

# ==========================================
# GESTIÓN DE LOS CONTENEDORES
# ==========================================
docker compose up -d --build

echo "⏳ Validando el estado de la infraestructura CINEMAN..."

REQUIRED_CONTAINERS=("cineman_mysql" "cineman_backend" "cineman_nginx" "cineman_frontend")

for CONTAINER in "${REQUIRED_CONTAINERS[@]}"; do
    # Bucle infinito local hasta que el contenedor específico reporte 'true' en su estado Running
    while [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null)" != "true" ]; do
        echo "🔄 Esperando a que el contenedor [$CONTAINER] esté activo..."
        sleep 1
    done
    echo "✅ Contenedor [$CONTAINER] detectado y corriendo."
done

echo "🚀 Todos los contenedores están arriba de forma segura."

# ==========================================
# GESTIÓN DEL WATCHDOG
# ==========================================
WATCHDOG_SCRIPT="./scripts/Watchdog.sh"

if [ -f "$WATCHDOG_SCRIPT" ]; then
    chmod +x "$WATCHDOG_SCRIPT"

    mkdir -p ./logs
    
    pkill -f -i "watchdog.sh" 2>/dev/null || true
    
    nohup bash "$WATCHDOG_SCRIPT" > ./logs/watchdog_sys.log 2>&1 &
    echo "🐕 Watchdog operando en segundo plano"
else
    echo "⚠️ No se encontró $WATCHDOG_SCRIPT. El entorno quedó desprotegido."
fi

IP=$(hostname -I | awk '{print $1}')

echo ""
echo "========================================================"
echo "✅ Entorno levantado!"
echo "========================================================"

echo "http://localhost"
echo "http://$IP"