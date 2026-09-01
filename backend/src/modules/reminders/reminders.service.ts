// ============================================================
// SERVICIO DE RECORDATORIOS
// ============================================================
// Aqui vive la logica de negocio de los recordatorios:
//   - Listar las notificaciones del usuario para mostrarlas en la app.
//   - Marcar como leida una notificacion.
//   - Revisar (desde el cron) que recordatorios tocan enviar YA.
//
// DISENO 1:N (cada tarea tiene VARIOS recordatorios, uno por umbral
// de UMBRALES_RECORDATORIO_HORAS). Cada fila se procesa, envia y
// marca de forma INDEPENDIENTE de las demas.
//
// CADENA DE PROPIEDAD (igual que en tasks.service.ts):
//   usuario -> materia -> tarea -> recordatorios
// ============================================================

import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';
import { enviarCorreoRecordatorio } from '../../utils/email';
import { enviarPushAUsuario } from '../../utils/push';
import { MAX_INTENTOS_ENVIO } from './reminders.constants';

// ============================================================
// LISTAR NOTIFICACIONES DEL USUARIO (PARA LA CAMPANITA)
// ============================================================
/**
 * Devuelve los recordatorios YA ENVIADOS (osea, que ya se generaron
 * como notificacion) del usuario autenticado, mas recientes primero.
 * El frontend los usa para la campanita de notificaciones.
 */
export async function findAll(usuarioId: number) {
  const recordatorios = await prisma.recordatorio.findMany({
    where: {
      enviadoEmail: true,
      // No muestro avisos de tareas que estan en la Papelera.
      tarea: { deletedAt: null, materia: { usuarioId, deletedAt: null } },
    },
    include: {
      tarea: {
        select: {
          id: true,
          titulo: true,
          fechaEntrega: true,
          materia: { select: { id: true, nombre: true, color: true } },
        },
      },
    },
    orderBy: { fechaEnvioEmail: 'desc' },
    take: 50, // no tiene sentido cargar cientos, solo las mas recientes
  });

  return recordatorios;
}

// ============================================================
// MARCAR NOTIFICACION COMO LEIDA
// ============================================================
export async function markAsRead(usuarioId: number, recordatorioId: number) {
  // Verifico que el recordatorio exista Y sea del usuario, siguiendo
  // la cadena de propiedad completa.
  const recordatorio = await prisma.recordatorio.findFirst({
    where: { id: recordatorioId, tarea: { materia: { usuarioId } } },
  });

  if (!recordatorio) {
    throw new AppError('Recordatorio no encontrado', 404);
  }

  return prisma.recordatorio.update({
    where: { id: recordatorioId },
    data: { leidoEnApp: true },
  });
}

// ============================================================
// PROCESAR RECORDATORIOS PENDIENTES (lo llama el cron)
// ============================================================
/**
 * Recorre cada RECORDATORIO individualmente (no cada tarea: una tarea
 * puede tener hasta 3 recordatorios pendientes con distinto umbral).
 *
 * Un recordatorio califica para enviarse si:
 *   - todavia no se envio (enviadoEmail = false)
 *   - no llego al maximo de intentos fallidos (fallidoDefinitivo = false)
 *   - su tarea NO esta completada (regla: completada = no molestar mas)
 *   - su tarea NO esta vencida (regla: vencida = no mandar avisos tarde)
 *   - ya se cumplio su umbral de anticipacion (fechaEntrega - ahora <= umbral)
 *
 * Por cada envio exitoso: enviadoEmail=true. Esa fila nunca vuelve a
 * entrar en esta consulta (el filtro enviadoEmail=false la excluye
 * para siempre), asi que un envio exitoso JAMAS se reprocesa.
 *
 * Por cada envio fallido: sumo 1 a intentosEnvio y guardo el error.
 * Si con este intento llego a MAX_INTENTOS_ENVIO, marco
 * fallidoDefinitivo=true y esa fila tampoco vuelve a intentarse.
 * Si no llego al maximo, la fila sigue con enviadoEmail=false, asi
 * que el proximo ciclo del cron (15 min despues) la reintenta sola.
 *
 * El PUSH (notificacion del sistema operativo) lo mando en paralelo
 * al correo, pero es "best effort": si falla, solo lo registro en el
 * log y sigo. No lo ato a la logica de reintentos del correo, porque
 * son dos canales independientes y el correo es el que quiero
 * garantizar que llegue si o si (por eso el diseño de 3 intentos es
 * solo para el correo).
 */
export async function procesarRecordatoriosPendientes(): Promise<void> {
  const ahora = new Date();

  // Candidatos: recordatorios sin enviar, sin agotar sus intentos,
  // de tareas no completadas y no vencidas.
  const candidatos = await prisma.recordatorio.findMany({
    where: {
      enviadoEmail: false,
      fallidoDefinitivo: false,
      tarea: {
        estado: { not: 'COMPLETADA' },
        fechaEntrega: { gt: ahora }, // no vencida
        deletedAt: null, // no en la Papelera
        materia: { deletedAt: null },
      },
    },
    include: {
      tarea: {
        include: {
          materia: {
            include: {
              usuario: { select: { id: true, nombre: true, email: true } },
            },
          },
        },
      },
    },
  });

  // De esos candidatos, me quedo solo con los que YA cumplieron su
  // umbral de anticipacion (ej. el de 72h no dispara hasta que falten
  // 72 horas o menos para la entrega).
  const pendientes = candidatos.filter((recordatorio: (typeof candidatos)[number]) => {
    const horasParaVencer =
      (recordatorio.tarea.fechaEntrega.getTime() - ahora.getTime()) /
      (1000 * 60 * 60);
    return horasParaVencer <= recordatorio.anticipacionHoras;
  });

  if (pendientes.length === 0) return;

  logger.info(`Procesando ${pendientes.length} recordatorio(s) pendiente(s)`);

  for (const recordatorio of pendientes) {
    const { tarea } = recordatorio;

    const resultado = await enviarCorreoRecordatorio({
      destinatario: tarea.materia.usuario.email,
      nombreEstudiante: tarea.materia.usuario.nombre,
      tituloTarea: tarea.titulo,
      nombreMateria: tarea.materia.nombre,
      fechaEntrega: tarea.fechaEntrega,
    });

    if (resultado.exito) {
      // Envio exitoso: marco enviado y AQUI TERMINA la vida de esta
      // fila. El filtro enviadoEmail=false de arriba la excluye para
      // siempre de futuras corridas del cron.
      await prisma.recordatorio.update({
        where: { id: recordatorio.id },
        data: { enviadoEmail: true, fechaEnvioEmail: ahora },
      });

      logger.info(
        `Recordatorio ${recordatorio.anticipacionHoras}h de la tarea "${tarea.titulo}" (id: ${tarea.id}): correo enviado`
      );

      // Mando tambien la notificacion push, en paralelo, sin bloquear
      // ni afectar el resultado del correo si esta falla.
      try {
        await enviarPushAUsuario(tarea.materia.usuario.id, {
          titulo: 'Academix - Tarea por vencer',
          cuerpo: `"${tarea.titulo}" de ${tarea.materia.nombre} vence pronto`,
          url: '/tareas',
        });
      } catch (error) {
        logger.error(
          `Error enviando push del recordatorio ${recordatorio.id}: ${(error as Error).message}`
        );
      }
    } else {
      // Envio fallido: sumo el intento y guardo el error.
      const intentosNuevos = recordatorio.intentosEnvio + 1;
      const seAgotaronLosIntentos = intentosNuevos >= MAX_INTENTOS_ENVIO;

      await prisma.recordatorio.update({
        where: { id: recordatorio.id },
        data: {
          intentosEnvio: intentosNuevos,
          ultimoError: resultado.error,
          fallidoDefinitivo: seAgotaronLosIntentos,
        },
      });

      logger.error(
        `Recordatorio ${recordatorio.anticipacionHoras}h de la tarea "${tarea.titulo}" (id: ${tarea.id}): fallo intento ${intentosNuevos}/${MAX_INTENTOS_ENVIO} - ${resultado.error}` +
          (seAgotaronLosIntentos ? ' - marcado como fallido definitivo' : '')
      );
    }
  }
}