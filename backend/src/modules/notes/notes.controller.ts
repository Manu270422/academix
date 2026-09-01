// ============================================================
// CONTROLLER DE NOTAS
// ============================================================
// Conecta HTTP con el servicio. El :materiaId y el :id vienen de
// la URL (/subjects/:materiaId/notes/:id) ya validados y convertidos
// a número por el middleware "validate".
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as notesService from './notes.service';
import { getAuthUser } from '../../middlewares/authenticate';
import { CreateNoteDto, UpdateNoteDto, NoteParams } from './notes.dto';

/**
 * GET /api/v1/subjects/:materiaId/notes
 */
export async function findAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { materiaId } = req.params as unknown as NoteParams;

    const notas = await notesService.findAll(usuario.id, materiaId);

    res.status(200).json({
      success: true,
      data: notas,
      meta: { total: notas.length },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/subjects/:materiaId/notes
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { materiaId } = req.params as unknown as NoteParams;
    const data = req.body as CreateNoteDto;

    const nota = await notesService.create(usuario.id, materiaId, data);

    res.status(201).json({
      success: true,
      message: 'Nota creada correctamente',
      data: nota,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/subjects/:materiaId/notes/:id
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { materiaId, id } = req.params as unknown as Required<NoteParams>;
    const data = req.body as UpdateNoteDto;

    const nota = await notesService.update(usuario.id, materiaId, id, data);

    res.status(200).json({
      success: true,
      message: 'Nota actualizada correctamente',
      data: nota,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/subjects/:materiaId/notes/:id
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { materiaId, id } = req.params as unknown as Required<NoteParams>;

    await notesService.remove(usuario.id, materiaId, id);

    res.status(200).json({
      success: true,
      message: 'Nota eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
}
