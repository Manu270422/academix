// ============================================================
// COMPONENTE: STATCARD
// ============================================================
// Tarjeta visual para mostrar una estadistica en el dashboard.
// Muestra: icono, etiqueta, valor numérico grande, y opcionalmente
// un color tematico segun el contenido.
// ============================================================

import type { ReactNode } from 'react';

type StatVariant = 'default' | 'warning' | 'success' | 'info';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  variant?: StatVariant;
}

export function StatCard({
  label,
  value,
  icon,
  variant = 'default',
}: StatCardProps) {
  // Cada variante tiene su color de icono y fondo del icono.
  const variantClasses: Record<StatVariant, { bg: string; text: string }> = {
    default: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
    },
    warning: {
      bg: 'bg-amber-100 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
    },
    success: {
      bg: 'bg-green-100 dark:bg-green-500/15',
      text: 'text-green-600 dark:text-green-400',
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-500/15',
      text: 'text-blue-600 dark:text-blue-400',
    },
  };

  const classes = variantClasses[variant];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        {/* Icono con fondo coloreado */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${classes.bg} ${classes.text}`}
        >
          {icon}
        </div>

        {/* Contenido textual */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}