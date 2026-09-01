// ============================================================
// COMPONENTE: MATERIACARD
// ============================================================
// Tarjeta visual que muestra una materia.
// Características:
//   - Borde lateral con el color de la materia.
//   - Conteo de tareas (si el backend lo incluye con _count).
//   - Botones de editar y eliminar.
//   - Responsive: en grid se ajusta automáticamente.
// ============================================================

import { Link } from 'react-router-dom';
import type { Materia } from '../../types';

interface MateriaCardProps {
  materia: Materia;
  onEdit: (materia: Materia) => void;
  onDelete: (materia: Materia) => void;
}

export function MateriaCard({ materia, onEdit, onDelete }: MateriaCardProps) {
  // Si la materia no tiene color, uso un gris neutro como fallback.
  const colorBarra = materia.color ?? '#9CA3AF';

  // Saco el conteo de tareas si viene incluido (backend Módulo 5 lo manda).
  const totalTareas = materia._count?.tareas ?? 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
      {/* Barra lateral de color a la izquierda.
          Uso style inline porque el color es dinámico (viene de la BD).
          Tailwind no puede generar clases dinámicas como bg-[#xxxxxx]. */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: colorBarra }}
        aria-hidden="true"
      />

      <div className="p-5 pl-6">
        {/* Cabecera con nombre y dot de color */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* El título es un enlace que cubre toda la tarjeta
                (after:absolute inset-0). Así todo el card lleva al
                detalle, pero los botones de editar/borrar (que tienen
                z-10) siguen funcionando encima. */}
            <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Link
                to={`/materias/${materia.id}`}
                className="after:absolute after:inset-0 hover:text-brand-600"
              >
                {materia.nombre}
              </Link>
            </h3>

            {/* Descripción (truncada a 2 líneas si es larga).
                line-clamp-2 corta el texto bonito con "..." al final. */}
            {materia.descripcion && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {materia.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Pie con conteo de tareas y acciones */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
          {/* Conteo de tareas */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>
              {totalTareas} {totalTareas === 1 ? 'tarea' : 'tareas'}
            </span>
          </div>

          {/* Botones de acción. z-10 para quedar por encima del enlace
              que cubre la tarjeta. */}
          <div className="relative z-10 flex gap-1">
            <button
              type="button"
              onClick={() => onEdit(materia)}
              className="rounded-md p-2 text-gray-500 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-600"
              aria-label={`Editar ${materia.nombre}`}
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
              onClick={() => onDelete(materia)}
              className="rounded-md p-2 text-gray-500 dark:text-gray-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Eliminar ${materia.nombre}`}
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
      </div>
    </div>
  );
}