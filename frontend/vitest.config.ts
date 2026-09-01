// ============================================================
// CONFIGURACION DE LOS TESTS (Vitest)
// ============================================================
// La dejo aparte de vite.config.ts a propósito: así el build de
// producción no carga nada de tests y evito el choque de tipos
// entre la copia de Vite que usa Vitest y la del proyecto.
//
// Corro los tests en jsdom (un navegador simulado) para poder
// montar componentes de React con Testing Library.
// ============================================================

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
