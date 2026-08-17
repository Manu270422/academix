// ============================================================
// DTOs Y ESQUEMAS DE VALIDACIÓN DEL MÓDULO RECORDATORIOS
// ============================================================
// Sigo el mismo patron que en subjects y tasks: valido con Zod
// todo lo que llega del cliente antes de tocar la base de datos.
// ============================================================

import { z } from 'zod';

// ============================================================
// ESQUEMA: PARAMETROS DE LA URL
// ============================================================
export const reminderIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El id debe ser un número' })
    .int('El id debe ser un número entero')
    .positive('El id debe ser un número positivo'),
});

// ============================================================
// ESQUEMA: ACTUALIZAR ANTICIPACION DE UN RECORDATORIO
// ============================================================
// Le permito al estudiante elegir con cuantas horas de anticipacion
// quiere que le avisen (por defecto son 24). Entre 1 hora y 30 dias.
export const updateReminderSchema = z.object({
  anticipacionHoras: z.coerce
    .number({ invalid_type_error: 'La anticipación debe ser un número' })
    .int('La anticipación debe ser un número entero')
    .min(1, 'La anticipación mínima es de 1 hora')
    .max(720, 'La anticipación máxima es de 30 días (720 horas)'),
});

// ============================================================
// TIPOS DERIVADOS
// ============================================================
export type ReminderIdParam = z.infer<typeof reminderIdParamSchema>;
export type UpdateReminderDto = z.infer<typeof updateReminderSchema>;