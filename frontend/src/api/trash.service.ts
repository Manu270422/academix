// ============================================================
// SERVICIO DE PAPELERA (FRONTEND)
// ============================================================
// Lo que se "elimina" en Materias o Tareas va a la papelera (el
// backend hace borrado suave). Desde aquí se restaura o se borra de
// verdad.
// ============================================================

import { apiClient } from './client';
import type { Materia, Tarea, ApiResponse } from '../types';

export interface Papelera {
  materias: Materia[];
  tareas: Tarea[];
}

export async function getPapelera(): Promise<Papelera> {
  const res = await apiClient.get<ApiResponse<Papelera>>('/trash');
  return res.data.data;
}

export async function restaurarMateria(id: number): Promise<void> {
  await apiClient.post(`/subjects/${id}/restore`);
}

export async function eliminarMateriaDef(id: number): Promise<void> {
  await apiClient.delete(`/subjects/${id}/permanent`);
}

export async function restaurarTarea(id: number): Promise<void> {
  await apiClient.post(`/tasks/${id}/restore`);
}

export async function eliminarTareaDef(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}/permanent`);
}

export async function vaciarPapelera(): Promise<void> {
  await apiClient.delete('/trash');
}
