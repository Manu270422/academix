// ============================================================
// RUTAS DEL MODULO DE AUTENTICACIÓN
// ============================================================

import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
// Importo los limiters para proteger las rutas públicas contra fuerza bruta
import { loginLimiter, registerLimiter } from '../../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.dto';

const router = Router();

// ============================================================
// RUTAS PUBLICAS
// ============================================================
// Aplico el limiter antes del validate para rechazar cuanto antes las peticiones excesivas
router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login',    loginLimiter,    validate(loginSchema),    authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);

// ============================================================
// RUTAS PROTEGIDAS
// ============================================================
router.get('/me', authenticate, authController.me);

// PATCH /api/v1/auth/me - actualizar perfil (Modulo 12)
router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile
);

// POST /api/v1/auth/change-password - cambiar contraseña (Modulo 12)
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;