// ============================================================
// SERVICIO DE SUBTAREAS (FRONTEND)
// ============================================================
// Las subtareas viven "dentro" de una tarea, así que sus endpoints
// van anidados: /tasks/:tareaId/subtasks[/:id].
//
// No hay un "listSubtareas": la lista llega incluida en cada tarea
// cuando pido GET /tasks (ver tasks.service.ts del frontend).
// ============================================================

import { apiClient } from './client';
import type { Subtarea, ApiResponse } from '../types';

export interface UpdateSubtareaPayload {
  titulo?: string;
  completada?: boolean;
  orden?: number;
}

/**
 * POST /tasks/:tareaId/subtasks
 * Añade una casilla al checklist de la tarea.
 */
export async function createSubtarea(
  tareaId: number,
  titulo: string
): Promise<Subtarea> {
  const res = await apiClient.post<ApiResponse<Subtarea>>(
    `/tasks/${tareaId}/subtasks`,
    { titulo }
  );
  return res.data.data;
}

/**
 * PATCH /tasks/:tareaId/subtasks/:id
 * Marca/desmarca, renombra o reordena una subtarea.
 */
export async function updateSubtarea(
  tareaId: number,
  id: number,
  data: UpdateSubtareaPayload
): Promise<Subtarea> {
  const res = await apiClient.patch<ApiResponse<Subtarea>>(
    `/tasks/${tareaId}/subtasks/${id}`,
    data
  );
  return res.data.data;
}

/**
 * DELETE /tasks/:tareaId/subtasks/:id
 */
export async function deleteSubtarea(
  tareaId: number,
  id: number
): Promise<void> {
  await apiClient.delete(`/tasks/${tareaId}/subtasks/${id}`);
}
