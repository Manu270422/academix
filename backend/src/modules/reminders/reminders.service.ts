// ============================================================
// SERVICIO DE RECORDATORIOS
// ============================================================
// Aqui vive la logica de negocio de los recordatorios:
//   - Listar las notificaciones del usuario para mostrarlas en la app.
//   - Marcar como leida una notificacion.
//   - Dejar que el estudiante ajuste la anticipacion de una tarea.
//   - Revisar (desde el cron) que recordatorios tocan enviar YA.
//
// CADENA DE PROPIEDAD (igual que en tasks.service.ts):
//   usuario -> materia -> tarea -> recordatorio
// ============================================================

import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';
import { enviarCorreoRecordatorio } from '../../utils/email';
import { UpdateReminderDto } from './reminders.dto';

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
      tarea: { materia: { usuarioId } },
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
// ACTUALIZAR LA ANTICIPACION DE UNA TAREA
// ============================================================
export async function updateAnticipacion(
  usuarioId: number,
  tareaId: number,
  data: UpdateReminderDto
) {
  const tarea = await prisma.tarea.findFirst({
    where: { id: tareaId, materia: { usuarioId } },
    include: { recordatorio: true },
  });

  if (!tarea) {
    throw new AppError('Tarea no encontrada', 404);
  }

  // Si por alguna razon la tarea no tiene recordatorio (ej. datos
  // viejos de antes de esta funcionalidad), lo creo en el momento.
  if (!tarea.recordatorio) {
    return prisma.recordatorio.create({
      data: { tareaId, anticipacionHoras: data.anticipacionHoras },
    });
  }

  return prisma.recordatorio.update({
    where: { tareaId },
    data: {
      anticipacionHoras: data.anticipacionHoras,
      // Si el usuario cambia la anticipacion, tiene sentido que se
      // vuelva a evaluar el envio (por si el nuevo umbral ya se cumplio).
      enviadoEmail: false,
      fechaEnvioEmail: null,
    },
  });
}

// ============================================================
// PROCESAR RECORDATORIOS PENDIENTES (lo llama el cron)
// ============================================================
/**
 * Busca tareas cuyo recordatorio todavia no se ha enviado y cuya
 * fecha de aviso (fechaEntrega - anticipacionHoras) ya se cumplio.
 * Excluyo las tareas ya completadas: no tiene sentido recordar algo
 * que el estudiante ya termino.
 *
 * Por cada una: envio el correo y marco el recordatorio como enviado
 * (independientemente de si el correo tuvo exito, para no reintentar
 * en bucle infinito si el correo falla por un problema del proveedor;
 * el estudiante igual vera la notificacion dentro de la app).
 */
export async function procesarRecordatoriosPendientes(): Promise<void> {
  const ahora = new Date();

  // Traigo TODAS las tareas con recordatorio sin enviar y sin completar,
  // junto con sus datos, y filtro en memoria cuales ya cumplieron su
  // umbral de anticipacion (la resta de horas no se puede hacer
  // directamente en el WHERE de Prisma de forma sencilla).
  const candidatos = await prisma.tarea.findMany({
    where: {
      estado: { not: 'COMPLETADA' },
      recordatorio: { enviadoEmail: false },
    },
    include: {
      recordatorio: true,
      materia: {
        include: {
          usuario: { select: { nombre: true, email: true } },
        },
      },
    },
  });

  const pendientes = candidatos.filter((tarea) => {
    if (!tarea.recordatorio) return false;
    const horasParaVencer =
      (tarea.fechaEntrega.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    return horasParaVencer <= tarea.recordatorio.anticipacionHoras;
  });

  if (pendientes.length === 0) return;

  logger.info(`Procesando ${pendientes.length} recordatorio(s) pendiente(s)`);

  for (const tarea of pendientes) {
    const exito = await enviarCorreoRecordatorio({
      destinatario: tarea.materia.usuario.email,
      nombreEstudiante: tarea.materia.usuario.nombre,
      tituloTarea: tarea.titulo,
      nombreMateria: tarea.materia.nombre,
      fechaEntrega: tarea.fechaEntrega,
    });

    // Marco como enviado en ambos casos (ver comentario de la funcion).
    await prisma.recordatorio.update({
      where: { tareaId: tarea.id },
      data: { enviadoEmail: true, fechaEnvioEmail: ahora },
    });

    logger.info(
      `Recordatorio de la tarea "${tarea.titulo}" (id: ${tarea.id}): ${
        exito ? 'correo enviado' : 'correo NO enviado, notificacion en app disponible igual'
      }`
    );
  }
}