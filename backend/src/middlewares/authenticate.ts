// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================
// Este middleware se encarga de proteger las rutas privadas del backend.
// Su trabajo es verificar que la petición incluya un JWT valido en el
// header "Authorization", y si es asi, anadir los datos del usuario
// al objeto "req" para que los controllers los puedan usar.
//
// FLUJO:
//   1. El cliente envia: Authorization: Bearer <accessToken>
//   2. Yo extraigo el token del header.
//   3. Lo verifico con la utilidad jwt.ts del Modulo 3.
//   4. Si es valido -> guardo userId y email en req.user y dejo pasar.
//   5. Si no es valido -> respondo 401 y bloqueo la petición.
//
// USO:
//   router.get('/perfil', authenticate, miControlador);
//
// El middleware se pone ANTES del controller. Si falla la autenticación,
// el controller nunca se ejecuta.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

/**
 * Middleware que verifica el JWT y autentica al usuario.
 * Si todo va bien, anade req.user con los datos del usuario.
 * Si falla, lanza un AppError 401 que captura el errorHandler central.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    // PASO 1: Obtengo el header "Authorization".
    // Express normaliza los headers a minusculas, asi que uso "authorization".
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('No se proporcionó el token de autenticación', 401);
    }

    // PASO 2: El header debe tener el formato "Bearer <token>".
    // Lo divido por el espacio y verifico que tenga las dos partes.
    // Sin esta validación estricta, alguien podria mandar "Bearer" sin token
    // y mi codigo intentaria verificar undefined.
    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      throw new AppError(
        'Formato de autorización inválido. Se espera: Bearer <token>',
        401
      );
    }

    const token = partes[1];

    // Validación extra: el token no puede ser cadena vacía.
    if (!token) {
      throw new AppError('El token esta vacío', 401);
    }

    // PASO 3: Verifico el token usando mi utilidad del Modulo 3.
    // Si está expirado, mal firmado o manipulado, lanza AppError 401.
    const payload = verifyToken(token, 'access');

    // PASO 4: Adjunto los datos del usuario al request.
    // Gracias a la extensión de tipos en src/types/express.d.ts,
    // TypeScript reconoce req.user perfectamente tipado.
    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    // PASO 5: Dejo pasar la petición al siguiente middleware o controller.
    next();
  } catch (error) {
    // Registro intentos fallidos: útil para detectar ataques de fuerza bruta
    // o tokens robados que se siguen usando despues de expirar.
    if (error instanceof AppError) {
      logger.warn(`Autenticacion fallida: ${error.message}`);
    }
    // Paso el error al errorHandler central para que arme la respuesta JSON.
    next(error);
  }
}

/**
 * Helper para usar dentro de los controllers cuando necesito acceder al
 * usuario autenticado. Si por algún motivo req.user no existe (no debe pasar
 * si la ruta esta bien protegida), lanza un error claro.
 *
 * Uso:
 *   const usuario = getAuthUser(req);
 *   const tareas = await prisma.tarea.findMany({ where: { usuarioId: usuario.id } });
 */
export function getAuthUser(req: Request): { id: number; email: string } {
  if (!req.user) {
    // Esto solo debería ocurrir si olvido aplicar el middleware "authenticate"
    // a la ruta. El error 500 me ayuda a detectar ese bug rápidamente.
    throw new AppError(
      'Usuario no autenticado. Olvidé aplicar el middleware authenticate?',
      500
    );
  }
  return req.user;
}