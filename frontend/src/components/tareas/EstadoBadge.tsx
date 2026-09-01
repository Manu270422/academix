// ============================================================
// COMPONENTE: ESTADOBADGE
// ============================================================
// Badge visual que muestra el estado de una tarea con su color.
// PENDIENTE -> gris, EN_PROGRESO -> azul, COMPLETADA -> verde.
// ============================================================

import type { EstadoTarea } from '../../types';

interface EstadoBadgeProps {
  estado: EstadoTarea;
}

// Corregido: Record y sus tipos deben estar unidos sin saltos de línea extraños
const ESTADO_CONFIG: Record<EstadoTarea, { label: string; classes: string }> = {
  PENDIENTE: {
    label: 'Pendiente',
    classes: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-gray-200 dark:ring-gray-700',
  },
  EN_PROGRESO: {
    label: 'En progreso',
    classes:
      'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30',
  },
  COMPLETADA: {
    label: 'Completada',
    classes:
      'bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-500/30',
  },
};

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const { label, classes } = ESTADO_CONFIG[estado];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {label}
    </span>
  );
}