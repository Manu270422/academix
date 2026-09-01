// ============================================================
// COMPONENTE: TAREABUSQUEDAORDEN
// ============================================================
// Yo pongo una caja de búsqueda por texto y un selector de orden.
// Ambos trabajan en el cliente sobre la lista que ya devolvió el
// backend, así que no necesito tocar la API.
// ============================================================

export type OrdenTareas = 'fecha' | 'prioridad' | 'recientes';

interface TareaBusquedaOrdenProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  orden: OrdenTareas;
  onOrdenChange: (valor: OrdenTareas) => void;
}

export function TareaBusquedaOrden({
  busqueda,
  onBusquedaChange,
  orden,
  onOrdenChange,
}: TareaBusquedaOrdenProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Caja de búsqueda */}
      <div className="relative min-w-0 flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar por título, descripción o materia..."
          aria-label="Buscar tareas"
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Selector de orden */}
      <select
        value={orden}
        onChange={(e) => onOrdenChange(e.target.value as OrdenTareas)}
        aria-label="Ordenar tareas"
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="fecha">Fecha de entrega (más próxima)</option>
        <option value="prioridad">Prioridad (alta primero)</option>
        <option value="recientes">Añadidas recientemente</option>
      </select>
    </div>
  );
}
