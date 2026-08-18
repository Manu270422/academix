// Aqui centralizo el envio de notificaciones push (las que aparecen
// en la barra del sistema operativo / pantalla de bloqueo del
// estudiante, igual que WhatsApp o Facebook).
//
// Uso el estandar Web Push (gratis, sin Firebase ni servicios de
// pago) a traves de la libreria "web-push". El navegador del
// estudiante se "suscribe" una vez, y desde entonces le puedo
// mandar avisos aunque tenga Academix cerrado.

import webPush from 'web-push';
import { env } from '../config/env';
import { logger } from './logger';
import { prisma } from '../config/database';

// Configuro las llaves VAPID (identifican a Academix ante los
// servicios de push de cada navegador - Chrome, Firefox, etc).
// Se generan UNA sola vez con "npx web-push generate-vapid-keys".
webPush.setVapidDetails(
  `mailto:${env.vapidContactEmail}`,
  env.vapidPublicKey,
  env.vapidPrivateKey
);

interface DatosNotificacionPush {
  titulo: string;
  cuerpo: string;
  url?: string; // a donde llevar al estudiante si hace click
}

// Le mando una notificacion push a TODOS los dispositivos/navegadores
// donde el usuario se haya suscrito (puede tener mas de uno: celular
// y computador, por ejemplo).
export async function enviarPushAUsuario(
  usuarioId: number,
  datos: DatosNotificacionPush
): Promise<void> {
  if (!env.vapidPublicKey || !env.vapidPrivateKey) {
    logger.warn(
      'VAPID no configurado: se omite el envio de notificacion push'
    );
    return;
  }

  const suscripciones = await prisma.pushSubscription.findMany({
    where: { usuarioId },
  });

  if (suscripciones.length === 0) return; // el usuario no activo push

  const payload = JSON.stringify({
    title: datos.titulo,
    body: datos.cuerpo,
    url: datos.url ?? '/',
  });

  // Le mando a cada suscripcion. Uso Promise.allSettled porque una
  // suscripcion puede estar vencida (el usuario desinstalo el
  // navegador, por ejemplo) y no quiero que eso tumbe el envio a
  // las demas.
  const resultados = await Promise.allSettled(
    suscripciones.map((suscripcion) =>
      webPush.sendNotification(
        {
          endpoint: suscripcion.endpoint,
          keys: {
            p256dh: suscripcion.p256dh,
            auth: suscripcion.auth,
          },
        },
        payload
      )
    )
  );

  // Si alguna suscripcion respondio que ya no existe (410 Gone o 404),
  // la borro de la base de datos: ya no sirve de nada guardarla.
  for (let i = 0; i < resultados.length; i++) {
    const resultado = resultados[i];
    if (resultado.status === 'rejected') {
      const error = resultado.reason as { statusCode?: number };
      if (error.statusCode === 410 || error.statusCode === 404) {
        await prisma.pushSubscription
          .delete({ where: { id: suscripciones[i].id } })
          .catch(() => undefined); // si ya no existe, no pasa nada
      } else {
        logger.error(
          `Error enviando push a usuario ${usuarioId}: ${JSON.stringify(error)}`
        );
      }
    }
  }
}