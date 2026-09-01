// ============================================================
// PAGINA: DETALLE DE MATERIA (/materias/:id)
// ============================================================
// Yo muestro una materia concreta con todo lo suyo en un solo lugar:
//   - Nombre, descripción y color.
//   - Barra de progreso (completadas / total).
//   - Sus tareas, con el CRUD completo (crear, editar, borrar,
//     marcar como completada).
//
// Llego aquí al hacer click en una MateriaCard desde /materias.
// Reutilizo los mismos componentes y hooks que la página de Tareas,
// solo que filtrando por esta materia.
// ============================================================

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TareaCard } from '../components/tareas/TareaCard';
import { TareaForm } from '../components/tareas/TareaForm';
import { NotasMateria } from '../components/materias/NotasMateria';
import { useMateria } from '../hooks/useMaterias';
import {
  useTareasList,
  useCreateTarea,
  useUpdateTarea,
  useUpdateTareaEstado,
  useDeleteTarea,
} from '../hooks/useTareas';
import type { Tarea } from '../types';
import type {
  CreateTareaPayload,
  UpdateTareaPayload,
} from '../api/tasks.service';

export function MateriaDetallePage() {
  // El id viene de la URL como string; lo paso a número.
  const { id } = useParams<{ id: string }>();
  const materiaId = Number(id);

  // Estado de modales.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);
  const [tareaEliminando, setTareaEliminando] = useState<Tarea | null>(null);

  // Datos: la materia y sus tareas (filtradas por materiaId en el backend).
  const {
    data: materia,
    isLoading: cargandoMateria,
    isError: errorMateria,
  } = useMateria(materiaId);
  const { data: tareas = [], isLoading: cargandoTareas } = useTareasList({
    materiaId,
  });

  const createMutation = useCreateTarea();
  const updateMutation = useUpdateTarea();
  const estadoMutation = useUpdateTareaEstado();
  const deleteMutation = useDeleteTarea();

  // ============================================================
  // PROGRESO
  // ============================================================
  const progreso = useMemo(() => {
    const total = tareas.length;
    const completadas = tareas.filter((t) => t.estado === 'COMPLETADA').length;
    const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);
    return { total, completadas, porcentaje };
  }, [tareas]);

  // ============================================================
  // HANDLERS (mismos que en TareasPage)
  // ============================================================

  function abrirCreacion() {
    setTareaEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(tarea: Tarea) {
    setTareaEditando(tarea);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setTimeout(() => setTareaEditando(null), 200);
  }

  async function handleSubmit(
    data: CreateTareaPayload | UpdateTareaPayload
  ) {
    if (tareaEditando) {
      await updateMutation.mutateAsync({
        id: tareaEditando.id,
        data: data as UpdateTareaPayload,
      });
    } else {
      await createMutation.mutateAsync(data as CreateTareaPayload);
    }
    cerrarModal();
  }

  async function handleConfirmDelete() {
    if (!tareaEliminando) return;
    try {
      await deleteMutation.mutateAsync(tareaEliminando.id);
      setTareaEliminando(null);
    } catch {
      // El error queda en el mutation.
    }
  }

  function handleToggleComplete(tarea: Tarea) {
    const nuevoEstado =
      tarea.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA';
    estadoMutation.mutate({ id: tarea.id, estado: nuevoEstado });
  }

  // ============================================================
  // RENDER
  // ============================================================

  // Enlace de vuelta, siempre visible arriba.
  const volver = (
    <Link
      to="/materias"
      className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5 8.25 12l7.5-7.5"
        />
      </svg>
      Volver a materias
    </Link>
  );

  if (errorMateria || (!cargandoMateria && !materia)) {
    return (
      <AppLayout>
        <div className="mb-4">{volver}</div>
        <Alert variant="error" title="No encontramos esta materia">
          Puede que la hayas eliminado o que el enlace sea incorrecto.
        </Alert>
      </AppLayout>
    );
  }

  const color = materia?.color ?? '#9CA3AF';

  return (
    <AppLayout>
      <div className="mb-4">{volver}</div>

      {/* Cabecera de la materia */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
              {cargandoMateria ? 'Cargando...' : materia?.nombre}
            </h2>
          </div>
          {materia?.descripcion && (
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {materia.descripcion}
            </p>
          )}
        </div>

        <Button onClick={abrirCreacion} disabled={cargandoMateria}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Nueva tarea
        </Button>
      </div>

      {/* Barra de progreso */}
      {!cargandoTareas && progreso.total > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              Progreso
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {progreso.completadas}/{progreso.total} · {progreso.porcentaje}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${progreso.porcentaje}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      {cargandoTareas ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            />
          ))}
        </div>
      ) : tareas.length === 0 ? (
        <EmptyState
          title="Esta materia no tiene tareas"
          description="Crea la primera para empezar a hacerle seguimiento."
          action={
            <Button onClick={abrirCreacion} size="lg">
              Crear tarea
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {tareas.map((tarea) => (
            <TareaCard
              key={tarea.id}
              tarea={tarea}
              onEdit={abrirEdicion}
              onDelete={(t) => setTareaEliminando(t)}
              onToggleComplete={handleToggleComplete}
              isUpdating={
                estadoMutation.isPending &&
                estadoMutation.variables?.id === tarea.id
              }
            />
          ))}
        </div>
      )}

      {/* Apuntes de la materia */}
      {materia && (
        <div className="mt-6">
          <NotasMateria materia={materia} />
        </div>
      )}

      {/* MODAL: crear o editar tarea.
          Si es creación, dejo la materia preseleccionada a esta. */}
      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={tareaEditando ? 'Editar tarea' : 'Nueva tarea'}
        closeOnOverlayClick={false}
        size="lg"
      >
        <TareaForm
          tareaInicial={tareaEditando ?? undefined}
          materias={materia ? [materia] : []}
          materiaPreseleccionada={materiaId}
          onSubmit={handleSubmit}
          onCancel={cerrarModal}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* DIALOG: confirmar eliminación */}
      <ConfirmDialog
        isOpen={Boolean(tareaEliminando)}
        onClose={() => setTareaEliminando(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar tarea"
        message={
          tareaEliminando
            ? `"${tareaEliminando.titulo}" se moverá a la papelera. Podrás restaurarla desde ahí durante 30 días.`
            : ''
        }
        confirmText="Mover a la papelera"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
