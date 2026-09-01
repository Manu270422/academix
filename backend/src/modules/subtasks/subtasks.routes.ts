// ============================================================
// RUTAS DEL MODULO DE SUBTAREAS
// ============================================================
// Van "anidadas" bajo una tarea:
//   POST   /api/v1/tasks/:tareaId/subtasks       -> añadir casilla
//   PATCH  /api/v1/tasks/:tareaId/subtasks/:id   -> marcar / renombrar / reordenar
//   DELETE /api/v1/tasks/:tareaId/subtasks/:id   -> quitar casilla
//
// No hay GET: la lista de subtareas viene incluida dentro de cada
// tarea (ver tasks.service.ts).
//
// Uso Router({ mergeParams: true }) para que este router "vea" el
// :tareaId que define el mount en app.ts.
// ============================================================

import { Router } from 'express';
import * as subtasksController from './subtasks.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import {
  createSubtaskSchema,
  updateSubtaskSchema,
  subtaskParamsSchema,
} from './subtasks.dto';

const router = Router({ mergeParams: true });

// Todas requieren JWT.
router.use(authenticate);

// POST /api/v1/tasks/:tareaId/subtasks
router.post(
  '/',
  validate(subtaskParamsSchema, 'params'),
  validate(createSubtaskSchema),
  subtasksController.create
);

// PATCH /api/v1/tasks/:tareaId/subtasks/:id
router.patch(
  '/:id',
  validate(subtaskParamsSchema, 'params'),
  validate(updateSubtaskSchema),
  subtasksController.update
);

// DELETE /api/v1/tasks/:tareaId/subtasks/:id
router.delete(
  '/:id',
  validate(subtaskParamsSchema, 'params'),
  subtasksController.remove
);

export default router;
