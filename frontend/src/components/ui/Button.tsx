// ============================================================
// COMPONENTE: BUTTON
// ============================================================
// Botón reutilizable con variantes, tamaños y estado de carga.
// Lo voy a usar muchisimo en toda la app. Por eso le pongo opciones
// que cubren los casos mas comunes.
//
// Variantes:
//   - primary: azul, acción principal (Iniciar sesión, Crear tarea, etc.)
//   - secondary: gris, acción secundaria (Cancelar, Cerrar)
//   - danger: rojo, acciones destructivas (Eliminar)
//
// Estado isLoading: muestra un spinner y deshabilita el botón.
// ============================================================

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  // Clases base que aplican a todas las variantes.
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-md font-medium
    transition focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-60
  `;

  // Clases por variante (color del fondo y texto).
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  // Clases por tamaño.
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Si esta cargando o explicitamente disabled, lo deshabilito.
  const isDisabled = isLoading || disabled;

  return (
    <button
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...rest}
    >
      {/* Si está cargando, muestro un spinner antes del texto.
          Tailwind tiene la clase animate-spin que rota infinitamente. */}
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}