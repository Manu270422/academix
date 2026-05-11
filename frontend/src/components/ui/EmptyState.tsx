// ============================================================
// COMPONENTE: EMPTYSTATE
// ============================================================
// Componente para mostrar cuando una lista esta vacía.
// En vez de mostrar una pantalla en blanco, muestro un mensaje
// amigable con un icono y opcionalmente un boton de accion.
//
// Mejora muchisimo la UX: el usuario sabe que no hay un error,
// simplemente todavia no hay nada y le sugiero que cree algo.
// ============================================================

import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-600">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}