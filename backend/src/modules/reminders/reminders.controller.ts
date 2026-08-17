// ============================================================
// CONTROLLER DE RECORDATORIOS
// ============================================================
// Mismo rol que en los demas modulos: conectar HTTP con el servicio.
//
// Nota: antes existia aqui un endpoint para editar la anticipacion
// de un recordatorio (PATCH /tasks/:id/reminder). Lo elimine porque
// asumia el diseno viejo de "un recordatorio por tarea". Con el
// diseno nuevo de 3 recordatorios fijos por tarea (72h/24h/6h), ese
// endpoint no tiene sentido tal cual estaba. Cuando implemente
// preferencias configurables por estudiante, disenare una API nueva
// pensada para eso.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as remindersService from './reminders.service';
import { getAuthUser } from '../../middlewares/authenticate';
import { ReminderIdParam } from './reminders.dto';

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