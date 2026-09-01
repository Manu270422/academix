// ============================================================
// CONTROLLER DE SUBTAREAS
// ============================================================
// Conecta HTTP con el servicio. El :tareaId y el :id vienen de la
// URL (/tasks/:tareaId/subtasks/:id) y ya llegan validados y
// convertidos a número por el middleware "validate".
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as subtasksService from './subtasks.service';
import { getAuthUser } from '../../middlewares/authenticate';
import {
  CreateSubtaskDto,
  UpdateSubtaskDto,
  SubtaskParams,
} from './subtasks.dto';

/**
 * POST /api/v1/tasks/:tareaId/subtasks
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { tareaId } = req.params as unknown as SubtaskParams;
    const data = req.body as CreateSubtaskDto;

    const subtarea = await subtasksService.create(usuario.id, tareaId, data);

    res.status(201).json({
      success: true,
      message: 'Subtarea creada correctamente',
      data: subtarea,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/tasks/:tareaId/subtasks/:id
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { tareaId, id } = req.params as unknown as Required<SubtaskParams>;
    const data = req.body as UpdateSubtaskDto;

    const subtarea = await subtasksService.update(
      usuario.id,
      tareaId,
      id,
      data
    );

    res.status(200).json({
      success: true,
      message: 'Subtarea actualizada correctamente',
      data: subtarea,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/tasks/:tareaId/subtasks/:id
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { tareaId, id } = req.params as unknown as Required<SubtaskParams>;

    await subtasksService.remove(usuario.id, tareaId, id);

    res.status(200).json({
      success: true,
      message: 'Subtarea eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
}
