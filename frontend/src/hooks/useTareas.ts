// ============================================================
// HOOKS DE REACT QUERY PARA TAREAS
// ============================================================
// Manejan el estado del servidor para tareas.
// La lista de tareas tiene filtros, asi que la queryKey incluye
// los filtros para que React Query cachee cada combinación por separado.
// ============================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tasksService from '../api/tasks.service';
import type {
  CreateTareaPayload,
  UpdateTareaPayload,
  TareasFilters,
} from '../api/tasks.service';
import type { EstadoTarea } from '../types';

// Clave base para el cache de tareas.
// Cuando inválido por ['tareas'], se invalidan TODAS las queries
// que empiezan con esa clave (con cualquier filtro).
const TAREAS_KEY = 'tareas';

// ============================================================
// HOOK: LISTAR TAREAS (CON FILTROS)
// ============================================================
/**
 * Lista tareas, opcionalmente filtradas.
 * La queryKey incluye los filtros: ['tareas', { estado: 'PENDIENTE' }].
 * Asi React Query cachea cada combinación por separado y no
 * vuelve a pedir si el usuario regresa a un filtro previo.
 */
export function useTareasList(filters: TareasFilters = {}) {
  return useQuery({
    queryKey: [TAREAS_KEY, filters],
    queryFn: () => tasksService.listTareas(filters),
  });
}

// ============================================================
// HOOK: CREAR TAREA
// ============================================================
export function useCreateTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTareaPayload) => tasksService.createTarea(data),
    onSuccess: () => {
      // Inválido todas las variantes de la query de tareas.
      queryClient.invalidateQueries({ queryKey: [TAREAS_KEY] });
      // También inválido materias porque el _count.tareas cambio.
      queryClient.invalidateQueries({ queryKey: ['materias'] });
    },
  });
}

// ============================================================
// HOOK: ACTUALIZAR TAREA
// ============================================================
export function useUpdateTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTareaPayload }) =>
      tasksService.updateTarea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAREAS_KEY] });
    },
  });
}

// ============================================================
// HOOK: CAMBIAR ESTADO DE TAREA (HU07)
// ============================================================
/**
 * Hook dedicado para cambiar el estado.
 * Lo separo del update general para mejor claridad y porque
 * usa un endpoint distinto en el backend.
 */
export function useUpdateTareaEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoTarea }) =>
      tasksService.updateTareaEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAREAS_KEY] });
    },
  });
}

// ============================================================
// HOOK: ELIMINAR TAREA
// ============================================================
export function useDeleteTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tasksService.deleteTarea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAREAS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['materias'] });
    },
  });
}