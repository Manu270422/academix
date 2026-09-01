// ============================================================
// COMPONENTE: NOTASMATERIA
// ============================================================
// Los apuntes sueltos de una materia. El estudiante escribe cosas
// como "el parcial es acumulativo" o "clase del 3 sep: repasar
// límites". Cada apunte se puede editar y borrar.
//
// Va dentro de la página de detalle de materia (/materias/:id).
// ============================================================

import { useState, type FormEvent } from 'react';
import type { Materia } from '../../types';
import {
  useCreateNota,
  useUpdateNota,
  useDeleteNota,
} from '../../hooks/useNotas';

interface NotasMateriaProps {
  materia: Materia;
}

// Fecha corta y legible: "3 sep, 14:20" (y el año si no es el actual).
function fechaCorta(iso: string): string {
  const d = new Date(iso);
  const opciones: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };
  if (d.getFullYear() !== new Date().getFullYear()) opciones.year = 'numeric';
  return d.toLocaleDateString('es-CO', opciones);
}

export function NotasMateria({ materia }: NotasMateriaProps) {
  const notas = materia.notas ?? [];

  const [nuevo, setNuevo] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');

  const crear = useCreateNota();
  const actualizar = useUpdateNota();
  const borrar = useDeleteNota();

  function handleCrear(e: FormEvent) {
    e.preventDefault();
    const contenido = nuevo.trim();
    if (!contenido) return;
    crear.mutate(
      { materiaId: materia.id, contenido },
      { onSuccess: () => setNuevo('') }
    );
  }

  function empezarEdicion(id: number, contenido: string) {
    setEditandoId(id);
    setTextoEdicion(contenido);
  }

  function guardarEdicion(id: number) {
    const contenido = textoEdicion.trim();
    if (!contenido) return;
    actualizar.mutate(
      { materiaId: materia.id, id, contenido },
      { onSuccess: () => setEditandoId(null) }
    );
  }

  const textareaClases =
    'w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Apuntes
        </h3>
      </div>

      <div className="space-y-4 p-5">
        {/* Nuevo apunte */}
        <form onSubmit={handleCrear} className="space-y-2">
          <textarea
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder="Escribe un apunte de esta materia..."
            rows={3}
            maxLength={5000}
            className={textareaClases}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!nuevo.trim() || crear.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar apunte
            </button>
          </div>
        </form>

        {/* Lista de apuntes */}
        {notas.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Todavía no tienes apuntes en esta materia.
          </p>
        ) : (
          <ul className="space-y-3">
            {notas.map((nota) => (
              <li
                key={nota.id}
                className="group rounded-md border border-gray-200 p-3 dark:border-gray-800"
              >
                {editandoId === nota.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={textoEdicion}
                      onChange={(e) => setTextoEdicion(e.target.value)}
                      rows={3}
                      maxLength={5000}
                      className={textareaClases}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditandoId(null)}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => guardarEdicion(nota.id)}
                        disabled={!textoEdicion.trim() || actualizar.isPending}
                        className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                      {nota.contenido}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {fechaCorta(nota.createdAt)}
                        {nota.updatedAt !== nota.createdAt && ' · editado'}
                      </span>
                      <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() =>
                            empezarEdicion(nota.id, nota.contenido)
                          }
                          className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800"
                          aria-label="Editar apunte"
                          title="Editar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            borrar.mutate({ materiaId: materia.id, id: nota.id })
                          }
                          className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                          aria-label="Eliminar apunte"
                          title="Eliminar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
