// ============================================================
// SERVICIO DE NOTAS (FRONTEND)
// ============================================================
// Las notas viven "dentro" de una materia: sus endpoints van
// anidados en /subjects/:materiaId/notes[/:id].
//
// No uso un "listNotas" propio: la lista llega incluida en la
// materia al pedir GET /subjects/:id (ver useMateria).
// ============================================================

import { apiClient } from './client';
import type { Nota, ApiResponse } from '../types';

export async function createNota(
  materiaId: number,
  contenido: string
): Promise<Nota> {
  const res = await apiClient.post<ApiResponse<Nota>>(
    `/subjects/${materiaId}/notes`,
    { contenido }
  );
  return res.data.data;
}

export async function updateNota(
  materiaId: number,
  id: number,
  contenido: string
): Promise<Nota> {
  const res = await apiClient.patch<ApiResponse<Nota>>(
    `/subjects/${materiaId}/notes/${id}`,
    { contenido }
  );
  return res.data.data;
}

export async function deleteNota(materiaId: number, id: number): Promise<void> {
  await apiClient.delete(`/subjects/${materiaId}/notes/${id}`);
}
