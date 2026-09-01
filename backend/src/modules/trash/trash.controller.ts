// ============================================================
// CONTROLLER DE PAPELERA
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as trashService from './trash.service';
import { getAuthUser } from '../../middlewares/authenticate';

/**
 * GET /api/v1/trash
 * Lo que el usuario tiene en la papelera (materias y tareas).
 */
export async function findAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const data = await trashService.findAll(usuario.id);
    res.status(200).json({
      success: true,
      data,
      meta: { total: data.materias.length + data.tareas.length },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/trash
 * Vacia la papelera: borra definitivamente todo lo que haya dentro.
 */
export async function empty(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const resultado = await trashService.vaciar(usuario.id);
    res.status(200).json({
      success: true,
      message: 'Papelera vaciada',
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
}
