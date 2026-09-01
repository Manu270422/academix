// ============================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================

import { OAuth2Client } from 'google-auth-library';
import { verificarTokenFacebook } from '../../utils/facebookAuth';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
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

// Cliente de Google para verificar los tokens que manda el frontend.
// Lo creo UNA sola vez aqui arriba, no en cada login (mejor rendimiento).
const googleClient = new OAuth2Client(env.googleClientId);

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
      // proveedorAuth usa el default LOCAL de schema.prisma, no hace
      // falta especificarlo aqui.
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

  // Un usuario que se registro con Google (o Microsoft/Facebook mas
  // adelante) nunca tiene passwordHash. Si intenta entrar con
  // contraseña, le doy un mensaje claro en vez de un error raro.
  if (!usuario.passwordHash) {
    throw new AppError(
      `Esta cuenta usa inicio de sesión con ${usuario.proveedorAuth}. Usa ese método para entrar.`,
      401
    );
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
// LOGIN CON GOOGLE
// ============================================================
/**
 * Recibe el "credential" (un JWT firmado por Google) que genera el
 * boton de Google en el frontend. Lo verifico contra los servidores
 * de Google (asi me aseguro que no sea falso), y con los datos que
 * vienen adentro (correo, nombre, ID unico de Google):
 *   - Si ya existe un usuario LOCAL con ese correo -> error claro,
 *     para que no le "roben" la cuenta a alguien que se registro con
 *     contraseña normal.
 *   - Si ya existe un usuario GOOGLE con ese correo -> lo logueo.
 *   - Si no existe -> le creo la cuenta automaticamente, sin pedirle
 *     que llene el formulario de registro.
 */
export async function loginConGoogle(credential: string): Promise<AuthResponse> {
  if (!env.googleClientId) {
    throw new AppError('El login con Google no está configurado', 500);
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError('El token de Google no es válido', 401);
  }

  if (!payload || !payload.email) {
    throw new AppError('No se pudo obtener el correo de Google', 401);
  }

  const email = payload.email.toLowerCase();
  const nombre = payload.name ?? email.split('@')[0];
  const googleId = payload.sub; // el ID unico que Google le da a esta persona

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
  });

  let usuario;

  if (usuarioExistente) {
    // Ya existe una cuenta con este correo. Verifico que no sea LOCAL
    // (contraseña normal) para no permitir que alguien "entre" a una
    // cuenta ajena solo porque tiene el mismo correo en Google.
    if (usuarioExistente.proveedorAuth === 'LOCAL') {
      throw new AppError(
        'Ya existe una cuenta con este correo usando contraseña. Inicia sesión con tu contraseña.',
        409
      );
    }

    usuario = usuarioExistente;
    logger.info(`Inicio de sesión con Google: ${usuario.email}`);
  } else {
    // No existe: le creo la cuenta automaticamente.
    usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash: null,
        proveedorAuth: 'GOOGLE',
        proveedorId: googleId,
      },
    });
    logger.info(`Nuevo usuario registrado con Google: ${usuario.email} (id: ${usuario.id})`);
  }

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
// LOGIN CON FACEBOOK
// ============================================================
/**
 * Mismo patron que loginConGoogle: verifico el token, y segun el
 * caso (correo nuevo / ya FACEBOOK / ya LOCAL) actuo distinto.
 *
 * Diferencia importante: Facebook puede NO devolver el correo del
 * usuario (si no lo tiene verificado en su cuenta). Como el correo
 * es mi identificador unico, si no viene, no puedo continuar - le
 * pido que intente con otro metodo.
 */
export async function loginConFacebook(accessToken: string): Promise<AuthResponse> {
  const datosFacebook = await verificarTokenFacebook(accessToken);
  if (!datosFacebook.email) {
    throw new AppError(
      'No pudimos obtener tu correo de Facebook. Verifica que tu cuenta de Facebook tenga un correo asociado, o usa otro método de inicio de sesión.',
      400
    );
  }
  const email = datosFacebook.email.toLowerCase();
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
  });
  let usuario;
  if (usuarioExistente) {
    if (usuarioExistente.proveedorAuth === 'LOCAL') {
      throw new AppError(
        'Ya existe una cuenta con este correo usando contraseña. Inicia sesión con tu contraseña.',
        409
      );
    }
    usuario = usuarioExistente;
    logger.info(`Inicio de sesión con Facebook: ${usuario.email}`);
  } else {
    usuario = await prisma.usuario.create({
      data: {
        nombre: datosFacebook.nombre,
        email,
        passwordHash: null,
        proveedorAuth: 'FACEBOOK',
        proveedorId: datosFacebook.id,
      },
    });
    logger.info(`Nuevo usuario registrado con Facebook: ${usuario.email} (id: ${usuario.id})`);
  }
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
 *
 * Solo aplica a usuarios LOCAL: un usuario que entro con Google nunca
 * tuvo contraseña, asi que no tiene sentido "cambiarla" - le explico
 * eso en vez de dejar que el codigo reviente comparando contra null.
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

  if (!usuario.passwordHash) {
    throw new AppError(
      `Tu cuenta usa inicio de sesión con ${usuario.proveedorAuth}, no tiene contraseña para cambiar.`,
      400
    );
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
// ============================================================
// EXPORTAR MIS DATOS (Categoria 3)
// ============================================================
/**
 * Devuelve TODO lo que Academix guarda del usuario, en un unico
 * objeto JSON. El frontend lo ofrece como descarga.
 *
 * Es una buena practica de privacidad (el usuario es dueno de sus
 * datos y puede llevarselos) y ademas util como respaldo.
 */
export async function exportarDatos(userId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nombre: true,
      email: true,
      proveedorAuth: true,
      createdAt: true,
      updatedAt: true,
      materias: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          nombre: true,
          color: true,
          descripcion: true,
          createdAt: true,
          updatedAt: true,
          notas: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              contenido: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          tareas: {
            orderBy: { fechaEntrega: 'asc' },
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              fechaEntrega: true,
              estado: true,
              prioridad: true,
              createdAt: true,
              updatedAt: true,
              subtareas: {
                orderBy: { orden: 'asc' },
                select: { id: true, titulo: true, completada: true, orden: true },
              },
              recordatorios: {
                select: {
                  anticipacionHoras: true,
                  enviadoEmail: true,
                  fechaEnvioEmail: true,
                  leidoEnApp: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return {
    formato: 'academix-export',
    version: 1,
    exportadoEl: new Date().toISOString(),
    usuario,
  };
}

// ============================================================
// ELIMINAR MI CUENTA (Categoria 3)
// ============================================================
/**
 * Borra la cuenta del usuario y, por el onDelete: Cascade del
 * schema, TODO lo suyo: materias, tareas, subtareas, notas,
 * recordatorios y suscripciones push.
 *
 * Es IRREVERSIBLE. Por eso el controller exige la palabra ELIMINAR
 * y, si la cuenta tiene contrasena, tambien la contrasena actual.
 */
export async function eliminarCuenta(
  userId: number,
  password?: string
): Promise<void> {
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // Si la cuenta usa contrasena, la exijo para confirmar identidad.
  // Las cuentas sociales (Google/Facebook) no tienen, asi que se
  // salta este paso.
  if (usuario.passwordHash) {
    if (!password) {
      throw new AppError(
        'Debes ingresar tu contraseña para eliminar la cuenta',
        400
      );
    }
    const passwordValida = await comparePassword(
      password,
      usuario.passwordHash
    );
    if (!passwordValida) {
      throw new AppError('La contraseña no es correcta', 401);
    }
  }

  await prisma.usuario.delete({ where: { id: userId } });

  logger.info(`Cuenta ELIMINADA: usuario ${userId} (${usuario.email})`);
}
