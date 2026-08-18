// ============================================================
// CONTROLLER DE SUSCRIPCIONES PUSH
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as pushService from './push.service';
import { getAuthUser } from '../../middlewares/authenticate';
import { SubscribePushDto } from './push.dto';

/**
 * POST /api/v1/push/subscribe
 * El navegador manda su suscripcion push despues de que el
 * estudiante da permiso.
 */
export async function subscribe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const data = req.body as SubscribePushDto;

    await pushService.subscribe(usuario.id, data);

    res.status(201).json({
      success: true,
      message: 'Notificaciones push activadas',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/push/unsubscribe
 */
export async function unsubscribe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = getAuthUser(req);
    const { endpoint } = req.body as { endpoint: string };

    await pushService.unsubscribe(usuario.id, endpoint);

    res.status(200).json({
      success: true,
      message: 'Notificaciones push desactivadas',
    });
  } catch (error) {
    next(error);
  }
}