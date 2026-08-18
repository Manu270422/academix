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