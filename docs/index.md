---
layout: home

hero:
  name: Cineman
  text: Gestión Cinematográfica Pro
  tagline: Una infraestructura robusta, segura y automatizada construida sobre Docker.
  image:
    src: /logo.png
    alt: Cineman Logo
  actions:
    - theme: brand
      text: Despliegue Rápido
      link: /guia-entorno
    - theme: alt
      text: Manual de Usuario
      link: /manual-usuario
    - theme: alt
      text: Explorar API
      link: /api-backend

features:
  - title: Infraestructura Docker
    details: Orquestación completa de 4 servicios (Frontend, Backend, Proxy, DB) listos para producción.
    link: /guia-entorno
  - title: DevOps & Automatización
    details: Scripts Bash inteligentes para firewall, backups y un Watchdog de autocuración.
    link: /scripts
  - title: Backend de Alto Nivel
    details: API RESTful en PHP con arquitectura modular, autenticación JWT y seguridad perimetral.
    link: /api-backend
  - title: Interfaz Inmersiva
    details: SPA construida con React y Vite, enfocada en la experiencia de usuario y rendimiento.
    link: /interfaz-frontend
  - title: Asistente con IA
    details: Chat interactivo para recomendaciones de películas y consulta de horarios en tiempo real.
    link: /manual-usuario
---

## ⚡ Quick Start

Levanta el ecosistema completo en un solo comando (requiere Linux + Docker):

```bash
git clone https://github.com/tu-usuario/cineman.git
cd cineman
sudo ./scripts/Iniciar.sh
```

---

## 🏛️ Pilares del Proyecto

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
  <div style="padding: 1.5rem; border: 1px solid var(--vp-c-bg-soft); border-radius: 8px; background: var(--vp-c-bg-soft);">
    <h3>🛡️ Seguridad</h3>
    <p>Protección UFW, Rate Limiting en Nginx y validación estricta de JWT en cada petición.</p>
  </div>
  <div style="padding: 1.5rem; border: 1px solid var(--vp-c-bg-soft); border-radius: 8px; background: var(--vp-c-bg-soft);">
    <h3>🐕 Resiliencia</h3>
    <p>Watchdog activo que monitorea sockets y procesos, recuperando el sistema ante fallos críticos.</p>
  </div>
  <div style="padding: 1.5rem; border: 1px solid var(--vp-c-bg-soft); border-radius: 8px; background: var(--vp-c-bg-soft);">
    <h3>📊 Auditoría</h3>
    <p>Sistema de logs forenses y notificaciones automáticas vía email para incidentes de infraestructura.</p>
  </div>
</div>

---

## 📂 Documentación Completa

- [**Guía de Entorno**](/guia-entorno): Requisitos y despliegue.
- [**Scripts & Automatización**](/scripts): El corazón DevOps del proyecto.
- [**Manual de Usuario**](/manual-usuario): Guía paso a paso para clientes y admins.
- [**API Backend**](/api-backend): Endpoints y lógica de negocio.
- [**Interfaz Frontend**](/interfaz-frontend): Detalles técnicos del cliente React.
