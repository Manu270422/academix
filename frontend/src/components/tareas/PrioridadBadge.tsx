// ============================================================
// COMPONENTE: PRIORIDADBADGE
// ============================================================
// Badge visual que muestra la prioridad con su color e icono.
// BAJA -> verde, MEDIA -> amarillo, ALTA -> rojo (urgente).
// ============================================================

import type { Prioridad } from '../../types';

interface PrioridadBadgeProps {
  prioridad: Prioridad;
}

// Corregido: Estructura del Record unificada
const PRIORIDAD_CONFIG: Record<Prioridad, { label: string; classes: string; icono: string }> = {
  BAJA: {
    label: 'Baja',
    classes:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    icono: '↓',
  },
  MEDIA: {
    label: 'Media',
    classes:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    icono: '→',
  },
  ALTA: {
    label: 'Alta',
    classes:
      'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
    icono: '↑',
  },
};

export function PrioridadBadge({ prioridad }: PrioridadBadgeProps) {
  const { label, classes, icono } = PRIORIDAD_CONFIG[prioridad];

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      <span aria-hidden="true">{icono}</span>
      {label}
    </span>
  );
}