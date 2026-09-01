// ============================================================
// COMPONENTE: BOTONEXPORTARICS
// ============================================================
// Yo muestro un botón que descarga las tareas dadas como archivo .ics
// para importarlas al calendario del móvil.
//
// Lo hago componente aparte para reusarlo: en la página de Tareas
// exporta la lista filtrada, y en el Calendario la semana visible.
// ============================================================

import { CalendarArrowDown } from 'lucide-react';
import type { Tarea } from '../../types';
import { descargarIcs } from '../../utils/ics';

interface BotonExportarIcsProps {
  tareas: Tarea[];
  // Nombre del archivo descargado (sin importar, ya incluyo el .ics).
  nombreArchivo?: string;
}

export function BotonExportarIcs({
  tareas,
  nombreArchivo = 'academix.ics',
}: BotonExportarIcsProps) {
  // Si no hay nada que exportar, dejo el botón deshabilitado.
  const vacio = tareas.length === 0;

  return (
    <button
      type="button"
      onClick={() => descargarIcs(tareas, nombreArchivo)}
      disabled={vacio}
      className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
      title={
        vacio
          ? 'No hay tareas para exportar'
          : `Descargar ${tareas.length} ${
              tareas.length === 1 ? 'tarea' : 'tareas'
            } como calendario (.ics)`
      }
    >
      <CalendarArrowDown className="h-4 w-4" />
      Exportar (.ics)
    </button>
  );
}
