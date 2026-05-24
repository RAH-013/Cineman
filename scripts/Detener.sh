#!/bin/bash

# ==============================================================================
# CINEMAN - DETENER Y LIMPIAR ENTORNO
# ==============================================================================

clear

if [ "$EUID" -ne 0 ]; then
  echo "🔐 Este script requiere privilegios de administrador."
  exec sudo "$0" "$@"
  exit 1
fi

CONTAINERS=(
  cineman_frontend
  cineman_nginx
  cineman_backend
  cineman_mysql
)

VOLUMES=(
  cineman_mysql_data
)

NETWORKS=(
  cineman_default
)

REMOVE_CONTAINERS=true
REMOVE_VOLUMES=false
REMOVE_NETWORKS=true

case "$1" in
  -a|--all)
    REMOVE_CONTAINERS=true
    REMOVE_VOLUMES=true
    REMOVE_NETWORKS=true
    rm -rf logs/
    rm -rf backend/backups/
    echo "⚠️ MODO ALL: Se eliminará todo, incluyendo la base de datos."
    sleep 2
    ;;
  -v|--volumes)
    REMOVE_CONTAINERS=false
    REMOVE_VOLUMES=true
    REMOVE_NETWORKS=false
    ;;
  -n|--networks)
    REMOVE_CONTAINERS=false
    REMOVE_VOLUMES=false
    REMOVE_NETWORKS=true
    ;;
  -c|--containers)
    REMOVE_CONTAINERS=true
    REMOVE_VOLUMES=false
    REMOVE_NETWORKS=false
    ;;
esac

echo ""
echo "========================================================"
echo "🛑 INICIANDO PROCESO DE APAGADO..."
echo "========================================================"
echo ""

# =========================
# 1. DETENER WATCHDOG
# =========================
echo "🐕 Deteniendo sistema de monitoreo (Watchdog)..."
if pkill -f "Watchdog.sh" 2>/dev/null; then
    echo "   ✅ Watchdog detenido correctamente."
else
    echo "   ℹ️ El Watchdog no estaba en ejecución."
fi
echo ""

# =========================
# 2. CONTENEDORES
# =========================
if [ "$REMOVE_CONTAINERS" = true ]; then
  echo "📦 Deteniendo contenedores de Cineman..."
  docker stop "${CONTAINERS[@]}" >/dev/null 2>&1
  
  echo "🗑️ Eliminando contenedores de Cineman..."
  docker rm "${CONTAINERS[@]}" >/dev/null 2>&1
  echo "   ✅ Contenedores eliminados."
  echo ""
fi

# =========================
# 3. REDES
# =========================
if [ "$REMOVE_NETWORKS" = true ]; then
  echo "🌐 Eliminando redes de Cineman..."
  docker network rm "${NETWORKS[@]}" >/dev/null 2>&1
  echo "   ✅ Redes eliminadas."
  echo ""
fi

# =========================
# 4. VOLÚMENES
# =========================
if [ "$REMOVE_VOLUMES" = true ]; then
  echo "💾 Eliminando volúmenes (Base de Datos) de Cineman..."
  docker volume rm "${VOLUMES[@]}" >/dev/null 2>&1
  echo "   ✅ Volúmenes eliminados."
  echo ""
fi

# =========================
# 5. RESTAURAR FIREWALL
# =========================
echo "🛡️ Restaurando políticas normales del equipo (Firewall)..."
ufw --force reset >/dev/null 2>&1
ufw default deny incoming >/dev/null 2>&1
ufw default allow outgoing >/dev/null 2>&1

ufw --force enable >/dev/null 2>&1
echo "   ✅ Políticas restablecidas."
echo ""

echo "========================================================"
echo "✅ Entorno de Cineman desmontado correctamente."
echo "========================================================"
echo ""