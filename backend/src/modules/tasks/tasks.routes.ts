// ============================================================
// RUTAS DEL MÓDULO DE TAREAS
// ============================================================
// Convencion REST que sigo:
//   POST   /tasks            -> crear tarea
//   GET    /tasks            -> listar mis tareas (con filtros)
//   GET    /tasks/:id        -> ver una tarea
//   PATCH  /tasks/:id        -> actualizar tarea
//   PATCH  /tasks/:id/status -> cambiar SOLO el estado (HU07)
//   DELETE /tasks/:id        -> eliminar tarea
//
// TODAS las rutas están protegidas con authenticate.
// ============================================================

import { Router } from 'express';
import * as tasksController from './tasks.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskIdParamSchema,
  listTasksQuerySchema,
} from './tasks.dto';

const router = Router();

// Protección global del router: todas las rutas requieren JWT.
router.use(authenticate);

// ============================================================
// POST /api/v1/tasks - Crear tarea
// ============================================================
router.post('/', validate(createTaskSchema), tasksController.create);

// ============================================================
// GET /api/v1/tasks - Listar tareas con filtros opcionales
// ============================================================
// Valido los query params (estado, prioridad, etc.) con el esquema.
router.get(
  '/',
  validate(listTasksQuerySchema, 'query'),
  tasksController.findAll
);

// ============================================================
// GET /api/v1/tasks/:id - Ver una tarea
// ============================================================
router.get(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  tasksController.findOne
);

// ============================================================
// PATCH /api/v1/tasks/:id - Actualizar tarea
// ============================================================
router.patch(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema),
  tasksController.update
);

// ============================================================
// PATCH /api/v1/tasks/:id/status - Cambiar SOLO el estado (HU07)
// ============================================================
// Este es un endpoint dedicado para una sola accion: cambiar estado.
// Es más claro que pasar el estado por el update general.
router.patch(
  '/:id/status',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskStatusSchema),
  tasksController.updateStatus
);

// ============================================================
// DELETE /api/v1/tasks/:id - Eliminar tarea
// ============================================================
router.delete(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  tasksController.remove
);

// ============================================================
// PAPELERA
// ============================================================
// POST   /api/v1/tasks/:id/restore    -> sacar de la papelera
// DELETE /api/v1/tasks/:id/permanent  -> borrar para siempre
router.post(
  '/:id/restore',
  validate(taskIdParamSchema, 'params'),
  tasksController.restore
);
router.delete(
  '/:id/permanent',
  validate(taskIdParamSchema, 'params'),
  tasksController.removePermanent
);

export default router;