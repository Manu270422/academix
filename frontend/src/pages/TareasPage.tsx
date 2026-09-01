// ============================================================
// PAGINA: TAREAS (CRUD COMPLETO + FILTROS)
// ============================================================
// Cumple con HU06, HU07, HU08.
//
// Funcionalidades:
//   - Lista todas las tareas con filtros opcionales.
//   - Crear, editar, eliminar.
//   - Cambio rápido de estado con un click (HU07).
//   - Estado vacío diferenciado: sin tareas vs sin materias.
// ============================================================

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TareaCard } from '../components/tareas/TareaCard';
import { BotonExportarIcs } from '../components/tareas/BotonExportarIcs';
import { TareaForm } from '../components/tareas/TareaForm';
import { TareaFiltros } from '../components/tareas/TareaFiltros';
import {
  TareaBusquedaOrden,
  type OrdenTareas,
} from '../components/tareas/TareaBusquedaOrden';
import { useMateriasList } from '../hooks/useMaterias';
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
  TareasFilters,
} from '../api/tasks.service';

export function TareasPage() {
  // Estado de filtros (van al backend).
  const [filtros, setFiltros] = useState<TareasFilters>({});

  // Búsqueda y orden: se aplican en el cliente sobre lo que ya trajo
  // el backend, no son parámetros de la API.
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<OrdenTareas>('fecha');

  // Estado de modales.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);
  const [tareaEliminando, setTareaEliminando] = useState<Tarea | null>(null);

  // Hooks de React Query.
  const { data: materias = [] } = useMateriasList();
  const { data: tareas, isLoading, isError } = useTareasList(filtros);
  const createMutation = useCreateTarea();
  const updateMutation = useUpdateTarea();
  const estadoMutation = useUpdateTareaEstado();
  const deleteMutation = useDeleteTarea();

  // ============================================================
  // HANDLERS
  // ============================================================

  function abrirModalCreacion() {
    setTareaEditando(null);
    setModalAbierto(true);
  }

  function abrirModalEdicion(tarea: Tarea) {
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
      // El error queda en el mutation, no hago nada extra.
    }
  }

  /**
   * Cambio rápido de estado al hacer click en el checkbox de la tarjeta.
   * Si esta COMPLETADA -> vuelve a PENDIENTE.
   * Si esta PENDIENTE o EN_PROGRESO -> pasa a COMPLETADA.
   */
  function handleToggleComplete(tarea: Tarea) {
    const nuevoEstado =
      tarea.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA';
    estadoMutation.mutate({ id: tarea.id, estado: nuevoEstado });
  }

  // ============================================================
  // VARIABLES DERIVADAS PARA EL RENDER
  // ============================================================

  const sinMaterias = materias.length === 0;
  const tieneFiltrosActivos = Object.keys(filtros).length > 0;
  const sinTareas = !isLoading && tareas && tareas.length === 0;

  // ============================================================
  // BUSQUEDA + ORDEN (en cliente)
  // ============================================================
  // Normalizo texto: minúsculas y sin tildes, para que "quimica"
  // encuentre "Química".
  function normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, ''); // quita los acentos combinados
  }

  // Peso de cada prioridad para poder ordenar (alta primero).
  const PESO_PRIORIDAD: Record<Tarea['prioridad'], number> = {
    ALTA: 0,
    MEDIA: 1,
    BAJA: 2,
  };

  const tareasVisibles = useMemo(() => {
    if (!tareas) return [];

    const q = normalizar(busqueda.trim());
    const filtradas = q
      ? tareas.filter((t) => {
          const enTitulo = normalizar(t.titulo).includes(q);
          const enDesc = t.descripcion
            ? normalizar(t.descripcion).includes(q)
            : false;
          const enMateria = t.materia
            ? normalizar(t.materia.nombre).includes(q)
            : false;
          return enTitulo || enDesc || enMateria;
        })
      : [...tareas];

    filtradas.sort((a, b) => {
      if (orden === 'prioridad') {
        const dif = PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad];
        if (dif !== 0) return dif;
        // A igual prioridad, la más próxima a vencer primero.
        return (
          new Date(a.fechaEntrega).getTime() -
          new Date(b.fechaEntrega).getTime()
        );
      }
      if (orden === 'recientes') {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      // 'fecha' (por defecto): más próxima a vencer primero.
      return (
        new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime()
      );
    });

    return filtradas;
  }, [tareas, busqueda, orden]);

  // La búsqueda dejó la lista vacía aunque sí hay tareas cargadas.
  const sinResultadosBusqueda =
    !isLoading &&
    tareas &&
    tareas.length > 0 &&
    tareasVisibles.length === 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AppLayout>
      {/* Cabecera */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Mis tareas
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Organiza y haz seguimiento de tus actividades académicas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Exporta la lista tal como está filtrada ahora mismo. */}
          <BotonExportarIcs
            tareas={tareasVisibles}
            nombreArchivo="academix-tareas.ics"
          />
          <Button onClick={abrirModalCreacion} disabled={sinMaterias}>
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
      </div>

      {/* CASO ESPECIAL: usuario sin materias.
          No tiene sentido crear tareas sin materias, asi que le aviso. */}
      {sinMaterias && (
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
          title="Primero crea una materia"
          description="Las tareas necesitan estar asociadas a una materia. Crea tu primera materia para empezar."
          action={
            <Link to="/materias">
              <Button size="lg">Ir a Materias</Button>
            </Link>
          }
        />
      )}

      {/* Si tiene materias, muestro filtros y lista */}
      {!sinMaterias && (
        <>
          {/* Barra de búsqueda + orden */}
          <div className="mb-3">
            <TareaBusquedaOrden
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
              orden={orden}
              onOrdenChange={setOrden}
            />
          </div>

          {/* Barra de filtros */}
          <div className="mb-4">
            <TareaFiltros
              materias={materias}
              filtros={filtros}
              onChange={setFiltros}
            />
          </div>

          {/* Estados de la UI */}

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                />
              ))}
            </div>
          )}

          {isError && (
            <Alert variant="error" title="Error al cargar las tareas">
              No pudimos obtener tus tareas. Recarga la página o intenta más tarde.
            </Alert>
          )}

          {/* Estado vacío: distingo entre "no hay tareas" y "no hay tareas con esos filtros" */}
          {sinTareas && tieneFiltrosActivos && (
            <EmptyState
              title="No hay tareas con esos filtros"
              description="Prueba quitando algun filtro o crea una nueva tarea."
              action={
                <Button variant="secondary" onClick={() => setFiltros({})}>
                  Limpiar filtros
                </Button>
              }
            />
          )}

          {sinTareas && !tieneFiltrosActivos && (
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
                    d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                  />
                </svg>
              }
              title="Aún no tienes tareas"
              description="Crea tu primera tarea para empezar a organizar tus actividades académicas."
              action={
                <Button onClick={abrirModalCreacion} size="lg">
                  Crear mi primera tarea
                </Button>
              }
            />
          )}

          {/* La búsqueda no encontró nada (pero sí hay tareas cargadas) */}
          {sinResultadosBusqueda && (
            <EmptyState
              title="Sin resultados"
              description={`Ninguna tarea coincide con "${busqueda.trim()}".`}
              action={
                <Button variant="secondary" onClick={() => setBusqueda('')}>
                  Limpiar búsqueda
                </Button>
              }
            />
          )}

          {/* Lista de tareas */}
          {!isLoading && tareasVisibles.length > 0 && (
            <div className="space-y-3">
              {tareasVisibles.map((tarea) => (
                <TareaCard
                  key={tarea.id}
                  tarea={tarea}
                  onEdit={abrirModalEdicion}
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
        </>
      )}

      {/* MODAL: crear o editar tarea */}
      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={tareaEditando ? 'Editar tarea' : 'Nueva tarea'}
        closeOnOverlayClick={false}
        size="lg"
      >
        <TareaForm
          tareaInicial={tareaEditando ?? undefined}
          materias={materias}
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
            ? `¿Estás seguro de eliminar "${tareaEliminando.titulo}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Sí, eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}