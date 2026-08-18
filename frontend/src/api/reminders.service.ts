// ============================================================
// SERVICIO DE RECORDATORIOS (FRONTEND)
// ============================================================
// Capa que se comunica con los endpoints del backend para las
// notificaciones de la campanita. Sigue el mismo patron que el
// servicio de tareas y de materias.
// ============================================================

import { apiClient } from './client';
import type { Recordatorio, ApiResponse } from '../types';

// ============================================================
// TIPOS DE RESPUESTA
// ============================================================

// La lista de notificaciones viene acompañada de un contador de
// cuantas estan sin leer (lo uso para el numerito rojo de la campanita).
export interface RecordatoriosResult {
  recordatorios: Recordatorio[];
  noLeidos: number;
}

// ============================================================
// FUNCIONES DEL SERVICIO
// ============================================================

/**
 * GET /reminders
 * Lista las notificaciones (recordatorios ya enviados) del usuario.
 */
export async function listRecordatorios(): Promise<RecordatoriosResult> {
  const response = await apiClient.get<ApiResponse<Recordatorio[]>>(
    '/reminders'
  );
  return {
    recordatorios: response.data.data,
    noLeidos: response.data.meta?.noLeidos ?? 0,
  };
}

/**
 * PATCH /reminders/:id/read
 * Marca una notificacion como leida.
 */
export async function marcarRecordatorioComoLeido(
  id: number
): Promise<Recordatorio> {
  const response = await apiClient.patch<ApiResponse<Recordatorio>>(
    `/reminders/${id}/read`
  );
  return response.data.data;
}