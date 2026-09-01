// ============================================================
// DTOs Y ESQUEMAS DE VALIDACIÓN DEL MODULO SUBTAREAS
// ============================================================
// Una subtarea es una casilla del checklist de una tarea. Tiene
// muy poco: un titulo y si esta hecha o no.
// ============================================================

import { z } from 'zod';

const tituloSubtarea = z
  .string({ required_error: 'El titulo es obligatorio' })
  .trim()
  .min(1, 'El titulo no puede estar vacío')
  .max(200, 'El titulo no puede tener más de 200 caracteres');

// ============================================================
// ESQUEMA: CREAR SUBTAREA
// ============================================================
export const createSubtaskSchema = z.object({
  titulo: tituloSubtarea,
});

// ============================================================
// ESQUEMA: ACTUALIZAR SUBTAREA
// ============================================================
// PATCH: todos opcionales, pero al menos uno. Sirve tanto para
// renombrar como para marcar/desmarcar como para reordenar.
export const updateSubtaskSchema = z
  .object({
    titulo: tituloSubtarea.optional(),
    completada: z.boolean().optional(),
    orden: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'Debes enviar al menos un campo para actualizar'
  );

// ============================================================
// ESQUEMA: PARAMETROS DE LA URL
// ============================================================
// La ruta es /tasks/:tareaId/subtasks/:id, así que valido ambos.
export const subtaskParamsSchema = z.object({
  tareaId: z.coerce
    .number({ invalid_type_error: 'El id de la tarea debe ser un número' })
    .int()
    .positive(),
  id: z.coerce
    .number({ invalid_type_error: 'El id de la subtarea debe ser un número' })
    .int()
    .positive()
    .optional(),
});

// ============================================================
// TIPOS DERIVADOS
// ============================================================
export type CreateSubtaskDto = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskDto = z.infer<typeof updateSubtaskSchema>;
export type SubtaskParams = z.infer<typeof subtaskParamsSchema>;
