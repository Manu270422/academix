// ============================================================
// PAGINA: ESTADISTICAS
// ============================================================
// Yo muestro cómo va el estudiante con sus entregas. Todo lo calculo
// aquí en el cliente a partir de las tareas y materias que ya tengo:
// no hay endpoints nuevos en el backend.
//
// Secciones:
//   1. Resumen: total, completadas y "tasa de cumplimiento" (de las
//      tareas que ya llegaron a su fecha, cuántas entregué a tiempo).
//   2. Racha: días seguidos sin dejar vencer ninguna entrega.
//   3. Cumplimiento por semana (últimas 8 semanas) como barras.
//   4. Ranking de materias por tareas pendientes / vencidas.
// ============================================================

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useMateriasList } from '../hooks/useMaterias';
import { useTareasList } from '../hooks/useTareas';
import { inicioDeSemana } from '../utils/fechas';
import type { Tarea } from '../types';

const MS_DIA = 1000 * 60 * 60 * 24;
const SEMANAS_A_MOSTRAR = 8;

// Una tarea está "vencida sin entregar" si su fecha ya pasó y no está
// completada.
function estaFallada(t: Tarea, ahora: number): boolean {
  return (
    t.estado !== 'COMPLETADA' && new Date(t.fechaEntrega).getTime() < ahora
  );
}

export function EstadisticasPage() {
  const { data: materias = [], isLoading: cargandoMaterias } = useMateriasList();
  const { data: tareas = [], isLoading: cargandoTareas } = useTareasList();

  const cargando = cargandoMaterias || cargandoTareas;

  // ============================================================
  // 1. RESUMEN
  // ============================================================
  const resumen = useMemo(() => {
    const ahora = Date.now();
    const total = tareas.length;
    const completadas = tareas.filter((t) => t.estado === 'COMPLETADA').length;
    const vencidas = tareas.filter((t) => estaFallada(t, ahora)).length;

    // Tareas que ya "cerraron" (llegaron a su fecha): completadas +
    // vencidas sin entregar. Sobre esas mido el cumplimiento.
    const cerradas = completadas + vencidas;
    const cumplimiento =
      cerradas === 0 ? null : Math.round((completadas / cerradas) * 100);

    return { total, completadas, vencidas, cumplimiento };
  }, [tareas]);

  // ============================================================
  // 2. RACHA SIN ENTREGAS VENCIDAS
  // ============================================================
  // Miro la fecha más reciente en la que una tarea venció sin
  // entregar. La racha son los días desde esa fecha hasta hoy.
  const racha = useMemo(() => {
    const ahora = Date.now();
    const falladas = tareas
      .filter((t) => estaFallada(t, ahora))
      .map((t) => new Date(t.fechaEntrega).getTime());

    if (tareas.length === 0) return null;
    if (falladas.length === 0) {
      // Nunca ha dejado vencer nada: cuento desde la primera tarea creada.
      const primera = Math.min(
        ...tareas.map((t) => new Date(t.createdAt).getTime())
      );
      return { dias: Math.floor((ahora - primera) / MS_DIA), perfecta: true };
    }

    const ultimaFalla = Math.max(...falladas);
    return {
      dias: Math.floor((ahora - ultimaFalla) / MS_DIA),
      perfecta: false,
    };
  }, [tareas]);

  // ============================================================
  // 3. CUMPLIMIENTO POR SEMANA (últimas 8, lunes a domingo)
  // ============================================================
  const semanas = useMemo(() => {
    const out: {
      inicio: Date;
      etiqueta: string;
      total: number;
      completadas: number;
      porcentaje: number | null;
    }[] = [];

    for (let i = SEMANAS_A_MOSTRAR - 1; i >= 0; i--) {
      const inicio = inicioDeSemana(new Date(), -i);
      const fin = new Date(inicio.getTime() + 7 * MS_DIA);

      const enSemana = tareas.filter((t) => {
        const f = new Date(t.fechaEntrega).getTime();
        return f >= inicio.getTime() && f < fin.getTime();
      });
      const completadas = enSemana.filter(
        (t) => t.estado === 'COMPLETADA'
      ).length;

      out.push({
        inicio,
        etiqueta: inicio.toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'short',
        }),
        total: enSemana.length,
        completadas,
        porcentaje:
          enSemana.length === 0
            ? null
            : Math.round((completadas / enSemana.length) * 100),
      });
    }
    return out;
  }, [tareas]);

  // ============================================================
  // 4. RANKING DE MATERIAS (por pendientes + vencidas)
  // ============================================================
  const ranking = useMemo(() => {
    const ahora = Date.now();
    return materias
      .map((m) => {
        const suyas = tareas.filter((t) => t.materiaId === m.id);
        const pendientes = suyas.filter(
          (t) => t.estado !== 'COMPLETADA'
        ).length;
        const vencidas = suyas.filter((t) => estaFallada(t, ahora)).length;
        const completadas = suyas.filter(
          (t) => t.estado === 'COMPLETADA'
        ).length;
        return {
          materia: m,
          total: suyas.length,
          pendientes,
          vencidas,
          completadas,
        };
      })
      .filter((r) => r.total > 0)
      .sort(
        (a, b) =>
          b.vencidas - a.vencidas ||
          b.pendientes - a.pendientes ||
          a.completadas - b.completadas
      );
  }, [materias, tareas]);

  // ============================================================
  // RENDER
  // ============================================================
  if (cargando) {
    return (
      <AppLayout>
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          Cargando estadísticas...
        </div>
      </AppLayout>
    );
  }

  if (tareas.length === 0) {
    return (
      <AppLayout>
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          Estadísticas
        </h2>
        <EmptyState
          title="Todavía no hay nada que medir"
          description="Cuando registres tareas y las vayas completando, aquí verás tu progreso semana a semana."
          action={
            <Link to="/tareas">
              <Button size="lg">Ir a Tareas</Button>
            </Link>
          }
        />
      </AppLayout>
    );
  }

  const maxTotalSemana = Math.max(...semanas.map((s) => s.total), 1);

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          Estadísticas
        </h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Cómo vas con tus entregas.
        </p>
      </div>

      {/* 1. Resumen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Tareas totales"
          value={resumen.total}
          icon={<span className="text-lg">Σ</span>}
        />
        <StatCard
          label="Completadas"
          value={resumen.completadas}
          variant="success"
          icon={<span className="text-lg">✓</span>}
        />
        <StatCard
          label="Vencidas"
          value={resumen.vencidas}
          variant={resumen.vencidas > 0 ? 'warning' : 'default'}
          icon={<span className="text-lg">!</span>}
        />
        <StatCard
          label="Cumplimiento"
          value={
            resumen.cumplimiento === null ? '—' : `${resumen.cumplimiento}%`
          }
          variant="info"
          icon={<span className="text-lg">%</span>}
        />
      </div>

      {/* 2. Racha */}
      {racha && (
        <div className="mt-4 flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="text-3xl" aria-hidden="true">
            {racha.dias >= 7 ? '🔥' : racha.dias >= 1 ? '🙂' : '💪'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {racha.dias === 0
                ? 'Hoy venció una entrega sin completar'
                : `${racha.dias} ${
                    racha.dias === 1 ? 'día' : 'días'
                  } sin dejar vencer ninguna entrega`}
            </p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              {racha.perfecta
                ? '¡Racha perfecta desde que empezaste!'
                : 'Sigue así para subir la racha.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Cumplimiento por semana */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          Últimas {SEMANAS_A_MOSTRAR} semanas
        </h3>
        <div className="flex items-end justify-between gap-2">
          {semanas.map((s, i) => {
            const esActual = i === semanas.length - 1;
            // Altura de la barra: proporcional al total de tareas de la
            // semana (para ver también el volumen), con la parte
            // completada en verde.
            const altura = Math.round((s.total / maxTotalSemana) * 100);
            const alturaCompletada =
              s.total === 0
                ? 0
                : Math.round((s.completadas / s.total) * altura);

            return (
              <div
                key={s.inicio.toISOString()}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {s.porcentaje === null ? '·' : `${s.porcentaje}%`}
                </span>
                <div
                  className="relative flex w-full max-w-[2.5rem] items-end overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800"
                  style={{ height: '8rem' }}
                  title={`${s.completadas}/${s.total} completadas`}
                >
                  {/* Total (gris/azul claro) */}
                  <div
                    className="absolute bottom-0 w-full bg-brand-200 dark:bg-brand-500/25"
                    style={{ height: `${altura}%` }}
                  />
                  {/* Completadas (verde) */}
                  <div
                    className="absolute bottom-0 w-full bg-green-500/80"
                    style={{ height: `${alturaCompletada}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] ${
                    esActual
                      ? 'font-semibold text-brand-600 dark:text-brand-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {s.etiqueta}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Barra completa = tareas con fecha esa semana · verde = las que
          completaste.
        </p>
      </div>

      {/* 4. Ranking de materias */}
      {ranking.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Materias que necesitan atención
            </h3>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {ranking.map((r) => (
              <li
                key={r.materia.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: r.materia.color ?? '#9CA3AF' }}
                  aria-hidden="true"
                />
                <Link
                  to={`/materias/${r.materia.id}`}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 hover:text-brand-600 dark:text-gray-100"
                >
                  {r.materia.nombre}
                </Link>
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  {r.vencidas > 0 && (
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {r.vencidas} vencida{r.vencidas === 1 ? '' : 's'}
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400">
                    {r.pendientes} pendiente{r.pendientes === 1 ? '' : 's'}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {r.completadas}/{r.total}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppLayout>
  );
}
