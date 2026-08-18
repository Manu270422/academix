// ============================================================
// RUTAS DEL MÓDULO DE SUSCRIPCIONES PUSH
// ============================================================

import { Router } from 'express';
import * as pushController from './push.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { subscribePushSchema } from './push.dto';

const router = Router();

router.use(authenticate);

router.post('/subscribe', validate(subscribePushSchema), pushController.subscribe);
router.post('/unsubscribe', pushController.unsubscribe);

export default router;