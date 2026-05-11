// ============================================================
// COMPONENTE: TAREAFILTROS
// ============================================================
// Selector visual de filtros para el listado de tareas.
// Cada filtro envia su valor al padre via callback.
// ============================================================

import type { Materia, EstadoTarea, Prioridad } from '../../types';
import type { TareasFilters } from '../../api/tasks.service';

interface TareaFiltrosProps {
  materias: Materia[];
  filtros: TareasFilters;
  onChange: (filtros: TareasFilters) => void;
}

export function TareaFiltros({
  materias,
  filtros,
  onChange,
}: TareaFiltrosProps) {
  // Helper para actualizar UN filtro específico sin perder los demás.
  function actualizar<K extends keyof TareasFilters>(
    key: K,
    value: TareasFilters[K]
  ) {
    // Si el valor es vacío (string vacío o undefined), lo quito del objeto.
    // Asi no mando "?estado=" al backend con valor vacío.
    const nuevos = { ...filtros };
    if (value === '' || value === undefined) {
      delete nuevos[key];
    } else {
      nuevos[key] = value;
    }
    onChange(nuevos);
  }

  // Cuento cuantos filtros estan activos para mostrar el botón "Limpiar".
  const filtrosActivos = Object.keys(filtros).length;

  const selectClasses =
    'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filtros:</span>

        {/* Filtro por estado */}
        <select
          value={filtros.estado ?? ''}
          onChange={(e) =>
            actualizar('estado', (e.target.value || undefined) as EstadoTarea | undefined)
          }
          className={selectClasses}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="EN_PROGRESO">En progreso</option>
          <option value="COMPLETADA">Completadas</option>
        </select>

        {/* Filtro por prioridad */}
        <select
          value={filtros.prioridad ?? ''}
          onChange={(e) =>
            actualizar('prioridad', (e.target.value || undefined) as Prioridad | undefined)
          }
          className={selectClasses}
          aria-label="Filtrar por prioridad"
        >
          <option value="">Todas las prioridades</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>

        {/* Filtro por materia */}
        <select
          value={filtros.materiaId ?? ''}
          onChange={(e) =>
            actualizar(
              'materiaId',
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className={selectClasses}
          aria-label="Filtrar por materia"
        >
          <option value="">Todas las materias</option>
          {materias.map((materia) => (
            <option key={materia.id} value={materia.id}>
              {materia.nombre}
            </option>
          ))}
        </select>

        {/* Botón para limpiar todos los filtros (solo si hay alguno activo) */}
        {filtrosActivos > 0 && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="ml-auto text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}