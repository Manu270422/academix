// ============================================================
// UTILIDAD PARA TOKENS JWT
// ============================================================
// JWT (JSON Web Token) es un estandar para enviar informacion
// firmada criptograficamente entre cliente y servidor.
//
// Un JWT tiene 3 partes separadas por puntos: header.payload.signature
// - header: algoritmo usado y tipo de token
// - payload: los datos (yo guardo el id y email del usuario)
// - signature: firma con un secreto que SOLO el servidor conoce
//
// Si alguien modifica el payload, la firma deja de coincidir y el token
// se vuelve invalido. Por eso es seguro confiar en el contenido (siempre
// y cuando mi JWT_SECRET no se filtre).
//
// USO DOS TOKENS:
// - accessToken: corto (15 min), viaja en cada petición.
// - refreshToken: largo (7 días), solo se usa para pedir un nuevo accessToken.
// Esto reduce el riesgo si un accessToken se filtra.
// ============================================================

import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';

// Defino que datos voy a meter dentro del JWT (el "payload").
// Solo guardo lo MÍNIMO necesario: id del usuario y email.
// Nunca meto datos sensibles (como el password hash) porque el payload
// se puede leer (no esta cifrado, solo firmado).
export interface JwtPayload {
  userId: number;
  email: string;
}

// Defino el tipo de token para distinguir access de refresh.
type TokenType = 'access' | 'refresh';

/**
 * Genera un token JWT con los datos del usuario.
 */
export function generateToken(payload: JwtPayload, type: TokenType): string {
  // Selecciono el secreto y la duracion segun el tipo de token.
  // Uso secretos DIFERENTES para access y refresh por seguridad:
  // si se filtra uno, el otro sigue siendo valido.
  const secret = type === 'access' ? env.jwt.accessSecret : env.jwt.refreshSecret;
  const expiresIn =
    type === 'access' ? env.jwt.accessExpiresIn : env.jwt.refreshExpiresIn;

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

/**
 * Verifica un token JWT y devuelve su payload si es valido.
 * Si el token esta expirado, manipulado o mal formado, lanza un AppError 401.
 */
export function verifyToken(token: string, type: TokenType): JwtPayload {
  const secret = type === 'access' ? env.jwt.accessSecret : env.jwt.refreshSecret;

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    // Diferencio el mensaje segun el tipo de error para ayudar al frontend
    // a decidir que hacer (por ejemplo, si expiro pedir refresh).
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('El token ha expirado', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Token inválido', 401);
    }
    throw new AppError('No se pudo verificar el token', 401);
  }
}

/**
 * Genera ambos tokens (access y refresh) de una vez.
 * Lo uso al hacer login o al registrar un usuario nuevo.
 */
export function generateTokenPair(payload: JwtPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateToken(payload, 'access'),
    refreshToken: generateToken(payload, 'refresh'),
  };
}