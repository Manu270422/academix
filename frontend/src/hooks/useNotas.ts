// ============================================================
// HOOKS DE REACT QUERY PARA NOTAS
// ============================================================
// Cada mutación invalida la query de materias: así la materia se
// vuelve a pedir y su lista de notas (incluida en la respuesta)
// queda al día sin cache extra.
// ============================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as notesService from '../api/notes.service';

function useInvalidarMaterias() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['materias'] });
}

export function useCreateNota() {
  const invalidar = useInvalidarMaterias();
  return useMutation({
    mutationFn: ({
      materiaId,
      contenido,
    }: {
      materiaId: number;
      contenido: string;
    }) => notesService.createNota(materiaId, contenido),
    onSuccess: invalidar,
  });
}

export function useUpdateNota() {
  const invalidar = useInvalidarMaterias();
  return useMutation({
    mutationFn: ({
      materiaId,
      id,
      contenido,
    }: {
      materiaId: number;
      id: number;
      contenido: string;
    }) => notesService.updateNota(materiaId, id, contenido),
    onSuccess: invalidar,
  });
}

export function useDeleteNota() {
  const invalidar = useInvalidarMaterias();
  return useMutation({
    mutationFn: ({ materiaId, id }: { materiaId: number; id: number }) =>
      notesService.deleteNota(materiaId, id),
    onSuccess: invalidar,
  });
}
