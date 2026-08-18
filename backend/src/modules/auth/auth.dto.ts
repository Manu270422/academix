// ============================================================
// DTOs Y ESQUEMAS DE VALIDACIÓN DEL MODULO AUTH
// ============================================================

import { z } from 'zod';

// ============================================================
// ESQUEMA: REGISTRO DE USUARIO
// ============================================================
export const registerSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener mas de 100 caracteres'),
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .trim()
    .toLowerCase()
    .email('El formato del email no es válido')
    .max(150, 'El email es demasiado largo'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(64, 'La contraseña no puede tener mas de 64 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una mínuscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
});

// ============================================================
// ESQUEMA: LOGIN
// ============================================================
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .trim()
    .toLowerCase()
    .email('El formato del email no es válido'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña no puede estar vacía'),
});

// ============================================================
// ESQUEMA: LOGIN CON GOOGLE
// ============================================================
// El frontend me manda el "credential" que devuelve Google Identity
// Services (un JWT firmado por Google). Aqui solo verifico que venga
// como string; la validacion REAL de que el token es autentico la
// hace google-auth-library en auth.service.ts, verificando la firma
// contra los servidores de Google.
export const googleLoginSchema = z.object({
  credential: z
    .string({ required_error: 'El credential de Google es obligatorio' })
    .min(1, 'El credential no puede estar vacío'),
});

// ============================================================
// ESQUEMA: REFRESH TOKEN
// ============================================================
export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: 'El refreshToken es obligatorio' })
    .min(1, 'El refreshToken no puede estar vacío'),
});

// ============================================================
// ESQUEMA: ACTUALIZAR PERFIL (Modulo 12)
// ============================================================
// Por ahora solo permito cambiar el nombre.
// El email es identificador unico y cambiarlo puede causar problemas
// si el usuario lo olvida; por seguridad lo dejo fijo.
export const updateProfileSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
});

// ============================================================
// ESQUEMA: CAMBIAR CONTRASENA (Modulo 12)
// ============================================================
// Pido la contraseña ACTUAL por seguridad.
// Si alguien deja la sesión abierta, no puede cambiar la contraseña
// sin conocer la actual. Es el estándar de la industria.
//
// NOTA: este endpoint solo aplica a usuarios con proveedorAuth LOCAL.
// Un usuario que entro por Google nunca tuvo contraseña que cambiar
// (ver auth.service.ts, ahi valido eso antes de procesar el cambio).
export const changePasswordSchema = z.object({
  passwordActual: z
    .string({ required_error: 'La contraseña actual es obligatoria' })
    .min(1, 'La contraseña actual no puede estar vacía'),
  passwordNueva: z
    .string({ required_error: 'La contraseña nueva es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(64, 'La contraseña no puede tener mas de 64 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una mínuscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
});

// ============================================================
// TIPOS DERIVADOS
// ============================================================
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type GoogleLoginDto = z.infer<typeof googleLoginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;