// ============================================================
// RUTAS DEL MÓDULO DE RECORDATORIOS
// ============================================================
//   GET   /reminders          -> listar mis notificaciones
//   PATCH /reminders/:id/read -> marcar una notificacion como leida
//
// Igual que en los demas modulos, todas protegidas con "authenticate".
// ============================================================

import { Router } from 'express';
import * as remindersController from './reminders.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { reminderIdParamSchema } from './reminders.dto';

const router = Router();

router.use(authenticate);

// GET /api/v1/reminders - Listar mis notificaciones
router.get('/', remindersController.findAll);

// PATCH /api/v1/reminders/:id/read - Marcar como leida
router.patch(
  '/:id/read',
  validate(reminderIdParamSchema, 'params'),
  remindersController.markAsRead
);

export default router;