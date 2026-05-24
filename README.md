# Proyecto CINEMAN

Dicho proyecto consiste en un sitio web simulando un cine real. En él, el usuario podrá ver un catálogo de películas y seleccionar la de su preferencia; es importante aclarar que solo podrá comprar boletos si está registrado en el sistema. 

Todo este sistema está construido sobre una evolución moderna y escalable del clásico stack **LAMP** (Linux, Apache, MySQL, PHP), utilizando una arquitectura orientada a servicios y completamente containerizada con **Docker**.

---

## Arquitectura y Tecnologías

El proyecto se compone de múltiples contenedores orquestados para trabajar en conjunto:

* **Frontend (Cliente):** Interfaz de usuario dinámica (SPA) y de carga rápida construida con **React y Vite**.
* **Backend (API REST):** Desarrollado en **PHP** y servido a través de **Apache**. Actúa como el núcleo de la lógica de negocio, procesando las solicitudes de manera segura.
* **Base de Datos:** Un contenedor dedicado de **MySQL** que almacena de forma relacional toda la información (usuarios, películas, funciones, asientos y transacciones).
* **Gateway / Seguridad:** Implementación de **Nginx** como proxy inverso frente a la API, encargado de aplicar políticas de **Rate Limiting** para prevenir abusos en los endpoints y ataques DDoS.

---

## Características y Roles del Sistema

El sistema cuenta con un control de acceso basado en roles (RBAC) para dividir las funcionalidades:

### 🍿 Para Usuarios (Clientes)
* **Catálogo de Películas:** Exploración de la cartelera actual con detalles de cada cinta.
* **Sistema de Autenticación:** Registro e inicio de sesión obligatorios para realizar transacciones.
* **Compra de Boletos:** Flujo completo para adquirir entradas para funciones específicas.
* **Selección de Asientos:** Interfaz visual interactiva para elegir los asientos disponibles en la sala.
* **Mis Boletos:** Panel personal para visualizar el historial de compras y los boletos adquiridos.

### 🎬 Para Managers (Gerentes)
* **Gestión de Películas (CRUD):** Control total sobre el catálogo de películas (agregar, editar, visualizar y eliminar títulos).
* **Gestión de Funciones (CRUD):** Programación de horarios, asignación de salas y administración de las funciones disponibles en cartelera. 

### 🛠️ Para Administradores (IT / SysAdmin)
* *Incluye todos los permisos del rol Manager, además de:*
* **Ejecución de Scripts del Sistema:** Capacidad para disparar tareas críticas desde el panel, como copias de seguridad (backups) de la base de datos y scripts para el ingreso de usuarios.
* **Monitorización:** Acceso a un visor de logs del sistema para auditar errores, revisar el tráfico y monitorear la salud de la aplicación.

---

## Variables de Entorno

Para correr esta API, se requiere definir las siguientes variables de entorno:

`DB_HOST`
`DB_ROOT_PASSWORD`
`DB_DATABASE`
`DB_USER`
`DB_PASSWORD`

`JWT_SECRET`

## Probar el Watchdog

Existen tres niveles de estado: Bajo, Medio, Alto. Segun el peligro de cada error se clasifica.

Para conseguir un error bajo se puede detener nginx mediante este comando: sudo docker stop cineman_nginx

Para conseguir uno medio, se puede detener la base de datos con: sudo docker stop cineman_mysql

Para conseguir uno alto (error que el script no puede manejar solo), podemos cambiar el nombre del index.html del frontend en tiempo de ejecución.

## Autores
- [@DIEGO2907](https://www.github.com/Diego2907)
- [@FER-10K](https://github.com/Fer10K)
- [@RAH-013](https://www.github.com/RAH-013)
- [@ROM-332](https://github.com/Rom322)