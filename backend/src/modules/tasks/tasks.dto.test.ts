// ============================================================
// TESTS: esquemas Zod del modulo tareas
// ============================================================
// Los DTOs son mi primera linea de defensa: aqui compruebo que
// rechazan datos malos y aceptan datos buenos, sin tocar la BD.
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
} from './tasks.dto';

// Una fecha futura para las pruebas de creacion.
const futuro = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

describe('createTaskSchema', () => {
  it('acepta una tarea válida', () => {
    const r = createTaskSchema.safeParse({
      titulo: 'Ensayo de historia',
      fechaEntrega: futuro,
      materiaId: 3,
    });
    expect(r.success).toBe(true);
  });

  it('rechaza un título de menos de 2 caracteres', () => {
    const r = createTaskSchema.safeParse({
      titulo: 'a',
      fechaEntrega: futuro,
      materiaId: 3,
    });
    expect(r.success).toBe(false);
  });

  it('rechaza una fecha de entrega en el pasado', () => {
    const r = createTaskSchema.safeParse({
      titulo: 'Tarea vieja',
      fechaEntrega: '2020-01-01T00:00:00Z',
      materiaId: 3,
    });
    expect(r.success).toBe(false);
  });

  it('rechaza un materiaId no positivo', () => {
    const r = createTaskSchema.safeParse({
      titulo: 'Tarea',
      fechaEntrega: futuro,
      materiaId: 0,
    });
    expect(r.success).toBe(false);
  });

  it('recorta los espacios del título', () => {
    const r = createTaskSchema.safeParse({
      titulo: '  Leer capítulo 4  ',
      fechaEntrega: futuro,
      materiaId: 1,
    });
    expect(r.success && r.data.titulo).toBe('Leer capítulo 4');
  });

  it('acepta un bloque "repetir" válido', () => {
    const r = createTaskSchema.safeParse({
      titulo: 'Entrega semanal',
      fechaEntrega: futuro,
      materiaId: 1,
      repetir: { frecuencia: 'SEMANAL', cantidad: 8 },
    });
    expect(r.success).toBe(true);
  });

  it('rechaza repetir con cantidad menor a 2', () => {
    const r = createTaskSchema.safeParse({
      titulo: 'Entrega',
      fechaEntrega: futuro,
      materiaId: 1,
      repetir: { frecuencia: 'SEMANAL', cantidad: 1 },
    });
    expect(r.success).toBe(false);
  });

  it('rechaza repetir con más de 24', () => {
    const r = createTaskSchema.safeParse({
      titulo: 'Entrega',
      fechaEntrega: futuro,
      materiaId: 1,
      repetir: { frecuencia: 'MENSUAL', cantidad: 25 },
    });
    expect(r.success).toBe(false);
  });

  it('rechaza una frecuencia inventada', () => {
    const r = createTaskSchema.safeParse({
      titulo: 'Entrega',
      fechaEntrega: futuro,
      materiaId: 1,
      repetir: { frecuencia: 'DIARIA', cantidad: 5 },
    });
    expect(r.success).toBe(false);
  });
});

describe('updateTaskSchema', () => {
  it('exige al menos un campo', () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it('permite actualizar solo el estado', () => {
    const r = updateTaskSchema.safeParse({ estado: 'COMPLETADA' });
    expect(r.success).toBe(true);
  });

  it('rechaza un estado inventado', () => {
    expect(updateTaskSchema.safeParse({ estado: 'LISTO' }).success).toBe(false);
  });
});

describe('listTasksQuerySchema', () => {
  it('convierte materiaId de string a número (viene de la URL)', () => {
    const r = listTasksQuerySchema.safeParse({ materiaId: '5' });
    expect(r.success && r.data.materiaId).toBe(5);
  });

  it('acepta query vacío (sin filtros)', () => {
    expect(listTasksQuerySchema.safeParse({}).success).toBe(true);
  });
});

describe('taskIdParamSchema', () => {
  it('convierte el id de la URL a número', () => {
    const r = taskIdParamSchema.safeParse({ id: '12' });
    expect(r.success && r.data.id).toBe(12);
  });
  it('rechaza un id no numérico', () => {
    expect(taskIdParamSchema.safeParse({ id: 'abc' }).success).toBe(false);
  });
});
