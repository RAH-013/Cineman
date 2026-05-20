#!/bin/bash

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

# =========================
# CONTENEDORES
# =========================
if [ "$REMOVE_CONTAINERS" = true ]; then

  echo "Deteniendo contenedores de Cineman..."

  docker stop "${CONTAINERS[@]}" 2>/dev/null

  echo "Eliminando contenedores de Cineman..."

  docker rm "${CONTAINERS[@]}" 2>/dev/null

fi

# =========================
# VOLUMENES
# =========================
if [ "$REMOVE_VOLUMES" = true ]; then

  echo "Eliminando volúmenes de Cineman..."

  docker volume rm "${VOLUMES[@]}" 2>/dev/null

fi

# =========================
# REDES
# =========================
if [ "$REMOVE_NETWORKS" = true ]; then

  echo "Eliminando redes de Cineman..."

  docker network rm "${NETWORKS[@]}" 2>/dev/null

fi

echo "Limpieza de Cineman completada"