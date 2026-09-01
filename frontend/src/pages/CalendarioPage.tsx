// ============================================================
// PAGINA: CALENDARIO SEMANAL
// ============================================================
// Yo muestro las tareas repartidas en una semana (lunes a domingo).
// Es la vista que un estudiante mira para planear: "¿qué tengo el
// miércoles?, ¿qué se acumula el viernes?".
//
// Yo no toco el backend: pido todas las tareas con useTareasList() y
// las agrupo por día aquí en el cliente.
//
// Interacciones:
//   - Navegar entre semanas (‹ Hoy ›).
//   - Click en una tarea -> abre el modal de edición.
//   - Botón "+" de un día -> abre el modal de creación con la fecha
//     de ese día ya puesta (a las 09:00).
// ============================================================

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { TareaForm } from '../components/tareas/TareaForm';
import { BotonExportarIcs } from '../components/tareas/BotonExportarIcs';
import { useMateriasList } from '../hooks/useMaterias';
import {
  useTareasList,
  useCreateTarea,
  useUpdateTarea,
} from '../hooks/useTareas';
import {
  inicioDeSemana,
  diasDeLaSemana,
  mismoDia,
  soloHora,
  rangoSemana,
  isoADateTimeLocal,
} from '../utils/fechas';
import type { Tarea } from '../types';
import type {
  CreateTareaPayload,
  UpdateTareaPayload,
} from '../api/tasks.service';

// Yo uso los nombres cortos de los días en español, empezando por lunes.
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarioPage() {
  // offsetSemanas: 0 = semana actual, -1 = anterior, +1 = siguiente.
  const [offsetSemanas, setOffsetSemanas] = useState(0);

  // Estado de los modales.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);
  // Cuando creo desde un día concreto, guardo su fecha pre-rellenada.
  const [fechaNueva, setFechaNueva] = useState<string | undefined>(undefined);

  const { data: materias = [] } = useMateriasList();
  const { data: tareas = [], isLoading } = useTareasList();
  const createMutation = useCreateTarea();
  const updateMutation = useUpdateTarea();

  // ============================================================
  // DIAS DE LA SEMANA VISIBLE
  // ============================================================
  const inicio = useMemo(
    () => inicioDeSemana(new Date(), offsetSemanas),
    [offsetSemanas]
  );
  const dias = useMemo(() => diasDeLaSemana(inicio), [inicio]);

  // ============================================================
  // TAREAS AGRUPADAS POR DIA
  // ============================================================
  // Para cada día de la semana, saco sus tareas ordenadas por hora.
  const tareasPorDia = useMemo(() => {
    return dias.map((dia) => {
      const delDia = tareas
        .filter((t) => mismoDia(new Date(t.fechaEntrega), dia))
        .sort(
          (a, b) =>
            new Date(a.fechaEntrega).getTime() -
            new Date(b.fechaEntrega).getTime()
        );
      return { dia, tareas: delDia };
    });
  }, [dias, tareas]);

  const totalEnSemana = tareasPorDia.reduce((acc, d) => acc + d.tareas.length, 0);

  // ============================================================
  // HANDLERS
  // ============================================================

  function abrirEdicion(tarea: Tarea) {
    setTareaEditando(tarea);
    setFechaNueva(undefined);
    setModalAbierto(true);
  }

  function abrirCreacion(dia: Date) {
    // Pongo la nueva tarea ese día a las 09:00.
    const fecha = new Date(dia);
    fecha.setHours(9, 0, 0, 0);
    setTareaEditando(null);
    setFechaNueva(isoADateTimeLocal(fecha.toISOString()));
    setModalAbierto(true);
  }

  // ============================================================
  // DRAG & DROP: arrastrar una tarea a otro día
  // ============================================================
  // Guardo el id de la tarea que se está arrastrando y el día sobre
  // el que está el cursor (para resaltarlo).
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [diaObjetivo, setDiaObjetivo] = useState<string | null>(null);

  // Al soltar: cambio SOLO la fecha (año/mes/día) y conservo la hora
  // original de la tarea.
  function moverTareaADia(tareaId: number, dia: Date) {
    const tarea = tareas.find((t) => t.id === tareaId);
    if (!tarea) return;

    const original = new Date(tarea.fechaEntrega);
    if (mismoDia(original, dia)) return; // no se movió de día

    const nueva = new Date(dia);
    nueva.setHours(
      original.getHours(),
      original.getMinutes(),
      original.getSeconds(),
      0
    );

    updateMutation.mutate({
      id: tareaId,
      data: { fechaEntrega: nueva.toISOString() },
    });
  }

  function cerrarModal() {
    setModalAbierto(false);
    setTimeout(() => {
      setTareaEditando(null);
      setFechaNueva(undefined);
    }, 200);
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

  const hoy = new Date();

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AppLayout>
      {/* Cabecera con navegación de semanas */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Calendario
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {rangoSemana(inicio)}
            {offsetSemanas === 0 && ' · esta semana'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Exporta las tareas de la semana visible al calendario del móvil. */}
          <BotonExportarIcs
            tareas={tareasPorDia.flatMap((d) => d.tareas)}
            nombreArchivo="academix-semana.ics"
          />

          <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOffsetSemanas((o) => o - 1)}
            className="rounded-md border border-gray-200 dark:border-gray-800 p-2 text-gray-600 dark:text-gray-400 transition hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label="Semana anterior"
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
          </button>
          <button
            type="button"
            onClick={() => setOffsetSemanas(0)}
            disabled={offsetSemanas === 0}
            className="rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setOffsetSemanas((o) => o + 1)}
            className="rounded-md border border-gray-200 dark:border-gray-800 p-2 text-gray-600 dark:text-gray-400 transition hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label="Semana siguiente"
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
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
          </div>
        </div>
      </div>

      {/* Caso: usuario sin materias (no puede crear tareas) */}
      {materias.length === 0 ? (
        <EmptyState
          title="Primero crea una materia"
          description="Las tareas necesitan una materia. Crea tu primera materia para empezar a planear tu semana."
          action={
            <Link to="/materias">
              <Button size="lg">Ir a Materias</Button>
            </Link>
          }
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            />
          ))}
        </div>
      ) : (
        <>
          {totalEnSemana === 0 && (
            <p className="mb-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              No tienes tareas esta semana. Usa el botón{' '}
              <span className="font-medium">+</span> de cualquier día para
              agendar una.
            </p>
          )}

          {totalEnSemana > 0 && (
            <p className="mb-3 hidden text-xs text-gray-500 sm:block dark:text-gray-400">
              Consejo: arrastra una tarea a otro día para cambiarle la fecha
              (se conserva la hora).
              {updateMutation.isPending && (
                <span className="ml-2 font-medium text-brand-600 dark:text-brand-400">
                  Moviendo…
                </span>
              )}
            </p>
          )}

          {/* Rejilla de la semana.
              Móvil: 1 columna. Tablet: 2. Desktop: 7 (una por día). */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {tareasPorDia.map(({ dia, tareas: tareasDia }) => {
              const esHoy = mismoDia(dia, hoy);

              const esObjetivo =
                arrastrando !== null && diaObjetivo === dia.toISOString();

              return (
                <div
                  key={dia.toISOString()}
                  onDragOver={(e) => {
                    // preventDefault es lo que permite el "drop".
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDiaObjetivo(dia.toISOString());
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = Number(e.dataTransfer.getData('text/plain'));
                    if (id) moverTareaADia(id, dia);
                    setArrastrando(null);
                    setDiaObjetivo(null);
                  }}
                  className={`flex flex-col rounded-lg border bg-white transition dark:bg-gray-900 ${
                    esObjetivo
                      ? 'border-brand-500 ring-2 ring-brand-300 dark:ring-brand-500/40'
                      : esHoy
                      ? 'border-brand-400 ring-1 ring-brand-200'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {/* Cabecera del día */}
                  <div
                    className={`flex items-center justify-between border-b px-3 py-2 ${
                      esHoy ? 'border-brand-200' : 'border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        esHoy ? 'text-brand-700' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {DIAS_CORTOS[(dia.getDay() + 6) % 7]} {dia.getDate()}
                    </span>
                    <button
                      type="button"
                      onClick={() => abrirCreacion(dia)}
                      className="rounded p-1 text-gray-400 dark:text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-600"
                      aria-label={`Nueva tarea el ${dia.getDate()}`}
                      title="Nueva tarea este día"
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
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Tareas del día */}
                  <div className="flex flex-1 flex-col gap-1.5 p-2">
                    {tareasDia.length === 0 ? (
                      <p className="px-1 py-2 text-xs text-gray-300 dark:text-gray-600">Sin tareas</p>
                    ) : (
                      tareasDia.map((tarea) => {
                        const completada = tarea.estado === 'COMPLETADA';
                        const color = tarea.materia?.color ?? '#9CA3AF';

                        return (
                          <button
                            key={tarea.id}
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              setArrastrando(tarea.id);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData(
                                'text/plain',
                                String(tarea.id)
                              );
                            }}
                            onDragEnd={() => {
                              setArrastrando(null);
                              setDiaObjetivo(null);
                            }}
                            onClick={() => abrirEdicion(tarea)}
                            style={{ borderLeftColor: color }}
                            className={`w-full cursor-grab rounded border-l-4 bg-gray-50 px-2 py-1.5 text-left transition hover:bg-gray-100 active:cursor-grabbing dark:bg-gray-800 dark:hover:bg-gray-700 ${
                              completada ? 'opacity-60' : ''
                            } ${arrastrando === tarea.id ? 'opacity-40' : ''}`}
                          >
                            <p
                              className={`truncate text-xs font-medium ${
                                completada
                                  ? 'text-gray-500 dark:text-gray-400 line-through'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {tarea.titulo}
                            </p>
                            <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                              {soloHora(tarea.fechaEntrega)}
                              {tarea.materia?.nombre
                                ? ` · ${tarea.materia.nombre}`
                                : ''}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
          fechaPreseleccionada={fechaNueva}
          onSubmit={handleSubmit}
          onCancel={cerrarModal}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </AppLayout>
  );
}
