// ============================================================
// HOOKS DE REACT QUERY PARA MATERIAS
// ============================================================
// React Query maneja todo lo relacionado con datos del servidor:
//   - Cache automático.
//   - Refetch en background.
//   - Estados de carga, error, exito.
//   - Invalidacion al crear/editar/borrar.
//
// Defino UN hook por operacion. Los componentes los usan asi:
//   const { data, isLoading } = useMateriasList();
//   const createMutation = useCreateMateria();
//   createMutation.mutate({ nombre: 'Matematicas IV' });
//
// La gracia: cualquier cambio (crear, editar, borrar) inválida el cache
// de la lista, asi React Query la vuelve a pedir y la UI se actualiza sola.
// ============================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as subjectsService from '../api/subjects.service';
import type {
  CreateMateriaPayload,
  UpdateMateriaPayload,
} from '../api/subjects.service';

// ============================================================
// CLAVE DE CACHE
// ============================================================
// Las queryKeys son como "etiquetas" que identifican datos en el cache.
// Las centralizo en una constante para no equivocarme escribiendolas.
// Si mañana decido cambiarlas, lo hago en un solo lugar.
const MATERIAS_KEY = ['materias'] as const;

// ============================================================
// HOOK: LISTAR MATERIAS
// ============================================================
/**
 * Devuelve la lista de materias del usuario autenticado.
 * React Query la cachea con la clave "materias".
 */
export function useMateriasList() {
  return useQuery({
    queryKey: MATERIAS_KEY,
    queryFn: subjectsService.listMaterias,
  });
}

// ============================================================
// HOOK: CREAR MATERIA
// ============================================================
/**
 * Devuelve una "mutation" para crear materias.
 * Después de crear, inválida el cache de la lista para que se refetchee.
 */
export function useCreateMateria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMateriaPayload) =>
      subjectsService.createMateria(data),
    // onSuccess se ejecuta despues de que la creacion sea exitosa.
    // Invalido el cache para que la lista se vuelva a pedir.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAS_KEY });
    },
  });
}

// ============================================================
// HOOK: ACTUALIZAR MATERIA
// ============================================================
export function useUpdateMateria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMateriaPayload;
    }) => subjectsService.updateMateria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAS_KEY });
    },
  });
}

// ============================================================
// HOOK: ELIMINAR MATERIA
// ============================================================
export function useDeleteMateria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => subjectsService.deleteMateria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAS_KEY });
      // También inválido tareas porque al borrar materia se borran sus tareas (cascade).
      // Asi cuando vaya a la página de tareas, los datos estan frescos.
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });
}