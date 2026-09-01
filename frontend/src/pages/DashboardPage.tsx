// ============================================================
// PAGINA: DASHBOARD
// ============================================================
// Pantalla principal que veo al entrar a Academix. La pienso para
// el estudiante: lo primero que necesito saber al abrir la app es
// "que se me viene encima" y "como voy en cada materia".
//
// Yo no toco el backend: todo lo calculo aqui con lo que ya traen
// mis hooks useTareasList() y useMateriasList().
//
// Secciones, en orden de importancia:
//   1. Saludo segun la hora.
//   2. Alerta de tareas vencidas (solo si hay).
//   3. Tarjetas de resumen (materias / pendientes / completadas / vencidas).
//   4. Urgentes: tareas activas que vencen dentro de 72h, agrupadas por nivel.
//   5. Progreso por materia: barra de completadas / total.
//   6. Acciones rapidas.
// ============================================================

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { PrioridadBadge } from '../components/tareas/PrioridadBadge';
import { useMateriasList } from '../hooks/useMaterias';
import { useTareasList } from '../hooks/useTareas';
import { formatearFechaEntrega } from '../utils/fechas';
import type { Tarea, Prioridad } from '../types';

// ============================================================
// UMBRALES DE URGENCIA
// ============================================================
// Yo uso los mismos umbrales en horas que definí para los
// recordatorios por correo del backend (72h / 24h / 6h). Así el
// criterio de "esto es urgente" es el mismo en toda la app.
const UMBRAL_CRITICO_HORAS = 6;
const UMBRAL_URGENTE_HORAS = 24;
const UMBRAL_PROXIMO_HORAS = 72;

type NivelUrgencia = 'critico' | 'urgente' | 'proximo';

// Yo calculo cuántas horas faltan para que venza una tarea.
// Negativo = ya venció.
function horasHastaVencer(fechaEntrega: string): number {
  const ahora = Date.now();
  const vence = new Date(fechaEntrega).getTime();
  return (vence - ahora) / (1000 * 60 * 60);
}

// Yo clasifico la urgencia. Devuelvo null si aún falta más de 72h:
// esas no las muestro en la sección de urgentes.
function nivelUrgencia(horas: number): NivelUrgencia | null {
  if (horas <= UMBRAL_CRITICO_HORAS) return 'critico'; // incluye vencidas (horas < 0)
  if (horas <= UMBRAL_URGENTE_HORAS) return 'urgente';
  if (horas <= UMBRAL_PROXIMO_HORAS) return 'proximo';
  return null;
}

// Yo centralizo los estilos de cada nivel para no repetir clases de
// Tailwind por todo el JSX.
const ESTILOS_URGENCIA: Record<NivelUrgencia, string> = {
  critico: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-500/10',
  urgente: 'border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-500/10',
  proximo: 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10',
};

const ETIQUETA_URGENCIA: Record<NivelUrgencia, string> = {
  critico: 'Vence ya / vencida',
  urgente: 'Vence en menos de 24h',
  proximo: 'Vence en menos de 3 días',
};

export function DashboardPage() {
  const { usuario } = useAuth();

  // Filtro rápido de la lista de urgentes (solo en cliente, no toca
  // el backend). null = sin filtro.
  const [materiaFiltro, setMateriaFiltro] = useState<number | null>(null);
  const [prioridadFiltro, setPrioridadFiltro] = useState<Prioridad | null>(null);

  // Pido los datos al backend. React Query los tiene cacheados, así que
  // si vengo de otra página (por ejemplo tras crear una tarea) aparecen
  // al instante. Con "= []" me evito comprobar undefined en cada uso.
  const { data: materias = [], isLoading: cargandoMaterias } = useMateriasList();
  const { data: tareas = [], isLoading: cargandoTareas } = useTareasList();

  // ============================================================
  // TAREAS ACTIVAS (no completadas)
  // ============================================================
  // Solo estas me interesan para "urgentes" y para el conteo de pendientes.
  const tareasActivas = useMemo(
    () => tareas.filter((t) => t.estado !== 'COMPLETADA'),
    [tareas]
  );

  // ============================================================
  // ESTADISTICAS DE RESUMEN
  // ============================================================
  const stats = useMemo(() => {
    const ahora = Date.now();
    return {
      totalMaterias: materias.length,
      pendientes: tareasActivas.length,
      completadas: tareas.filter((t) => t.estado === 'COMPLETADA').length,
      // Vencidas: activas con fecha ya pasada.
      vencidas: tareasActivas.filter(
        (t) => new Date(t.fechaEntrega).getTime() < ahora
      ).length,
    };
  }, [materias, tareas, tareasActivas]);

  // ============================================================
  // URGENTES
  // ============================================================
  // Tomo las activas, les calculo el nivel, descarto las que aún están
  // lejos (nivel null) y las ordeno de la más urgente a la menos.
  // Limito a 8 para no saturar el dashboard.
  const urgentesTodas = useMemo(() => {
    return tareasActivas
      .map((t) => {
        const horas = horasHastaVencer(t.fechaEntrega);
        return { tarea: t, horas, nivel: nivelUrgencia(horas) };
      })
      .filter(
        (item): item is { tarea: Tarea; horas: number; nivel: NivelUrgencia } =>
          item.nivel !== null
      )
      .sort((a, b) => a.horas - b.horas);
  }, [tareasActivas]);

  // Aplico el filtro rápido y recorto a 8 para no saturar.
  const urgentes = useMemo(() => {
    return urgentesTodas
      .filter(({ tarea }) => {
        if (materiaFiltro !== null && tarea.materiaId !== materiaFiltro)
          return false;
        if (prioridadFiltro !== null && tarea.prioridad !== prioridadFiltro)
          return false;
        return true;
      })
      .slice(0, 8);
  }, [urgentesTodas, materiaFiltro, prioridadFiltro]);

  // Solo muestro los chips de materia que de verdad tienen alguna tarea
  // urgente (no tiene sentido filtrar por una materia que no aparece).
  const materiasConUrgentes = useMemo(() => {
    const ids = new Set(urgentesTodas.map(({ tarea }) => tarea.materiaId));
    return materias.filter((m) => ids.has(m.id));
  }, [urgentesTodas, materias]);

  const hayFiltro = materiaFiltro !== null || prioridadFiltro !== null;
  const PRIORIDADES: Prioridad[] = ['ALTA', 'MEDIA', 'BAJA'];

  // ============================================================
  // PROGRESO POR MATERIA
  // ============================================================
  // Cruzo cada materia con sus tareas (por materiaId) y saco el
  // porcentaje de completadas. Lo hago en cliente porque el backend
  // no devuelve este dato.
  const progresoPorMateria = useMemo(() => {
    return materias.map((materia) => {
      const suyas = tareas.filter((t) => t.materiaId === materia.id);
      const total = suyas.length;
      const completadas = suyas.filter((t) => t.estado === 'COMPLETADA').length;
      const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);
      return { materia, total, completadas, porcentaje };
    });
  }, [materias, tareas]);

  // ============================================================
  // SALUDO SEGUN LA HORA
  // ============================================================
  const hora = new Date().getHours();
  let saludo = 'Buenas noches';
  if (hora >= 5 && hora < 12) saludo = 'Buenos días';
  else if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';

  const primerNombre = usuario?.nombre?.split(' ')[0] ?? 'estudiante';

  // Loading simple, consistente con el resto de mis páginas.
  if (cargandoTareas || cargandoMaterias) {
    return (
      <AppLayout>
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          Cargando dashboard...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* 1. Saludo */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          {saludo}, {primerNombre} 👋
        </h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Aquí tienes un resumen de tu actividad académica.
        </p>
      </div>

      {/* 2. Alerta de vencidas (solo si hay) */}
      {stats.vencidas > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5 shrink-0 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Tienes {stats.vencidas}{' '}
                {stats.vencidas === 1 ? 'tarea vencida' : 'tareas vencidas'}
              </p>
              <p className="mt-0.5 text-sm text-red-700 dark:text-red-300">
                Revisa tus tareas y actualiza su estado.{' '}
                <Link
                  to="/tareas"
                  className="font-medium underline hover:no-underline"
                >
                  Ver tareas
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tarjetas de resumen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Materias"
          value={stats.totalMaterias}
          variant="info"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          }
        />
        <StatCard
          label="Pendientes"
          value={stats.pendientes}
          variant="warning"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
        <StatCard
          label="Completadas"
          value={stats.completadas}
          variant="success"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
        <StatCard
          label="Vencidas"
          value={stats.vencidas}
          variant={stats.vencidas > 0 ? 'warning' : 'default'}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          }
        />
      </div>

      {/* 4. Urgentes + 6. Acciones rapidas */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Urgentes</h3>
              <Link
                to="/tareas"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                Ver todas
              </Link>
            </div>

            {/* Filtro rápido: solo aparece si hay varias urgentes que
                merezca la pena filtrar. */}
            {urgentesTodas.length > 2 && (
              <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 px-5 py-2.5 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setMateriaFiltro(null);
                    setPrioridadFiltro(null);
                  }}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    !hayFiltro
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Todas
                </button>

                {/* Chips por materia */}
                {materiasConUrgentes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setMateriaFiltro((actual) =>
                        actual === m.id ? null : m.id
                      )
                    }
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      materiaFiltro === m.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: m.color ?? '#9CA3AF' }}
                      aria-hidden="true"
                    />
                    {m.nombre}
                  </button>
                ))}

                {/* Separador visual */}
                <span className="mx-0.5 h-4 w-px bg-gray-200 dark:bg-gray-700" />

                {/* Chips por prioridad */}
                {PRIORIDADES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setPrioridadFiltro((actual) => (actual === p ? null : p))
                    }
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      prioridadFiltro === p
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p === 'ALTA' ? 'Alta' : p === 'MEDIA' ? 'Media' : 'Baja'}
                  </button>
                ))}
              </div>
            )}

            {urgentes.length === 0 ? (
              <div className="px-5 py-8 text-center">
                {hayFiltro ? (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Nada urgente con este filtro
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMateriaFiltro(null);
                        setPrioridadFiltro(null);
                      }}
                      className="mt-1 text-sm font-medium text-brand-600 hover:underline"
                    >
                      Quitar filtro
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-2 text-4xl">🎉</div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Todo al día
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      No tienes tareas urgentes por ahora.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {urgentes.map(({ tarea, nivel }) => {
                  const fechaInfo = formatearFechaEntrega(tarea.fechaEntrega);
                  const colorMateria = tarea.materia?.color ?? '#9CA3AF';

                  return (
                    <li
                      key={tarea.id}
                      className={`flex items-center gap-3 px-4 py-3 ${ESTILOS_URGENCIA[nivel]}`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: colorMateria }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {tarea.titulo}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {tarea.materia?.nombre ?? 'Sin materia'} ·{' '}
                          {ETIQUETA_URGENCIA[nivel]}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          className={`text-xs font-medium ${
                            fechaInfo.estaVencida
                              ? 'text-red-600'
                              : fechaInfo.esUrgente
                              ? 'text-amber-700'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {fechaInfo.texto}
                        </span>
                        <PrioridadBadge prioridad={tarea.prioridad} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* 6. Acciones rapidas */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Acciones rápidas
            </h3>
          </div>
          <div className="space-y-2 p-4">
            <Link
              to="/materias"
              className="flex items-center gap-3 rounded-md border border-gray-200 dark:border-gray-800 p-3 transition hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
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
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nueva materia</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Crea una nueva asignatura</p>
              </div>
            </Link>

            <Link
              to="/tareas"
              className="flex items-center gap-3 rounded-md border border-gray-200 dark:border-gray-800 p-3 transition hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
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
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nueva tarea</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Registra una nueva actividad</p>
              </div>
            </Link>

            <Link
              to="/perfil"
              className="flex items-center gap-3 rounded-md border border-gray-200 dark:border-gray-800 p-3 transition hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
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
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Mi perfil</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Edita tu información</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Progreso por materia */}
      <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Progreso por materia
          </h3>
        </div>

        {progresoPorMateria.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Aún no tienes materias creadas
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              <Link
                to="/materias"
                className="font-medium text-brand-600 underline hover:no-underline"
              >
                Crea tu primera materia
              </Link>{' '}
              para empezar a organizarte.
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            {progresoPorMateria.map(({ materia, total, completadas, porcentaje }) => (
              <div key={materia.id}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: materia.color ?? '#9CA3AF' }}
                      aria-hidden="true"
                    />
                    {materia.nombre}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {total === 0
                      ? 'Sin tareas'
                      : `${completadas}/${total} · ${porcentaje}%`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${porcentaje}%`,
                      backgroundColor: materia.color ?? '#4f46e5',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
