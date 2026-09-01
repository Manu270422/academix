import { describe, it, expect } from 'vitest';
import {
  createNoteSchema,
  updateNoteSchema,
  noteParamsSchema,
} from './notes.dto';

describe('createNoteSchema', () => {
  it('acepta contenido válido y lo recorta', () => {
    const r = createNoteSchema.safeParse({ contenido: '  Repasar límites  ' });
    expect(r.success && r.data.contenido).toBe('Repasar límites');
  });

  it('rechaza contenido vacío', () => {
    expect(createNoteSchema.safeParse({ contenido: '   ' }).success).toBe(false);
  });

  it('rechaza contenido de más de 5000 caracteres', () => {
    expect(
      createNoteSchema.safeParse({ contenido: 'a'.repeat(5001) }).success
    ).toBe(false);
  });
});

describe('updateNoteSchema', () => {
  it('exige contenido', () => {
    expect(updateNoteSchema.safeParse({}).success).toBe(false);
  });
});

describe('noteParamsSchema', () => {
  it('convierte materiaId e id de string a número', () => {
    const r = noteParamsSchema.safeParse({ materiaId: '2', id: '7' });
    expect(r.success && r.data.materiaId).toBe(2);
    expect(r.success && r.data.id).toBe(7);
  });

  it('acepta solo materiaId (rutas sin :id)', () => {
    expect(noteParamsSchema.safeParse({ materiaId: '2' }).success).toBe(true);
  });
});
