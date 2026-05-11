// ============================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================

import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateTokenPair, verifyToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './auth.dto';

export interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string;
  createdAt: Date;
}

export interface AuthResponse {
  usuario: UsuarioPublico;
  accessToken: string;
  refreshToken: string;
}

// ============================================================
// REGISTRAR
// ============================================================
export async function register(data: RegisterDto): Promise<AuthResponse> {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email: data.email },
  });
  if (usuarioExistente) {
    throw new AppError('Ya existe un usuario con ese email', 409);
  }

  const passwordHash = await hashPassword(data.password);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash,
    },
    select: { id: true, nombre: true, email: true, createdAt: true },
  });

  logger.info(`Nuevo usuario registrado: ${usuario.email} (id: ${usuario.id})`);

  const tokens = generateTokenPair({
    userId: usuario.id,
    email: usuario.email,
  });

  return { usuario, ...tokens };
}

// ============================================================
// LOGIN
// ============================================================
export async function login(data: LoginDto): Promise<AuthResponse> {
  const usuario = await prisma.usuario.findUnique({
    where: { email: data.email },
  });

  if (!usuario) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const passwordValido = await comparePassword(data.password, usuario.passwordHash);
  if (!passwordValido) {
    throw new AppError('Credenciales inválidas', 401);
  }

  logger.info(`Inicio de sesión exitoso: ${usuario.email}`);

  const tokens = generateTokenPair({
    userId: usuario.id,
    email: usuario.email,
  });

  return {
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      createdAt: usuario.createdAt,
    },
    ...tokens,
  };
}

// ============================================================
// REFRESH
// ============================================================
export async function refresh(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const payload = verifyToken(refreshToken, 'refresh');

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true },
  });

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 401);
  }

  return generateTokenPair({ userId: usuario.id, email: usuario.email });
}

// ============================================================
// OBTENER PERFIL
// ============================================================
export async function getProfile(userId: number): Promise<UsuarioPublico> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, nombre: true, email: true, createdAt: true },
  });

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return usuario;
}

// ============================================================
// ACTUALIZAR PERFIL (Modulo 12)
// ============================================================
/**
 * Actualiza el nombre del usuario autenticado.
 * Por simplicidad solo permito cambiar el nombre por ahora.
 */
export async function updateProfile(
  userId: number,
  data: UpdateProfileDto
): Promise<UsuarioPublico> {
  const usuario = await prisma.usuario.update({
    where: { id: userId },
    data: { nombre: data.nombre },
    select: { id: true, nombre: true, email: true, createdAt: true },
  });

  logger.info(`Perfil actualizado: usuario ${userId}`);

  return usuario;
}

// ============================================================
// CAMBIAR CONTRASENA (Modulo 12)
// ============================================================
/**
 * Cambia la contraseña del usuario autenticado.
 * Por seguridad, requiere la contraseña actual.
 * Asi un atacante con sesión abierta no puede cambiarla sin conocerla.
 */
export async function changePassword(
  userId: number,
  data: ChangePasswordDto
): Promise<void> {
  // PASO 1: Busco al usuario CON el passwordHash para poder comparar.
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // PASO 2: Verifico que la contraseña actual sea correcta.
  const passwordActualValida = await comparePassword(
    data.passwordActual,
    usuario.passwordHash
  );

  if (!passwordActualValida) {
    throw new AppError('La contraseña actual no es correcta', 401);
  }

  // PASO 3: Verifico que la nueva sea diferente a la actual.
  // Sin esto, el usuario podria "cambiarla" por la misma sin darse cuenta.
  const esLaMisma = await comparePassword(
    data.passwordNueva,
    usuario.passwordHash
  );

  if (esLaMisma) {
    throw new AppError(
      'La nueva contraseña debe ser diferente de la actual',
      400
    );
  }

  // PASO 4: Hasheo la nueva contrasena y la guardo.
  const nuevoHash = await hashPassword(data.passwordNueva);

  await prisma.usuario.update({
    where: { id: userId },
    data: { passwordHash: nuevoHash },
  });

  logger.info(`Contraseña cambiada: usuario ${userId}`);
}