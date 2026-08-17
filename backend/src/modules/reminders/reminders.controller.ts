// ============================================================
// CONTROLLER DE RECORDATORIOS
// ============================================================
// Mismo rol que en los demas modulos: conectar HTTP con el servicio.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as remindersService from './reminders.service';
import { getAuthUser } from '../../middlewares/authenticate';
import { ReminderIdParam, UpdateReminderDto } from './reminders.dto';
import { SubjectIdParam } from '../subjects/subjects.dto';

/**
 * GET /api/v1/reminders
 * Lista las notificaciones (recordatorios ya enviados) del usuario.
 * El frontend la usa para la campanita de notificaciones.
 */
export async function findAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const recordatorios = await remindersService.findAll(usuario.id);

    res.status(200).json({
      success: true,
      data: recordatorios,
      meta: {
        total: recordatorios.length,
        noLeidos: recordatorios.filter((r: { leidoEnApp: boolean }) => !r.leidoEnApp)
          .length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/reminders/:id/read
 * Marca una notificacion como leida.
 */
export async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as ReminderIdParam;

    const recordatorio = await remindersService.markAsRead(usuario.id, id);

    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
      data: recordatorio,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/tasks/:id/reminder
 * Actualiza la anticipacion (en horas) del recordatorio de una tarea.
 * La monto sobre la ruta de tasks porque conceptualmente es una
 * propiedad de la tarea (cuando avisarme de ESTA tarea especifica).
 */
export async function updateAnticipacion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as SubjectIdParam;
    const data = req.body as UpdateReminderDto;

    const recordatorio = await remindersService.updateAnticipacion(
      usuario.id,
      id,
      data
    );

    res.status(200).json({
      success: true,
      message: 'Anticipación del recordatorio actualizada',
      data: recordatorio,
    });
  } catch (error) {
    next(error);
  }
}