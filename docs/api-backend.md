# API Backend

El corazón de Cineman es una API RESTful desarrollada en **PHP** siguiendo los estándares PSR y una arquitectura modular.

## Arquitectura del Directorio `backend/`

- **`src/Controllers/`**: Manejo de la lógica de entrada y respuesta.
- **`src/Models/`**: Interacción directa con la base de datos MySQL vía PDO.
- **`src/Routes/`**: Definición de endpoints y segmentación de rutas.
- **`src/Middleware/`**: Capas de autenticación JWT y registro de logs forenses.

## Configuración (.env)

El backend requiere las siguientes variables de entorno para operar:

- `DB_HOST`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`: Credenciales de acceso a datos.
- `JWT_SECRET`: Clave maestra para la firma de tokens de sesión.

## Endpoints Principales

| Recurso              | Método   | Descripción                              | Acceso  |
| :------------------- | :------- | :--------------------------------------- | :------ |
| `/api/users/login`   | POST     | Autenticación y generación de JWT.       | Público |
| `/api/movies`        | GET      | Listado completo de la cartelera.        | Público |
| `/api/tickets/buy`   | POST     | Procesamiento de compra de boletos.      | Usuario |
| `/api/showtimes`     | POST/PUT | Gestión de horarios y salas.             | Manager |
| `/api/system/backup` | POST     | Dispara una copia de seguridad de la DB. | Admin   |
| `/api/chat/message`  | POST     | Interacción con el asistente virtual.    | Público |

### Flujo de Datos

1. El cliente envía una petición con un `Authorization: Bearer <token>`.
2. El **Middleware de Auth** valida el JWT.
3. El **Router** dirige la petición al Controlador correspondiente.
4. El **Modelo** ejecuta la consulta y el Controlador devuelve un JSON estandarizado.
