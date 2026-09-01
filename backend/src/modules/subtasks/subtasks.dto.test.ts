import { describe, it, expect } from 'vitest';
import {
  createSubtaskSchema,
  updateSubtaskSchema,
  subtaskParamsSchema,
} from './subtasks.dto';

describe('createSubtaskSchema', () => {
  it('acepta un título válido y lo recorta', () => {
    const r = createSubtaskSchema.safeParse({ titulo: '  Leer cap. 3  ' });
    expect(r.success && r.data.titulo).toBe('Leer cap. 3');
  });

  it('rechaza título vacío', () => {
    expect(createSubtaskSchema.safeParse({ titulo: '   ' }).success).toBe(false);
  });
});

describe('updateSubtaskSchema', () => {
  it('permite marcar como completada', () => {
    expect(updateSubtaskSchema.safeParse({ completada: true }).success).toBe(
      true
    );
  });

  it('exige al menos un campo', () => {
    expect(updateSubtaskSchema.safeParse({}).success).toBe(false);
  });

  it('rechaza un orden negativo', () => {
    expect(updateSubtaskSchema.safeParse({ orden: -1 }).success).toBe(false);
  });
});

describe('subtaskParamsSchema', () => {
  it('convierte tareaId e id de string a número', () => {
    const r = subtaskParamsSchema.safeParse({ tareaId: '3', id: '9' });
    expect(r.success && r.data.tareaId).toBe(3);
    expect(r.success && r.data.id).toBe(9);
  });

  it('acepta solo tareaId (ruta POST sin :id)', () => {
    expect(subtaskParamsSchema.safeParse({ tareaId: '3' }).success).toBe(true);
  });
});
