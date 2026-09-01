// ============================================================
// RUTAS DEL MODULO DE PAPELERA
// ============================================================
//   GET    /api/v1/trash  -> ver lo eliminado
//   DELETE /api/v1/trash  -> vaciar la papelera (borrado definitivo)
//
// Restaurar y borrar un elemento concreto viven en sus propios
// modulos: POST /subjects/:id/restore, DELETE /tasks/:id/permanent, etc.
// ============================================================

import { Router } from 'express';
import * as trashController from './trash.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', trashController.findAll);
router.delete('/', trashController.empty);

export default router;
