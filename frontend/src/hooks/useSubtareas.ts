// ============================================================
// HOOKS DE REACT QUERY PARA SUBTAREAS
// ============================================================
// Cada mutación, al terminar, invalida la query de tareas: así la
// lista se vuelve a pedir y el checklist (que viene incluido en cada
// tarea) queda al día sin lógica de cache extra.
// ============================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as subtasksService from '../api/subtasks.service';
import type { UpdateSubtareaPayload } from '../api/subtasks.service';

function useInvalidarTareas() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['tareas'] });
}

export function useCreateSubtarea() {
  const invalidar = useInvalidarTareas();
  return useMutation({
    mutationFn: ({ tareaId, titulo }: { tareaId: number; titulo: string }) =>
      subtasksService.createSubtarea(tareaId, titulo),
    onSuccess: invalidar,
  });
}

export function useUpdateSubtarea() {
  const invalidar = useInvalidarTareas();
  return useMutation({
    mutationFn: ({
      tareaId,
      id,
      data,
    }: {
      tareaId: number;
      id: number;
      data: UpdateSubtareaPayload;
    }) => subtasksService.updateSubtarea(tareaId, id, data),
    onSuccess: invalidar,
  });
}

export function useDeleteSubtarea() {
  const invalidar = useInvalidarTareas();
  return useMutation({
    mutationFn: ({ tareaId, id }: { tareaId: number; id: number }) =>
      subtasksService.deleteSubtarea(tareaId, id),
    onSuccess: invalidar,
  });
}
