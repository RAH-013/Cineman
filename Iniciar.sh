#!/bin/bash

# ==============================================================================
# PROYECTO CINEMAN
# ==============================================================================

clear

if [ "$EUID" -ne 0 ]; then
  echo "🔐 Este script requiere privilegios de administrador para configurar el firewall."
  echo "Por favor, introduce tu contraseña:"
  exec sudo "$0" "$@"
  exit 1
fi

if [ -f "./Firewall.sh" ]; then
    chmod +x ./Firewall.sh
    ./Firewall.sh
else
    echo "⚠️  Aviso: No se encontró 'Firewall.sh'. Saltando paso..."
fi

docker-compose up -d --build

while [ "$(docker inspect -f '{{.State.Running}}' cineman_nginx 2>/dev/null)" != "true" ]; do
    echo "🔄 Esperando a que los contenedores esten listos..."
    sleep 0.5
done

IP=$(hostname -I | awk '{print $1}')

echo ""
echo "========================================================"
echo "✅ Entorno levantado!"
echo "========================================================"

echo ""
echo "http://localhost"
echo "http://$IP"