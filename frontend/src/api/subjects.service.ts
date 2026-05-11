// ============================================================
// SERVICIO DE MATERIAS (FRONTEND)
// ============================================================
// Aqui aislo todas las llamadas HTTP relacionadas con materias.
// Los hooks de React Query van a consumir estas funciones, no a apiClient
// directamente. Asi mantengo separadas las capas:
//   - service: como hablo con la API.
//   - hooks: como conecto los datos a los componentes.
//   - componentes: solo se preocupan de mostrar.
// ============================================================

import { apiClient } from './client';
import type { Materia, ApiResponse } from '../types';

// ============================================================
// TIPOS DE PAYLOADS
// ============================================================
// Defino aqui los tipos que el cliente envia al backend.
// Coinciden con los DTOs de Zod que validan en el backend.

export interface CreateMateriaPayload {
  nombre: string;
  color?: string;
  descripcion?: string;
}

export interface UpdateMateriaPayload {
  nombre?: string;
  color?: string;
  descripcion?: string | null;
}

// ============================================================
// FUNCIONES DEL SERVICIO
// ============================================================

/**
 * GET /subjects
 * Lista todas las materias del usuario autenticado.
 */
export async function listMaterias(): Promise<Materia[]> {
  const response = await apiClient.get<ApiResponse<Materia[]>>('/subjects');
  return response.data.data;
}

/**
 * GET /subjects/:id
 * Obtiene una materia especifica.
 */
export async function getMateria(id: number): Promise<Materia> {
  const response = await apiClient.get<ApiResponse<Materia>>(`/subjects/${id}`);
  return response.data.data;
}

/**
 * POST /subjects
 * Crea una nueva materia.
 */
export async function createMateria(
  data: CreateMateriaPayload
): Promise<Materia> {
  const response = await apiClient.post<ApiResponse<Materia>>(
    '/subjects',
    data
  );
  return response.data.data;
}

/**
 * PATCH /subjects/:id
 * Actualiza una materia.
 */
export async function updateMateria(
  id: number,
  data: UpdateMateriaPayload
): Promise<Materia> {
  const response = await apiClient.patch<ApiResponse<Materia>>(
    `/subjects/${id}`,
    data
  );
  return response.data.data;
}

/**
 * DELETE /subjects/:id
 * Elimina una materia (y por cascade, todas sus tareas).
 */
export async function deleteMateria(id: number): Promise<void> {
  await apiClient.delete(`/subjects/${id}`);
}