// ============================================================
// PAGINA: PAPELERA
// ============================================================
// Aquí llega todo lo que el estudiante "elimina" en Materias o
// Tareas. Desde acá puede:
//   - Restaurar (vuelve a su sitio).
//   - Eliminar definitivamente (irreversible).
//   - Vaciar toda la papelera de una vez.
//
// Lo que lleve más de 30 días en la papelera se borra solo (cron
// del backend).
// ============================================================

import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatearFechaEntrega } from '../utils/fechas';
import {
  usePapeleraList,
  useRestaurarMateria,
  useEliminarMateriaDef,
  useRestaurarTarea,
  useEliminarTareaDef,
  useVaciarPapelera,
} from '../hooks/usePapelera';

// Qué borrado definitivo estamos confirmando.
type Confirmando =
  | { tipo: 'materia'; id: number; nombre: string }
  | { tipo: 'tarea'; id: number; nombre: string }
  | { tipo: 'vaciar' }
  | null;

export function PapeleraPage() {
  const { data, isLoading } = usePapeleraList();
  const restaurarMateria = useRestaurarMateria();
  const eliminarMateria = useEliminarMateriaDef();
  const restaurarTarea = useRestaurarTarea();
  const eliminarTarea = useEliminarTareaDef();
  const vaciar = useVaciarPapelera();

  const [confirmando, setConfirmando] = useState<Confirmando>(null);

  const materias = data?.materias ?? [];
  const tareas = data?.tareas ?? [];
  const vacia = materias.length === 0 && tareas.length === 0;

  function fechaPapelera(iso?: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  }

  function handleConfirm() {
    if (!confirmando) return;
    if (confirmando.tipo === 'materia') {
      eliminarMateria.mutate(confirmando.id, {
        onSuccess: () => setConfirmando(null),
      });
    } else if (confirmando.tipo === 'tarea') {
      eliminarTarea.mutate(confirmando.id, {
        onSuccess: () => setConfirmando(null),
      });
    } else {
      vaciar.mutate(undefined, { onSuccess: () => setConfirmando(null) });
    }
  }

  const confirmLoading =
    eliminarMateria.isPending || eliminarTarea.isPending || vaciar.isPending;

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Papelera
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Lo eliminado se guarda aquí 30 días antes de borrarse solo.
          </p>
        </div>
        {!vacia && (
          <Button
            variant="danger"
            onClick={() => setConfirmando({ tipo: 'vaciar' })}
          >
            Vaciar papelera
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          Cargando...
        </div>
      ) : vacia ? (
        <EmptyState
          title="La papelera está vacía"
          description="Cuando elimines una materia o una tarea, aparecerá aquí por si te arrepientes."
        />
      ) : (
        <div className="space-y-8">
          {/* Materias */}
          {materias.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Materias ({materias.length})
              </h3>
              <ul className="space-y-2">
                {materias.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: m.color ?? '#9CA3AF' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {m.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {m._count?.tareas ?? 0} tarea
                        {(m._count?.tareas ?? 0) === 1 ? '' : 's'} · eliminada el{' '}
                        {fechaPapelera(m.deletedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => restaurarMateria.mutate(m.id)}
                        disabled={restaurarMateria.isPending}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Restaurar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmando({
                            tipo: 'materia',
                            id: m.id,
                            nombre: m.nombre,
                          })
                        }
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        Borrar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tareas */}
          {tareas.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tareas ({tareas.length})
              </h3>
              <ul className="space-y-2">
                {tareas.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: t.materia?.color ?? '#9CA3AF' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t.titulo}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.materia?.nombre ?? 'Sin materia'} ·{' '}
                        {formatearFechaEntrega(t.fechaEntrega).texto} · eliminada
                        el {fechaPapelera(t.deletedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => restaurarTarea.mutate(t.id)}
                        disabled={restaurarTarea.isPending}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Restaurar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmando({
                            tipo: 'tarea',
                            id: t.id,
                            nombre: t.titulo,
                          })
                        }
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        Borrar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmando !== null}
        onClose={() => setConfirmando(null)}
        onConfirm={handleConfirm}
        title={
          confirmando?.tipo === 'vaciar'
            ? 'Vaciar la papelera'
            : 'Eliminar definitivamente'
        }
        message={
          confirmando?.tipo === 'vaciar'
            ? 'Se borrará para siempre todo lo que hay en la papelera. Esta acción no se puede deshacer.'
            : confirmando
            ? `"${confirmando.nombre}" se borrará para siempre. Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Sí, borrar para siempre"
        variant="danger"
        isLoading={confirmLoading}
      />
    </AppLayout>
  );
}
