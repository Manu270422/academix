// Configuracion de Vite para Academix.
// Vite es el bundler y servidor de desarrollo.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Puerto del servidor de desarrollo.
    // 5173 es el default de Vite y es el que tengo en CORS_ORIGINS del backend.
    port: 5173,
    // Abre el navegador automaticamente al correr "npm run dev".
    open: true,
  },
});