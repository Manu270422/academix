// ============================================================
// CONFIGURACION DE LOS TESTS DEL BACKEND (Vitest)
// ============================================================
// Yo pruebo aqui lo que NO necesita base de datos:
//   - Utilidades puras (jwt, password).
//   - Esquemas de validacion Zod (los DTOs).
//   - Respuestas de Express que se resuelven ANTES de tocar Prisma
//     (validacion 422, auth 401, 404, ruta raiz).
//
// Los tests de servicios contra la base de datos real quedan para
// mas adelante (necesitan una BD de pruebas dedicada).
// ============================================================

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.ts'],
  },
});
