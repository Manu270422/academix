// ============================================================
// SERVICIO DE SUSCRIPCIONES PUSH
// ============================================================
// Guarda y elimina las suscripciones push de cada estudiante.
// ============================================================

import { prisma } from '../../config/database';
import { SubscribePushDto } from './push.dto';

// ============================================================
// GUARDAR UNA SUSCRIPCION
// ============================================================
/**
 * Guarda (o actualiza si ya existia) la suscripcion push de este
 * navegador/dispositivo para el usuario autenticado. Uso "upsert"
 * porque el mismo endpoint puede volver a registrarse (ej. el
 * estudiante recarga la pagina y vuelve a pedir permiso).
 */
export async function subscribe(usuarioId: number, data: SubscribePushDto) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    update: {
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      usuarioId,
    },
    create: {
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      usuarioId,
    },
  });
}

// ============================================================
// ELIMINAR UNA SUSCRIPCION
// ============================================================
/**
 * El estudiante desactiva las notificaciones desde el navegador:
 * borro su suscripcion para no seguir intentando mandarle push.
 */
export async function unsubscribe(
  usuarioId: number,
  endpoint: string
): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, usuarioId },
  });
}