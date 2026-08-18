// ============================================================
// SERVICIO DE PUSH (FRONTEND)
// ============================================================
// Le mando al backend la suscripcion push del navegador para que
// la guarde, y le aviso cuando el estudiante la desactiva.
// ============================================================

import { apiClient } from './client';

// La forma que tiene PushSubscription.toJSON() en el navegador.
interface SuscripcionPushPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * POST /push/subscribe
 */
export async function guardarSuscripcionPush(
  suscripcion: SuscripcionPushPayload
): Promise<void> {
  await apiClient.post('/push/subscribe', suscripcion);
}

/**
 * POST /push/unsubscribe
 */
export async function eliminarSuscripcionPush(endpoint: string): Promise<void> {
  await apiClient.post('/push/unsubscribe', { endpoint });
}