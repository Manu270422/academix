// ============================================================
// HOOKS DE REACT QUERY PARA LA PAPELERA
// ============================================================
// Cada acción invalida la papelera Y las listas de materias/tareas
// (porque restaurar hace reaparecer cosas, y borrar/vaciar las quita).
// ============================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as trashService from '../api/trash.service';

const PAPELERA_KEY = ['papelera'] as const;

export function usePapeleraList() {
  return useQuery({
    queryKey: PAPELERA_KEY,
    queryFn: trashService.getPapelera,
  });
}

function useInvalidarTodo() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: PAPELERA_KEY });
    queryClient.invalidateQueries({ queryKey: ['materias'] });
    queryClient.invalidateQueries({ queryKey: ['tareas'] });
  };
}

export function useRestaurarMateria() {
  const invalidar = useInvalidarTodo();
  return useMutation({
    mutationFn: (id: number) => trashService.restaurarMateria(id),
    onSuccess: invalidar,
  });
}

export function useEliminarMateriaDef() {
  const invalidar = useInvalidarTodo();
  return useMutation({
    mutationFn: (id: number) => trashService.eliminarMateriaDef(id),
    onSuccess: invalidar,
  });
}

export function useRestaurarTarea() {
  const invalidar = useInvalidarTodo();
  return useMutation({
    mutationFn: (id: number) => trashService.restaurarTarea(id),
    onSuccess: invalidar,
  });
}

export function useEliminarTareaDef() {
  const invalidar = useInvalidarTodo();
  return useMutation({
    mutationFn: (id: number) => trashService.eliminarTareaDef(id),
    onSuccess: invalidar,
  });
}

export function useVaciarPapelera() {
  const invalidar = useInvalidarTodo();
  return useMutation({
    mutationFn: () => trashService.vaciarPapelera(),
    onSuccess: invalidar,
  });
}
