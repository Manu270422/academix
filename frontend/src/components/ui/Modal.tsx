// ============================================================
// COMPONENTE: MODAL
// ============================================================
// Modal reutilizable para mostrar contenido en una capa por encima.
// Lo voy a usar para: crear/editar materia, crear/editar tarea, confirmaciones.
//
// Caracteristicas:
//   - Se cierra con tecla Escape.
//   - Se cierra al hacer click en el overlay (opcional).
//   - Se cierra con botón X.
//   - Bloquea el scroll del body mientras está abierto.
//   - Soporta tamaños: sm, md, lg.
// ============================================================

import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  // Si es false, no se cierra al hacer click en el overlay.
  // Util para formularios donde no queremos que el usuario pierda lo escrito por accidente.
  closeOnOverlayClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  // Cerrar con tecla Escape.
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleEscape);

    // Bloqueo el scroll del body mientras el modal esta abierto.
    // Sin esto, el usuario podria scrollear el contenido detras del modal.
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay oscuro detras del modal.
          stopPropagation evita que el click en el contenido cierre el modal. */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Caja del modal.
          z-10 lo pone encima del overlay.
          La animación sutil de entrada queda mejor que una aparición brusca. */}
      <div
        className={`
          relative z-10 w-full ${sizeClasses[size]}
          rounded-lg bg-white dark:bg-gray-900 shadow-xl
          animate-in fade-in zoom-in-95 duration-150
          max-h-[90vh] overflow-hidden flex flex-col
        `}
      >
        {/* Cabecera con titulo y botón X */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h3
            id="modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 dark:text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400"
            aria-label="Cerrar modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido (scrolleable si es muy alto) */}
        <div className="overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}