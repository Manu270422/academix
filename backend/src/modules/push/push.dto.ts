// ============================================================
// DTOs DEL MÓDULO DE SUSCRIPCIONES PUSH
// ============================================================
// Valido la forma que envia el navegador cuando el estudiante se
// suscribe a las notificaciones push. Esta forma la define el
// propio estandar Web Push (PushSubscription del navegador).
// ============================================================

import { z } from 'zod';

export const subscribePushSchema = z.object({
  endpoint: z.string().url('El endpoint debe ser una URL válida'),
  keys: z.object({
    p256dh: z.string().min(1, 'Falta la llave p256dh'),
    auth: z.string().min(1, 'Falta la llave auth'),
  }),
});

export type SubscribePushDto = z.infer<typeof subscribePushSchema>;