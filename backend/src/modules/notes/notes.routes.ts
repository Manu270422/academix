// ============================================================
// RUTAS DEL MODULO DE NOTAS
// ============================================================
// Anidadas bajo una materia:
//   GET    /api/v1/subjects/:materiaId/notes       -> listar apuntes
//   POST   /api/v1/subjects/:materiaId/notes       -> crear apunte
//   PATCH  /api/v1/subjects/:materiaId/notes/:id   -> editar apunte
//   DELETE /api/v1/subjects/:materiaId/notes/:id   -> borrar apunte
//
// Router({ mergeParams: true }) para "ver" el :materiaId del mount.
// ============================================================

import { Router } from 'express';
import * as notesController from './notes.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import {
  createNoteSchema,
  updateNoteSchema,
  noteParamsSchema,
} from './notes.dto';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  validate(noteParamsSchema, 'params'),
  notesController.findAll
);

router.post(
  '/',
  validate(noteParamsSchema, 'params'),
  validate(createNoteSchema),
  notesController.create
);

router.patch(
  '/:id',
  validate(noteParamsSchema, 'params'),
  validate(updateNoteSchema),
  notesController.update
);

router.delete(
  '/:id',
  validate(noteParamsSchema, 'params'),
  notesController.remove
);

export default router;
