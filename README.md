# Cineman - Sistema de Gestión Cinematográfica

**Cineman** es una plataforma integral para la gestión de un cine, diseñada bajo una arquitectura moderna, escalable y completamente containerizada. Permite a los usuarios explorar una cartelera de películas, seleccionar funciones y adquirir boletos de forma interactiva, mientras ofrece herramientas administrativas robustas para la gestión de contenidos y el monitoreo del sistema.

Este proyecto evoluciona el clásico stack **LAMP** (Linux, Apache, MySQL, PHP) hacia un entorno de microservicios orquestados con **Docker**, garantizando consistencia entre entornos de desarrollo y producción.

---

## Tecnologías Utilizadas

| Componente          | Tecnología       | Descripción                                               |
| :------------------ | :--------------- | :-------------------------------------------------------- |
| **Frontend**        | React + Vite     | SPA moderna con carga optimizada y componentes reactivos. |
| **Backend**         | PHP (PSR-4)      | API RESTful modular y escalable.                          |
| **Base de Datos**   | MySQL 8.4        | Almacenamiento relacional persistente.                    |
| **Proxy / Gateway** | Nginx            | Proxy inverso con políticas de Rate Limiting y seguridad. |
| **Infraestructura** | Docker & Compose | Orquestación completa de servicios.                       |
| **Seguridad**       | JWT              | Autenticación basada en JSON Web Tokens.                  |
| **Automatización**  | Bash Scripts     | Scripts para despliegue, firewall y watchdog.             |

---

## Estructura del Proyecto

```text
Cineman/
├── backend/                # Lógica de negocio (PHP)
│   ├── src/                # Código fuente (Controllers, Models, Routes, Utils)
│   ├── public/             # Punto de entrada de la API e index.php
│   └── scripts/            # Utilidades de DB (Backup, Restore, Seeders)
├── frontend/               # Interfaz de usuario (React + Vite)
│   ├── src/                # Componentes, Hooks, Contextos, Pages y Utils
│   └── public/             # Activos estáticos y patrones de diseño
├── docs/                   # Documentación técnica (Con estructura lista para Vitepress)
│   ├── index.md            # Home de la documentación
│   ├── guia-entorno.md     # Guía de despliegue
│   ├── manual-usuario.md   # Manual visual para el usuario
│   └── ...                 # Documentación de API y Scripts
├── docker/                 # Configuraciones de contenedores (Nginx, Apache, MySQL)
│   ├── mysql/init/         # Scripts SQL de inicialización de la base de datos
│   └── ...                 # Dockerfiles y archivos de configuración
├── scripts/                # Scripts de automatización global
│   ├── Iniciar.sh          # Despliegue completo y configuración inicial
│   ├── Detener.sh          # Apagado, limpieza y restauración de firewall
│   ├── Watchdog.sh         # Monitoreo de salud y autocuración
│   ├── Firewall.sh         # Configuración de reglas UFW y Rate Limit
│   ├── Notificador.sh      # Motor de envío de alertas por correo
│   └── template/           # Plantillas HTML y assets para correos
└── docker-compose.yml      # Orquestación de servicios containerizados
```

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

- **Docker Desktop** (o Docker Engine en Linux) v20.10+
- **Docker Compose** v2.0+
- **Git**
- **Navegador Web** (Chrome, Firefox, Edge)

> **Nota para usuarios de Linux:** Asegúrate de tener permisos de ejecución para los archivos `.sh` en la carpeta `scripts/`.

---

## Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu máquina local:

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/cineman.git
cd cineman
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en los requerimientos del `docker-compose.yml`:

```env
# Database Configuration
DB_ROOT_PASSWORD=root_password
DB_DATABASE=cineman_db
DB_USER=cineman_user
DB_PASSWORD=cineman_password

# Security
JWT_SECRET=tu_secreto_super_seguro_aqui
```

### 3. Levantar el entorno

Utiliza el script automatizado para construir las imágenes, configurar el firewall y levantar los contenedores:

```bash
chmod +x scripts/*.sh
./scripts/Iniciar.sh
```

El script se encargará de:

1. Configurar las reglas del firewall.
2. Construir y levantar los contenedores en segundo plano.
3. Iniciar el **Watchdog** para monitoreo.

---

## Scripts de Mantenimiento

El proyecto incluye una suite de scripts en la carpeta `scripts/` para facilitar la administración:

- **`./scripts/Iniciar.sh`**: Despliegue completo con validación de estado.
- **`./scripts/Detener.sh`**: Detiene contenedores. Opciones:
  - `-a` o `--all`: Limpieza total (incluye base de datos y logs).
- **`./scripts/Watchdog.sh`**: Monitoriza la salud de los servicios y recupera contenedores caídos automáticamente.

---

## Roles y Permisos

- **Usuario:** Consulta cartelera y compra boletos (requiere login).
- **Manager:** Gestión de películas y programación de funciones.
- **Admin:** Control total + ejecución de backups y auditoría de logs.

---

## Autores

- **DIEGO2907** - [Perfil de GitHub](https://www.github.com/Diego2907)
- **FER-10K** - [Perfil de GitHub](https://github.com/Fer10K)
- **RAH-013** - [Perfil de GitHub](https://www.github.com/RAH-013)
- **ROM-332** - [Perfil de GitHub](https://github.com/Rom322)

---

Hecho con ❤️.
