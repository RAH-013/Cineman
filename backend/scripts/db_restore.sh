#!/bin/bash

set -euo pipefail
# =========================================
# MODO ESTRICTO:
# -e  : aborta si un comando falla
# -u  : error si usas variables no definidas
# -o pipefail : detecta fallos en pipelines
# =========================================

# =========================
# VARIABLES DE ENTORNO DB
# =========================
DB_HOST="${DB_HOST}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_DATABASE}"

# =========================
# CONFIGURACIÓN DE DATOS
# =========================
TOTAL=15

NAMES=("Arisbeth" "Carlos" "Denisse" "Diego" "Gabriela" "Ian" "Jesus" "Jose" "Lisandra" "Luis" "Luis" "Manuel" "Manuel" "Romina" "Sergio")
LASTNAMES=("Cervantes" "Campos" "Solorzano" "Verduzco" "Guzman" "Martinez" "Aguilar" "Moreno" "Duran" "Calva" "Avina" "Alcaraz" "Castillo" "Fajardo" "Velasco")
ROLES=("admin" "manager" "user")

# =========================
# GENERADOR DE UUID
# =========================
generate_uuid() {
  cat /proc/sys/kernel/random/uuid
}

echo "Insertando usuarios..."

# =========================
# LOOP PRINCIPAL DE CARGA
# =========================
for i in $(seq 0 $((TOTAL - 1)))
do
  # -------------------------
  # GENERACIÓN DE IDENTIDAD
  # -------------------------
  ID=$(generate_uuid)

  NAME=${NAMES[$i]}
  LASTNAME=${LASTNAMES[$i]}

  # Asignación cíclica de roles
  ROLE=${ROLES[$((i % ${#ROLES[@]}))]}

  # -------------------------
  # GENERACIÓN DE EMAIL ÚNICO
  # -------------------------
  EMAIL="${NAME,,}.${LASTNAME,,}${i}@cineman.test"

  # Hash seguro de contraseña (bcrypt SHA-512)
  PASSWORD_HASH=$(openssl passwd -6 "password123")

  # -------------------------
  # VERIFICACIÓN DE DUPLICADOS
  # -------------------------
  EXISTS=$(mysql \
    -h "$DB_HOST" \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    -D "$DB_NAME" \
    -N -s \
    -e "SELECT COUNT(*) FROM users WHERE email='$EMAIL';"
  )

  # Si el usuario ya existe, se omite la inserción
  if [ "$EXISTS" -gt 0 ]; then
    echo "Omitido: $EMAIL ya existe"
    continue
  fi

  # -------------------------
  # INSERCIÓN EN BASE DE DATOS
  # -------------------------
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
INSERT INTO users (
    id,
    email,
    password,
    role
)
VALUES (
    '$ID',
    '$EMAIL',
    '$PASSWORD_HASH',
    '$ROLE'
);

INSERT INTO user_profiles (
    user_id,
    name,
    lastname,
    phone
)
VALUES (
    '$ID',
    '$NAME',
    '$LASTNAME',
    '55-0000-$((1000 + i))'
);
EOF

  echo "Creado: $EMAIL ($ROLE)"
done

# =========================
# FIN DEL PROCESO
# =========================
echo "Usuarios añadidos correctamente ✅"