// ============================================================
// TESTS DE INTEGRACION (Express + supertest)
// ============================================================
// Yo pruebo aqui el comportamiento de la API en los casos que se
// resuelven ANTES de tocar la base de datos:
//   - Ruta raiz de salud.
//   - Ruta inexistente -> 404 con mi formato { success: false }.
//   - Ruta protegida sin token -> 401.
//   - Body inválido -> 422 con lista de errores por campo.
//
// No arranco el servidor (app.listen); supertest habla con la app
// en memoria.
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Aisló los servicios externos: en los tests no quiero (ni puedo)
// mandar correos de verdad ni notificaciones push. Ambos se
// inicializan al importar la app, así que los reemplazo por dobles.
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: async () => ({ data: { id: 'test' }, error: null }) };
  },
}));
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: () => undefined,
    sendNotification: async () => ({ statusCode: 201 }),
  },
}));

// El import de la app va DESPUES de los mocks (vi.mock se eleva, pero
// lo dejo explícito para que se lea claro).
import app from './app';

describe('GET /', () => {
  it('responde 200 y dice que la API funciona', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('rutas inexistentes', () => {
  it('devuelve 404 con { success: false }', async () => {
    const res = await request(app).get('/api/v1/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('protección con JWT', () => {
  it('GET /api/v1/tasks sin token -> 401', async () => {
    const res = await request(app).get('/api/v1/tasks');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/tasks con token basura -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', 'Bearer no-es-un-token');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/tasks/1/subtasks sin token -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/tasks/1/subtasks')
      .send({ titulo: 'Paso 1' });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/auth/me/export sin token -> 401', async () => {
    const res = await request(app).get('/api/v1/auth/me/export');
    expect(res.status).toBe(401);
  });

  it('DELETE /api/v1/auth/me sin token -> 401', async () => {
    const res = await request(app)
      .delete('/api/v1/auth/me')
      .send({ confirmacion: 'ELIMINAR' });
    expect(res.status).toBe(401);
  });
});

describe('validación de body', () => {
  it('POST /api/v1/auth/register con datos inválidos -> 422 con errores', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'M', email: 'malo', password: '123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
    // Cada error trae el campo y el mensaje.
    expect(res.body.errors[0]).toHaveProperty('campo');
    expect(res.body.errors[0]).toHaveProperty('mensaje');
  });
});
