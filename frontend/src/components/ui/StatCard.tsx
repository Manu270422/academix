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
    default: { bg: 'bg-gray-100', text: 'text-gray-600' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-600' },
    success: { bg: 'bg-green-100', text: 'text-green-600' },
    info: { bg: 'bg-blue-100', text: 'text-blue-600' },
  };

  const classes = variantClasses[variant];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        {/* Icono con fondo coloreado */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${classes.bg} ${classes.text}`}
        >
          {icon}
        </div>

        {/* Contenido textual */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}