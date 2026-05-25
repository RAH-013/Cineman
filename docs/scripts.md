# Automatización y Scripts

El ecosistema de Cineman depende de una suite de scripts Bash diseñados para automatizar tareas críticas de infraestructura, seguridad y monitoreo.

## Scripts Globales (`/scripts`)

Estos scripts gestionan el ciclo de vida del proyecto y la seguridad del host.

### 1. `Iniciar.sh`

Es el punto de entrada principal. Realiza las siguientes acciones:

- Valida permisos de administrador (sudo).
- Ejecuta `Firewall.sh` para asegurar los puertos.
- Levanta los contenedores vía `docker compose`.
- Espera activamente a que todos los servicios reporten un estado "Running".
- Inicia el **Watchdog** en segundo plano (`nohup`).

### 2. `Detener.sh`

Gestiona el apagado controlado del sistema.

- **Uso estándar:** Detiene y elimina contenedores y redes.
- **Flags:**
  - `-a` | `--all`: Limpieza profunda. Elimina logs, backups de base de datos y volúmenes de persistencia.
  - `-v` | `--volumes`: Elimina solo los volúmenes de datos.
- Restablece las políticas del firewall a su estado por defecto.

### 3. `Watchdog.sh`

Un "perro guardián" que corre en bucle infinito (cada 10s):

- Monitorea la salud HTTP del Frontend y Nginx.
- Verifica que los procesos Apache y MySQL estén vivos dentro de sus contenedores.
- **Autocuración:** Si un servicio falla, intenta recrear el contenedor automáticamente.
- **Reportes:** Genera un análisis forense en `/logs` y envía alertas por correo.

### 4. `Notificador.sh`

Motor de notificaciones por correo electrónico (vía `msmtp`):

- Utiliza plantillas HTML personalizables (`/template`).
- Soporta el envío de archivos adjuntos (logs de error).
- Inyecta imágenes en Base64 para evitar bloqueos por parte de clientes de correo.

### 5. `Firewall.sh`

Configura el cortafuegos `ufw` del host:

- Aplica **Rate Limiting** en el puerto 80 (HTTP) y 22 (SSH).
- Deniega todo el tráfico entrante no explícitamente permitido.

---

## Scripts de Backend (`/backend/scripts`)

Utilidades específicas para la gestión de datos.

- **`db_backup.sh`**: Genera un volcado `.sql` de la base de datos actual.
- **`db_restore.sh`**: Restaura un respaldo previo hacia el contenedor de MySQL.
- **`seed_users.sh`**: Script para poblar la base de datos con usuarios de prueba y roles predefinidos.
