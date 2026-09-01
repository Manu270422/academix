// ============================================================
// PAGINA: MATERIAS (CRUD COMPLETO)
// ============================================================
// Pagina donde el usuario gestiona sus materias.
// Cumple con las HU03, HU04, HU05.
//
// Funcionalidades:
//   - Lista todas las materias en grid responsive.
//   - Boton "Nueva materia" abre modal con formulario.
//   - Click en editar abre el mismo modal precargado.
//   - Click en eliminar abre dialog de confirmacion.
//   - Estados: loading, error, vacío, lleno.
// ============================================================

import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { MateriaCard } from '../components/materias/MateriaCard';
import { MateriaForm } from '../components/materias/MateriaForm';
import {
  useMateriasList,
  useCreateMateria,
  useUpdateMateria,
  useDeleteMateria,
} from '../hooks/useMaterias';
import type { Materia } from '../types';
import type {
  CreateMateriaPayload,
  UpdateMateriaPayload,
} from '../api/subjects.service';

export function MateriasPage() {
  // Estado para controlar que modal/dialog esta abierto y con que datos.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [materiaEditando, setMateriaEditando] = useState<Materia | null>(null);
  const [materiaEliminando, setMateriaEliminando] = useState<Materia | null>(
    null
  );

  // Hooks de React Query.
  const { data: materias, isLoading, isError } = useMateriasList();
  const createMutation = useCreateMateria();
  const updateMutation = useUpdateMateria();
  const deleteMutation = useDeleteMateria();

  // ============================================================
  // HANDLERS
  // ============================================================

  function abrirModalCreacion() {
    setMateriaEditando(null);
    setModalAbierto(true);
  }

  function abrirModalEdicion(materia: Materia) {
    setMateriaEditando(materia);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    // Pequena espera antes de limpiar el estado para que la animación
    // de cierre se vea sin que cambie el contenido del modal.
    setTimeout(() => setMateriaEditando(null), 200);
  }

  async function handleSubmit(
    data: CreateMateriaPayload | UpdateMateriaPayload
  ) {
    if (materiaEditando) {
      // Modo edición
      await updateMutation.mutateAsync({
        id: materiaEditando.id,
        data: data as UpdateMateriaPayload,
      });
    } else {
      // Modo creación
      await createMutation.mutateAsync(data as CreateMateriaPayload);
    }
    cerrarModal();
  }

  async function handleConfirmDelete() {
    if (!materiaEliminando) return;

    try {
      await deleteMutation.mutateAsync(materiaEliminando.id);
      setMateriaEliminando(null);
    } catch {
      // El error queda en deleteMutation.error y lo puedo mostrar si quiero.
      // Por ahora dejo que React Query lo maneje silenciosamente.
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AppLayout>
      {/* Cabecera de la pagina con titulo y boton de accion */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Mis materias
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gestiona tus asignaturas académicas.
          </p>
        </div>
        <Button onClick={abrirModalCreacion}>
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
          Nueva materia
        </Button>
      </div>

      {/* ESTADOS DE LA UI */}

      {/* Estado de carga: skeleton mientras llegan los datos */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            />
          ))}
        </div>
      )}

      {/* Estado de error */}
      {isError && (
        <Alert variant="error" title="Error al cargar las materias">
          No pudimos obtener tus materias. Recarga la página o intenta más tarde.
        </Alert>
      )}

      {/* Estado vacío: ninguna materia creada todavía */}
      {!isLoading && !isError && materias && materias.length === 0 && (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-16 w-16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          }
          title="Aun no tienes materias"
          description="Crea tu primera materia para empezar a organizar tus tareas y fechas de entrega."
          action={
            <Button onClick={abrirModalCreacion} size="lg">
              Crear mi primera materia
            </Button>
          }
        />
      )}

      {/* Estado normal: grid con tarjetas de materias */}
      {!isLoading && !isError && materias && materias.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materias.map((materia) => (
            <MateriaCard
              key={materia.id}
              materia={materia}
              onEdit={abrirModalEdicion}
              onDelete={(m) => setMateriaEliminando(m)}
            />
          ))}
        </div>
      )}

      {/* MODAL: crear o editar materia */}
      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={materiaEditando ? 'Editar materia' : 'Nueva materia'}
        closeOnOverlayClick={false}
      >
        <MateriaForm
          materiaInicial={materiaEditando ?? undefined}
          onSubmit={handleSubmit}
          onCancel={cerrarModal}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* DIALOG: confirmar eliminación */}
      <ConfirmDialog
        isOpen={Boolean(materiaEliminando)}
        onClose={() => setMateriaEliminando(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar materia"
        message={
          materiaEliminando
            ? `"${materiaEliminando.nombre}" y sus tareas se moverán a la papelera. Podrás restaurarlas desde ahí durante 30 días.`
            : ''
        }
        confirmText="Mover a la papelera"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}