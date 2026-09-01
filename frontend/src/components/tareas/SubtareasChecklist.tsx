// ============================================================
// COMPONENTE: SUBTAREASCHECKLIST
// ============================================================
// El checklist de una tarea: partir una entrega grande en pasos.
// Cada acción (crear, marcar, borrar) llama a su endpoint al
// instante y refresca la lista de tareas.
// ============================================================

import { useState, type FormEvent } from 'react';
import type { Tarea } from '../../types';
import {
  useCreateSubtarea,
  useUpdateSubtarea,
  useDeleteSubtarea,
} from '../../hooks/useSubtareas';

interface SubtareasChecklistProps {
  tarea: Tarea;
}

export function SubtareasChecklist({ tarea }: SubtareasChecklistProps) {
  const subtareas = tarea.subtareas ?? [];
  const [nuevoTitulo, setNuevoTitulo] = useState('');

  const crear = useCreateSubtarea();
  const actualizar = useUpdateSubtarea();
  const borrar = useDeleteSubtarea();

  function handleAgregar(e: FormEvent) {
    e.preventDefault();
    const titulo = nuevoTitulo.trim();
    if (!titulo) return;
    crear.mutate(
      { tareaId: tarea.id, titulo },
      { onSuccess: () => setNuevoTitulo('') }
    );
  }

  function toggle(id: number, completada: boolean) {
    actualizar.mutate({ tareaId: tarea.id, id, data: { completada } });
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
      {subtareas.length > 0 && (
        <ul className="space-y-1">
          {subtareas.map((s) => (
            <li key={s.id} className="group flex items-center gap-2">
              <input
                type="checkbox"
                checked={s.completada}
                onChange={(e) => toggle(s.id, e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                aria-label={`Marcar "${s.titulo}"`}
              />
              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  s.completada
                    ? 'text-gray-400 line-through dark:text-gray-500'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {s.titulo}
              </span>
              <button
                type="button"
                onClick={() => borrar.mutate({ tareaId: tarea.id, id: s.id })}
                className="rounded p-1 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:text-gray-600 dark:hover:bg-red-500/10"
                aria-label={`Eliminar "${s.titulo}"`}
                title="Eliminar paso"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Añadir un paso */}
      <form onSubmit={handleAgregar} className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={nuevoTitulo}
          onChange={(e) => setNuevoTitulo(e.target.value)}
          placeholder="Añadir un paso..."
          maxLength={200}
          className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={!nuevoTitulo.trim() || crear.isPending}
          className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Añadir
        </button>
      </form>
    </div>
  );
}
