# Manual de Red - Proyecto Cineman

## Este documento detalla la arquitectura de red, la configuración de puertos y las políticas de seguridad aplicadas en el ecosistema de Cineman.

## 1. Arquitectura de Red

Cineman utiliza una arquitectura de microservicios orquestada mediante **Docker Compose**. La infraestructura se divide en dos capas principales:

1.  **Red Externa (Host Layer)**: La interfaz entre el servidor físico y el mundo exterior (o red local). Está protegida por un firewall `ufw` que limita el acceso solo a los servicios esenciales.
2.  **Red Interna (Docker Bridge)**: Una red virtual aislada donde los contenedores se comunican entre sí utilizando nombres de servicio DNS (ej. el backend se comunica con la base de datos usando el host `mysql`).

---

## 2. Direccionamiento e Identificación

| Componente          | Nombre del Contenedor | Hostname Interno | IP Host (Despliegue) |
| :------------------ | :-------------------- | :--------------- | :------------------- |
| **Frontend**        | `cineman_frontend`    | `frontend`       | `localhost:80`       |
| **Nginx (Gateway)** | `cineman_nginx`       | `nginx`          | `localhost:81`       |
| **Backend (API)**   | `cineman_backend`     | `backend`        | N/A (Interno)        |
| **Base de Datos**   | `cineman_mysql`       | `mysql`          | `localhost:3306`     |

---

## 3. Tabla de Puertos y Flujos

| Servicio     | Puerto Host | Puerto Contenedor | Protocolo | Tipo de Acceso      | Función                                 |
| :----------- | :---------- | :---------------- | :-------- | :------------------ | :-------------------------------------- |
| **Frontend** | 80          | 5173              | TCP       | Público (UFW)       | Servidor de desarrollo Vite / App React |
| **Nginx**    | 81          | 80                | TCP       | Privado / Monitoreo | Gateway de seguridad y Rate Limiting    |
| **Backend**  | -           | 80                | TCP       | Interno             | API REST en PHP (Apache2)               |
| **MySQL**    | 3306        | 3306              | TCP       | Admin (Restringido) | Gestión de datos persistentes           |
| **SSH**      | 22          | -                 | TCP       | Admin (UFW)         | Acceso remoto al sistema host           |

## 4. Seguridad y Firewall (UFW)

El script `Firewall.sh` gestiona la seguridad perimetral del host. Se aplican las siguientes políticas:

- **Política por defecto**: `DENY INCOMING`, `ALLOW OUTGOING`.
- **Puerto 80 (HTTP)**: Permitido con **Rate Limiting**. Es la entrada principal para los usuarios del Frontend.
- **Puerto 22 (SSH)**: Permitido con **Rate Limiting** para prevenir ataques de fuerza bruta.
- **Aislamiento**: Puertos como el `81` (Nginx) y `3306` (MySQL) están expuestos en el host por Docker pero no están abiertos explícitamente en el Firewall para el tráfico externo, permitiendo solo acceso local o administrativo controlado.

## 5. Flujo de Comunicaciones

### 5.1 Tráfico de Usuario Final

1.  El usuario accede a `http://<IP_SERVIDOR>:80`.
2.  El **Frontend (Vite)** sirve la aplicación React.
3.  Las peticiones a la API se realizan a la ruta `/api`.
4.  Vite actúa como un proxy inverso interno, redirigiendo `/api/*` hacia `http://backend:80/api/*` dentro de la red de Docker.

### 5.2 Tráfico de Monitoreo y Gateway

1.  El sistema de salud (**Watchdog**) valida el estado de la API a través de `http://localhost:81`.
2.  **Nginx** recibe la petición en el puerto 80 (interno) y aplica reglas de seguridad adicionales (como `limit_req`).
3.  Nginx redirige el tráfico al **Backend** (`http://backend:80/api`).

### 5.3 Persistencia

1.  El **Backend** se conecta a la base de datos mediante el puerto `3306` usando las credenciales definidas en el archivo `.env`.

## 6. Monitoreo de Conectividad (Watchdog)

El script `Watchdog.sh` realiza verificaciones constantes (cada 10 segundos) para asegurar que la red interna esté operativa:

- **Test HTTP Frontend**: `curl http://localhost` (Valida puerto 80).
- **Test HTTP Nginx**: `curl http://localhost:81` (Valida puerto 81).
- **Test Proceso Backend**: `pgrep apache2` (Valida que el servidor web interno responda).
- **Test Socket MySQL**: `mysqladmin ping` (Valida disponibilidad de la base de datos).

---
