# 🎨 Interfaz Frontend

Detalles técnicos sobre la construcción y arquitectura del cliente web.

## 💻 Stack Tecnológico

- **React**: Biblioteca base para la gestión de la interfaz.
- **Vite**: Bundler de última generación que optimiza el tiempo de desarrollo.
- **Vanilla CSS**: Estilos puros sin frameworks pesados, garantizando un diseño único y ligero.
- **Context API**: Se utiliza para el manejo global del estado de autenticación (`UserContext`).

## 📁 Estructura de Código

- **`/src/components`**: Componentes reutilizables (Botones, Inputs, Cards, Chat).
- **`/src/pages`**: Vistas principales de la aplicación (Home, Movie, Profile).
- **`/src/hooks`**: Lógica extraída para facilitar el consumo de la API (`useTickets`, `useUser`, `useChat`).
- **`/src/layouts`**: Estructuras de página y elementos persistentes como el `AssistantButton`.
- **`/src/api`**: Configuración de **Axios** y servicios para cada endpoint del backend.
- **`/src/utils`**: Funciones de ayuda para formateo de fechas, precios y validaciones.

## 🚀 Desarrollo y Build

Para trabajar en el frontend de forma independiente al contenedor:

### Instalación
```bash
cd frontend
npm install
```

### Ejecución
```bash
npm run dev
```

### Producción
Para generar los archivos estáticos optimizados:
```bash
npm run build
```

> **Nota:** El archivo `vite.config.js` está configurado para permitir conexiones desde el host de Docker, facilitando el Hot Module Replacement (HMR).
