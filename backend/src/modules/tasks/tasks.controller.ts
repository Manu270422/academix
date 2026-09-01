// ============================================================
// CONTROLLER DE TAREAS
// ============================================================
// El controller es la capa que conecta HTTP con el servicio.
// Sigue el mismo patron que los demas modulos: lee request, llama servicio,
// arma respuesta. Toda la lógica vive en tasks.service.ts.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as tasksService from './tasks.service';
import { getAuthUser } from '../../middlewares/authenticate';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  TaskIdParam,
  ListTasksQuery,
} from './tasks.dto';

/**
 * POST /api/v1/tasks
 * Crea una nueva tarea para el usuario autenticado.
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const data = req.body as CreateTaskDto;

    const { tarea, creadas } = await tasksService.create(usuario.id, data);

    res.status(201).json({
      success: true,
      message:
        creadas > 1
          ? `Se crearon ${creadas} tareas repetidas`
          : 'Tarea creada correctamente',
      data: tarea,
      meta: { creadas },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/tasks
 * Lista todas las tareas del usuario autenticado, con filtros opcionales.
 * Acepta query params: estado, prioridad, materiaId, desde, hasta.
 */
export async function findAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    // Los query params ya vienen validados y tipados por el middleware.
    const filters = req.query as unknown as ListTasksQuery;

    const tareas = await tasksService.findAll(usuario.id, filters);

    res.status(200).json({
      success: true,
      data: tareas,
      meta: { total: tareas.length },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/tasks/:id
 * Obtiene una tarea especifica del usuario autenticado.
 */
export async function findOne(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as TaskIdParam;

    const tarea = await tasksService.findOne(usuario.id, id);

    res.status(200).json({
      success: true,
      data: tarea,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/tasks/:id
 * Actualiza los campos enviados de una tarea.
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as TaskIdParam;
    const data = req.body as UpdateTaskDto;

    const tarea = await tasksService.update(usuario.id, id, data);

    res.status(200).json({
      success: true,
      message: 'Tarea actualizada correctamente',
      data: tarea,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/tasks/:id/status
 * Cambia el estado de una tarea (HU07).
 * Endpoint dedicado para que el frontend no tenga que enviar
 * el objeto de update completo cada vez que se marca como completada.
 */
export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as TaskIdParam;
    const { estado } = req.body as UpdateTaskStatusDto;

    const tarea = await tasksService.updateStatus(usuario.id, id, estado);

    res.status(200).json({
      success: true,
      message: `Estado actualizado a ${estado}`,
      data: tarea,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/tasks/:id
 * Elimina una tarea del usuario autenticado.
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as TaskIdParam;

    await tasksService.remove(usuario.id, id);

    res.status(200).json({
      success: true,
      message: 'Tarea eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
}
/**
 * POST /api/v1/tasks/:id/restore
 * Saca una tarea de la papelera.
 */
export async function restore(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as TaskIdParam;
    await tasksService.restore(usuario.id, id);
    res.status(200).json({
      success: true,
      message: 'Tarea restaurada correctamente',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/tasks/:id/permanent
 * Borra una tarea de la papelera para siempre.
 */
export async function removePermanent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as TaskIdParam;
    await tasksService.removePermanent(usuario.id, id);
    res.status(200).json({
      success: true,
      message: 'Tarea eliminada definitivamente',
    });
  } catch (error) {
    next(error);
  }
}
