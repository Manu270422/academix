// ============================================================
// SERVICIO DE AUTENTICACION (FRONTEND)
// ============================================================

import { apiClient } from './client';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  Usuario,
  ApiResponse,
} from '../types';

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/register',
    data
  );
  return response.data.data;
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/login',
    credentials
  );
  return response.data.data;
}

/**
 * POST /auth/google
 * Login (o registro automatico) con el "credential" que devuelve
 * el boton de Google Identity Services.
 */
export async function loginConGoogle(
  credential: string
): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/google',
    { credential }
  );
  return response.data.data;
}

/**
 * POST /auth/facebook
 * Login (o registro automatico) con el accessToken que devuelve
 * el SDK de Facebook.
 */
export async function loginConFacebook(
  accessToken: string
): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/facebook',
    { accessToken }
  );
  return response.data.data;
}

export async function getMe(): Promise<Usuario> {
  const response = await apiClient.get<ApiResponse<Usuario>>('/auth/me');
  return response.data.data;
}

/**
 * PATCH /auth/me
 * Actualiza el perfil del usuario.
 */
export async function updateProfile(data: { nombre: string }): Promise<Usuario> {
  const response = await apiClient.patch<ApiResponse<Usuario>>(
    '/auth/me',
    data
  );
  return response.data.data;
}

/**
 * POST /auth/change-password
 * Cambia la contrasena del usuario.
 */
export async function changePassword(data: {
  passwordActual: string;
  passwordNueva: string;
}): Promise<void> {
  await apiClient.post('/auth/change-password', data);
}

/**
 * GET /auth/me/export
 * Devuelve todos los datos del usuario (perfil + materias + notas +
 * tareas + subtareas + recordatorios) para descargarlos.
 */
export async function exportarMisDatos(): Promise<unknown> {
  const response = await apiClient.get<ApiResponse<unknown>>('/auth/me/export');
  return response.data.data;
}

/**
 * DELETE /auth/me
 * Elimina la cuenta y TODOS los datos. Irreversible.
 * "confirmacion" debe ser la palabra "ELIMINAR". "password" solo es
 * necesaria si la cuenta usa contraseña (no para Google/Facebook).
 */
export async function eliminarMiCuenta(data: {
  confirmacion: 'ELIMINAR';
  password?: string;
}): Promise<void> {
  await apiClient.delete('/auth/me', { data });
}