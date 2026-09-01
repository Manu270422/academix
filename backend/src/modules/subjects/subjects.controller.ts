// ============================================================
// CONTROLLER DE MATERIAS
// ============================================================
// El controller es la capa que conecta HTTP con el servicio.
// Como ya disenue, su trabajo es muy simple:
//   1. Sacar el usuario autenticado de req.user (lo puso authenticate).
//   2. Sacar los datos validados de req.body o req.params.
//   3. Llamar al servicio.
//   4. Armar la respuesta HTTP con el codigo correcto.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as subjectsService from './subjects.service';
import { getAuthUser } from '../../middlewares/authenticate';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectIdParam,
} from './subjects.dto';

/**
 * POST /api/v1/subjects
 * Crea una nueva materia para el usuario autenticado.
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const data = req.body as CreateSubjectDto;

    const materia = await subjectsService.create(usuario.id, data);

    // 201 Created: estandar HTTP cuando se crea un recurso.
    res.status(201).json({
      success: true,
      message: 'Materia creada correctamente',
      data: materia,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/subjects
 * Lista todas las materias del usuario autenticado.
 */
export async function findAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);

    const materias = await subjectsService.findAll(usuario.id);

    res.status(200).json({
      success: true,
      data: materias,
      // Anado el total como metadato util para el frontend.
      meta: { total: materias.length },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/subjects/:id
 * Obtiene una materia especifica del usuario autenticado.
 */
export async function findOne(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    // El id ya viene validado y convertido a número por el middleware "validate".
    const { id } = req.params as unknown as SubjectIdParam;

    const materia = await subjectsService.findOne(usuario.id, id);

    res.status(200).json({
      success: true,
      data: materia,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/subjects/:id
 * Actualiza los campos enviados de una materia del usuario autenticado.
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as SubjectIdParam;
    const data = req.body as UpdateSubjectDto;

    const materia = await subjectsService.update(usuario.id, id, data);

    res.status(200).json({
      success: true,
      message: 'Materia actualizada correctamente',
      data: materia,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/subjects/:id
 * Elimina una materia del usuario autenticado.
 * Por la regla onDelete:Cascade, borra tambien sus tareas asociadas.
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as SubjectIdParam;

    await subjectsService.remove(usuario.id, id);

    // 204 No Content: estandar HTTP cuando se elimina algo correctamente
    // y no hay contenido que devolver. Pero en mi caso prefiero devolver
    // un 200 con mensaje para que el frontend muestre confirmación al usuario.
    res.status(200).json({
      success: true,
      message: 'Materia eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
}
/**
 * POST /api/v1/subjects/:id/restore
 * Saca una materia (y sus tareas) de la papelera.
 */
export async function restore(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as SubjectIdParam;
    await subjectsService.restore(usuario.id, id);
    res.status(200).json({
      success: true,
      message: 'Materia restaurada correctamente',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/subjects/:id/permanent
 * Borra una materia de la papelera para siempre.
 */
export async function removePermanent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { id } = req.params as unknown as SubjectIdParam;
    await subjectsService.removePermanent(usuario.id, id);
    res.status(200).json({
      success: true,
      message: 'Materia eliminada definitivamente',
    });
  } catch (error) {
    next(error);
  }
}
