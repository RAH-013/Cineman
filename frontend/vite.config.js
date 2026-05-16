import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": "http://backend:80"
    }
  },
  plugins: [react(), tailwindcss()],
})