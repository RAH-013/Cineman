#!/bin/bash

URL_APACHE="http://localhost:8000" 
CONTAINER_NAME="cineman_backend"

echo "[$(date)] Verificando la salud de Apache2..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$URL_APACHE")

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 302 ] || [ "$HTTP_STATUS" -eq 404 ]; then
    echo "[$(date)] OK: Apache2 está respondiendo correctamente (HTTP $HTTP_STATUS)."
else
    echo "[$(date)] ALERTA: Apache2 no responde o dio error crítico (HTTP $HTTP_STATUS)."
    echo "[$(date)] Reiniciando el servicio Apache2 dentro del contenedor..."
    
    docker exec $CONTAINER_NAME service apache2 restart
    
    echo "[$(date)] Esperando a que Apache2 inicialice sus servicios..."
    sleep 7
    
    NEW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$URL_APACHE")
    
    if [ "$NEW_STATUS" -eq 200 ] || [ "$NEW_STATUS" -eq 302 ] || [ "$NEW_STATUS" -eq 404 ]; then
        echo "[$(date)] ÉXITO: Apache2 ha sido restaurado y vuelve a responder (HTTP $NEW_STATUS)."
    else
        echo "[$(date)] ERROR: El reinicio falló o tarda más de lo esperado (HTTP $NEW_STATUS)."
        echo "Revisar logs detallados con: docker logs $CONTAINER_NAME"
    fi
fi
