// ============================================================
// DTOs Y ESQUEMAS DE VALIDACIÓN DEL MÓDULO RECORDATORIOS
// ============================================================
// Sigo el mismo patron que en subjects y tasks: valido con Zod
// todo lo que llega del cliente antes de tocar la base de datos.
//
// Nota: antes tenia aqui updateReminderSchema (para editar la
// anticipacion de un recordatorio). Lo elimine junto con su
// endpoint al rediseñar Recordatorio a 1:N con umbrales fijos
// (ver reminders.constants.ts) - ver reminders.controller.ts.
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
// TIPOS DERIVADOS
// ============================================================
export type ReminderIdParam = z.infer<typeof reminderIdParamSchema>;