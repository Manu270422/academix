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
    classes: 'bg-gray-100 text-gray-700 ring-gray-200',
  },
  EN_PROGRESO: {
    label: 'En progreso',
    classes: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  COMPLETADA: {
    label: 'Completada',
    classes: 'bg-green-50 text-green-700 ring-green-200',
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