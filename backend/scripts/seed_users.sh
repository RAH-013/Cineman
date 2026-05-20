#!/bin/bash

set -euo pipefail

DB_HOST="${DB_HOST}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_DATABASE}"

TOTAL=15

NAMES=("Arisbeth" "Carlos" "Denisse" "Diego" "Gabriela" "Ian" "Jesus" "Jose" "Lisandra" "Luis" "Luis" "Manuel" "Manuel" "Romina" "Sergio")

LASTNAMES=("Cervantes" "Campos" "Solorzano" "Verduzco" "Guzman" "Martinez" "Aguilar" "Moreno" "Duran" "Calva" "Avina" "Alcaraz" "Castillo" "Fajardo" "Velasco")

ROLES=("admin" "manager" "user")

generate_uuid() {
  cat /proc/sys/kernel/random/uuid
}

echo "Insertando usuarios..."

for i in $(seq 0 $((TOTAL - 1)))
do
  ID=$(generate_uuid)

  NAME=${NAMES[$i]}
  LASTNAME=${LASTNAMES[$i]}
  ROLE=${ROLES[$((i % ${#ROLES[@]}))]}

  EMAIL="${NAME,,}.${LASTNAME,,}${i}@cineman.test"
  PASSWORD_HASH=$(openssl passwd -6 "password123")

  EXISTS=$(mysql \
    -h "$DB_HOST" \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    -D "$DB_NAME" \
    -N -s \
    -e "SELECT COUNT(*) FROM users WHERE email='$EMAIL';"
  )

  if [ "$EXISTS" -gt 0 ]; then
    echo "Omitido: $EMAIL ya existe"
    continue
  fi

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

echo "Seed completado."