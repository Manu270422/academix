// ============================================================
// SERVICIO DE TAREAS (FRONTEND)
// ============================================================
// Capa que se comunica con los endpoints del backend para tareas.
// Sigue el mismo patron que el servicio de materias.
// ============================================================

import { apiClient } from './client';
import type {
  Tarea,
  EstadoTarea,
  Prioridad,
  ApiResponse,
} from '../types';

// ============================================================
// TIPOS DE PAYLOADS
// ============================================================

export interface CreateTareaPayload {
  titulo: string;
  descripcion?: string;
  fechaEntrega: string; // ISO string
  materiaId: number;
  estado?: EstadoTarea;
  prioridad?: Prioridad;
}

export interface UpdateTareaPayload {
  titulo?: string;
  descripcion?: string | null;
  fechaEntrega?: string;
  estado?: EstadoTarea;
  prioridad?: Prioridad;
}

// Filtros para el listado.
// Coinciden con los query params que acepta GET /tasks en el backend.
export interface TareasFilters {
  estado?: EstadoTarea;
  prioridad?: Prioridad;
  materiaId?: number;
  desde?: string;
  hasta?: string;
}

// ============================================================
// FUNCIONES DEL SERVICIO
// ============================================================

/**
 * GET /tasks?estado=...&prioridad=...&materiaId=...
 * Lista las tareas del usuario con filtros opcionales.
 */
export async function listTareas(
  filters: TareasFilters = {}
): Promise<Tarea[]> {
  // Construyo los query params solo con los valores definidos.
  // Si paso "estado: undefined", axios lo serializa como "estado=undefined" (mal).
  const params = new URLSearchParams();
  if (filters.estado) params.append('estado', filters.estado);
  if (filters.prioridad) params.append('prioridad', filters.prioridad);
  if (filters.materiaId) params.append('materiaId', String(filters.materiaId));
  if (filters.desde) params.append('desde', filters.desde);
  if (filters.hasta) params.append('hasta', filters.hasta);

  const queryString = params.toString();
  const url = queryString ? `/tasks?${queryString}` : '/tasks';

  const response = await apiClient.get<ApiResponse<Tarea[]>>(url);
  return response.data.data;
}

/**
 * POST /tasks
 * Crea una nueva tarea.
 */
export async function createTarea(
  data: CreateTareaPayload
): Promise<Tarea> {
  const response = await apiClient.post<ApiResponse<Tarea>>('/tasks', data);
  return response.data.data;
}

/**
 * PATCH /tasks/:id
 * Actualiza una tarea.
 */
export async function updateTarea(
  id: number,
  data: UpdateTareaPayload
): Promise<Tarea> {
  const response = await apiClient.patch<ApiResponse<Tarea>>(
    `/tasks/${id}`,
    data
  );
  return response.data.data;
}

/**
 * PATCH /tasks/:id/status
 * Endpoint dedicado para cambiar SOLO el estado.
 * Cumple con la HU07 de forma optimizada.
 */
export async function updateTareaEstado(
  id: number,
  estado: EstadoTarea
): Promise<Tarea> {
  const response = await apiClient.patch<ApiResponse<Tarea>>(
    `/tasks/${id}/status`,
    { estado }
  );
  return response.data.data;
}

/**
 * DELETE /tasks/:id
 */
export async function deleteTarea(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}