// ============================================================
// DTOs Y ESQUEMAS DE VALIDACIÓN DEL MODULO NOTAS
// ============================================================
// Una nota es texto libre asociado a una materia. Muy poco que
// validar: que venga contenido y que no sea gigante.
// ============================================================

import { z } from 'zod';

const contenido = z
  .string({ required_error: 'El contenido es obligatorio' })
  .trim()
  .min(1, 'La nota no puede estar vacía')
  .max(5000, 'La nota no puede tener más de 5000 caracteres');

// ============================================================
// ESQUEMA: CREAR NOTA
// ============================================================
export const createNoteSchema = z.object({ contenido });

// ============================================================
// ESQUEMA: ACTUALIZAR NOTA
// ============================================================
// Solo tiene un campo, así que en la práctica es obligatorio.
export const updateNoteSchema = z.object({ contenido });

// ============================================================
// ESQUEMA: PARAMETROS DE LA URL
// ============================================================
// Ruta: /subjects/:materiaId/notes[/:id]
export const noteParamsSchema = z.object({
  materiaId: z.coerce
    .number({ invalid_type_error: 'El id de la materia debe ser un número' })
    .int()
    .positive(),
  id: z.coerce
    .number({ invalid_type_error: 'El id de la nota debe ser un número' })
    .int()
    .positive()
    .optional(),
});

// ============================================================
// TIPOS DERIVADOS
// ============================================================
export type CreateNoteDto = z.infer<typeof createNoteSchema>;
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;
export type NoteParams = z.infer<typeof noteParamsSchema>;
