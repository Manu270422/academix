// ============================================================
// COMPONENTE: ALERT
// ============================================================
// Caja de mensaje para mostrar errores, exitos, advertencias, info.
// La uso para feedback general (ej: "credenciales inválidas",
// "tarea creada correctamente").
// ============================================================

import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
  // Opcional: titulo encima del mensaje.
  title?: string;
}

export function Alert({ variant, title, children }: AlertProps) {
  // Clases por variante: cada una con sus colores de fondo, borde y texto.
  const variantClasses: Record<AlertVariant, string> = {
    error:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300',
    success:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-300',
    warning:
      'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-300',
    info:
      'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300',
  };

  return (
    <div
      className={`rounded-md border p-3 text-sm ${variantClasses[variant]}`}
      role="alert"
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      {children}
    </div>
  );
}