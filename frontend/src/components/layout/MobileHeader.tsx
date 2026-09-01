// ============================================================
// COMPONENTE: HEADER MÓVIL
// ============================================================
// Header que SOLO aparece en pantallas pequenas (debajo de "lg").
// En escritorio se oculta porque la sidebar siempre es visible.
//
// Contiene:
//   - Botón de menu hamburguesa para abrir la sidebar.
//   - Logo de Academix.
//   - Campanita de notificaciones.
// ============================================================

import { NotificacionesCampanita } from './NotificacionesCampanita';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    // El "lg:hidden" asegura que este header desaparece en escritorio.
    // En desktop la sidebar es siempre visible y no necesito este header.
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm lg:hidden">
      {/* Botón hamburguesa */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-md p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Abrir menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Logo */}
      <h1 className="flex-1 text-lg font-bold text-brand-700">Academix</h1>

      {/* Buscador global */}
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new Event('academix:open-search'))
        }
        className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Buscar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </button>

      {/* Campanita de notificaciones */}
      <NotificacionesCampanita />
    </header>
  );
}