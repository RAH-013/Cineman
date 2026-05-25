# Guía del Entorno

Esta sección detalla los pasos necesarios para desplegar el ecosistema completo de Cineman utilizando Docker y nuestra suite de automatización Bash.

## Requisitos Previos

Asegúrate de contar con lo siguiente antes de iniciar:

- **Docker & Docker Compose**: El motor principal de orquestación.
- **Linux Environment**: Optimizado para kernels Linux (soporte para scripts `.sh`).
- **Permisos de Administrador**: Necesarios para la configuración de redes y firewall.

## Despliegue con Docker

El proyecto utiliza un archivo `docker-compose.yml` central que coordina 4 servicios clave:

1. **Frontend**: Aplicación React servida en el puerto `80`.
2. **Nginx**: Gateway de seguridad en el puerto `81`.
3. **Backend**: API REST en PHP (Apache).
4. **MySQL**: Base de Datos relacional en el puerto `3306`.

### Comandos Rápidos

Si prefieres usar Docker directamente:

```bash
docker compose up -d --build
```

## Suite de Automatización (Scripts)

Para facilitar la vida del administrador, hemos centralizado las operaciones en la carpeta `/scripts`.

| Script        | Propósito                                                            | Uso                              |
| :------------ | :------------------------------------------------------------------- | :------------------------------- |
| `Iniciar.sh`  | Despliegue total, configuración de firewall y arranque del Watchdog. | `sudo ./scripts/Iniciar.sh`      |
| `Detener.sh`  | Apagado seguro. Usa `-a` para una limpieza total de volúmenes.       | `sudo ./scripts/Detener.sh -a`   |
| `Watchdog.sh` | Proceso en segundo plano que vigila la salud de los contenedores.    | Automático mediante `Iniciar.sh` |
| `Firewall.sh` | Configura políticas de UFW para proteger los puertos del sistema.    | Interno                          |

> **Tip de Seguridad:** Siempre revisa los logs del Watchdog en `/logs/watchdog_sys.log` para auditar intentos de recuperación automática.
