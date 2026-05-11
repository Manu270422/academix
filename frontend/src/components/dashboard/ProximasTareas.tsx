// ============================================================
// COMPONENTE: PROXIMASTAREAS
// ============================================================
// Lista las 5 tareas mas urgentes (no completadas, ordenadas por fecha).
// Es la seccion mas util del dashboard: lo primero que el estudiante quiere
// saber al abrir Academix es "que se me viene encima".
// ============================================================

import { Link } from 'react-router-dom';
import type { Tarea } from '../../types';
import { formatearFechaEntrega } from '../../utils/fechas';
import { PrioridadBadge } from '../tareas/PrioridadBadge';

interface ProximasTareasProps {
  tareas: Tarea[];
}

export function ProximasTareas({ tareas }: ProximasTareasProps) {
  // Filtro las no completadas y las ordeno por fecha de entrega ascendente.
  // Tomo solo las primeras 5 para no saturar el dashboard.
  const proximas = tareas
    .filter((t) => t.estado !== 'COMPLETADA')
    .sort(
      (a, b) =>
        new Date(a.fechaEntrega).getTime() -
        new Date(b.fechaEntrega).getTime()
    )
    .slice(0, 5);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h3 className="text-base font-semibold text-gray-900">
          Proximas a vencer
        </h3>
        <Link
          to="/tareas"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          Ver todas
        </Link>
      </div>

      {/* Si no hay tareas pendientes, muestro mensaje motivador */}
      {proximas.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <div className="mb-2 text-4xl">🎉</div>
          <p className="text-sm font-medium text-gray-900">
            Todo al día!
          </p>
          <p className="mt-1 text-sm text-gray-600">
            No tienes tareas pendientes por ahora.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {proximas.map((tarea) => {
            const fechaInfo = formatearFechaEntrega(tarea.fechaEntrega);
            const colorMateria = tarea.materia?.color ?? '#9CA3AF';

            return (
              <li
                key={tarea.id}
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-50"
              >
                {/* Punto de color de la materia */}
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorMateria }}
                  aria-hidden="true"
                />

                {/* Contenido principal */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {tarea.titulo}
                  </p>
                  <p className="text-xs text-gray-600">
                    {tarea.materia?.nombre}
                  </p>
                </div>

                {/* Fecha y prioridad */}
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`text-xs font-medium ${
                      fechaInfo.estaVencida
                        ? 'text-red-600'
                        : fechaInfo.esUrgente
                        ? 'text-amber-700'
                        : 'text-gray-600'
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
  );
}