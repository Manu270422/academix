// ============================================================
// COMPONENTE: TAREACARD
// ============================================================
// Tarjeta visual de una tarea, con todas sus acciones rapidas.
// Características:
//   - Botón de check para marcar como COMPLETADA al instante (HU07).
//   - Click en el cuerpo abre el modal de edición.
//   - Badges de estado y prioridad.
//   - Indicador visual cuando esta vencida (rojo).
//   - Borde lateral con el color de la materia.
// ============================================================

import type { Tarea } from '../../types';
import { EstadoBadge } from './EstadoBadge';
import { PrioridadBadge } from './PrioridadBadge';
import { formatearFechaEntrega } from '../../utils/fechas';

interface TareaCardProps {
  tarea: Tarea;
  onEdit: (tarea: Tarea) => void;
  onDelete: (tarea: Tarea) => void;
  onToggleComplete: (tarea: Tarea) => void;
  isUpdating?: boolean;
}

export function TareaCard({
  tarea,
  onEdit,
  onDelete,
  onToggleComplete,
  isUpdating = false,
}: TareaCardProps) {
  const colorBarra = tarea.materia?.color ?? '#9CA3AF';
  const fechaInfo = formatearFechaEntrega(tarea.fechaEntrega);
  const completada = tarea.estado === 'COMPLETADA';

  return (
    <div
      className={`
        group relative overflow-hidden rounded-lg border bg-white shadow-sm transition
        hover:shadow-md
        ${completada ? 'border-gray-200 opacity-75' : 'border-gray-200'}
      `}
    >
      {/* Barra lateral con el color de la materia */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: colorBarra }}
        aria-hidden="true"
      />

      <div className="flex gap-3 p-4 pl-6">
        {/* CHECKBOX para marcar como completada/pendiente */}
        <button
          type="button"
          onClick={() => onToggleComplete(tarea)}
          disabled={isUpdating}
          className={`
            mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
            border-2 transition
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              completada
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 hover:border-brand-500'
            }
          `}
          aria-label={
            completada ? 'Marcar como pendiente' : 'Marcar como completada'
          }
          title={
            completada ? 'Marcar como pendiente' : 'Marcar como completada'
          }
        >
          {/* Solo muestro el check si esta completada */}
          {completada && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          )}
        </button>

        {/* CONTENIDO PRINCIPAL */}
        <div className="min-w-0 flex-1">
          {/* Cabecera: titulo + acciones */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`
                text-base font-semibold
                ${completada ? 'text-gray-500 line-through' : 'text-gray-900'}
              `}
            >
              {tarea.titulo}
            </h3>

            {/* Botones de editar y eliminar.
                Aparecen siempre para que se vean bien tambien en móvil. */}
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(tarea)}
                className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600"
                aria-label="Editar tarea"
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
                onClick={() => onDelete(tarea)}
                className="rounded-md p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Eliminar tarea"
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

          {/* Descripción (si existe) */}
          {tarea.descripcion && (
            <p
              className={`
                mt-1 line-clamp-2 text-sm
                ${completada ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              {tarea.descripcion}
            </p>
          )}

          {/* Pie con fecha, badges y materia */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* Materia */}
            {tarea.materia && (
              <span className="text-xs font-medium text-gray-700">
                {tarea.materia.nombre}
              </span>
            )}

            {/* Fecha de entrega con color condicional segun urgencia */}
            <span
              className={`
                inline-flex items-center gap-1 text-xs font-medium
                ${
                  fechaInfo.estaVencida && !completada
                    ? 'text-red-600'
                    : fechaInfo.esUrgente && !completada
                    ? 'text-amber-700'
                    : 'text-gray-600'
                }
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              {fechaInfo.texto}
            </span>

            {/* Badges de estado y prioridad */}
            <EstadoBadge estado={tarea.estado} />
            <PrioridadBadge prioridad={tarea.prioridad} />
          </div>
        </div>
      </div>
    </div>
  );
}