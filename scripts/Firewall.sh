#!/bin/bash

# ==============================================================================
# SCRIPT DE CONFIGURACIÓN DE FIREWALL PARA CINEMAN
# ==============================================================================

if [ "$EUID" -ne 0 ]; then
  echo "❌ Por favor, ejecuta este script como root o usando sudo."
  exit 1
fi

ufw --force reset

ufw default deny incoming
ufw default allow outgoing

ufw limit 80/tcp comment 'Cineman HTTP con Rate Limit'

ufw limit 22/tcp comment 'SSH por defecto con Rate Limit'

ufw --force enable

echo "--------------------------------------------------------"
echo "✅ Firewall configurado"
echo "--------------------------------------------------------"