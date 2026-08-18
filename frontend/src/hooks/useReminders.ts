// ============================================================
// HOOKS DE REACT QUERY PARA RECORDATORIOS (NOTIFICACIONES)
// ============================================================
// Manejan el estado del servidor para las notificaciones de la
// campanita. Sigue el mismo patron que useTareas.ts.
// ============================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as remindersService from '../api/reminders.service';

// Clave base para el cache de recordatorios.
const RECORDATORIOS_KEY = 'recordatorios';

// ============================================================
// HOOK: LISTAR NOTIFICACIONES
// ============================================================
/**
 * Trae las notificaciones del usuario para la campanita.
 * Le pongo refetchInterval para que se actualice sola cada minuto,
 * sin que el usuario tenga que recargar la pagina para enterarse
 * de un recordatorio nuevo que llego mientras tenia Academix abierto.
 */
export function useRecordatorios() {
  return useQuery({
    queryKey: [RECORDATORIOS_KEY],
    queryFn: () => remindersService.listRecordatorios(),
    refetchInterval: 60 * 1000, // 60 segundos
  });
}

// ============================================================
// HOOK: MARCAR NOTIFICACION COMO LEIDA
// ============================================================
export function useMarcarRecordatorioLeido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      remindersService.marcarRecordatorioComoLeido(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECORDATORIOS_KEY] });
    },
  });
}