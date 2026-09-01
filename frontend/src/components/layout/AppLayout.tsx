// ============================================================
// COMPONENTE: APPLAYOUT
// ============================================================
// Es el "envoltorio" de TODAS las paginas internas de la app.
// Combina la sidebar con el contenido principal (children).
//
// Patron de uso:
//   <AppLayout>
//     <DashboardPage />
//   </AppLayout>
//
// La sidebar mantiene su estado abierto/cerrado en este componente.
// El contenido se inyecta via children.
// ============================================================

import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { NotificacionesCampanita } from './NotificacionesCampanita';
import { CommandPalette } from '../CommandPalette';

// Abre el buscador global (lo escucha CommandPalette).
function abrirBuscador() {
  window.dispatchEvent(new Event('academix:open-search'));
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Estado para controlar la visibilidad de la sidebar en movil.
  // En desktop la sidebar siempre se muestra (CSS), asi que esto
  // solo afecta la vista movil.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // El "lg:flex" hace que en escritorio la sidebar y el main esten lado a lado.
    // En movil son apilados (la sidebar se superpone como modal).
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:flex">
      {/* Buscador global (Ctrl/Cmd + K). Se monta una vez para toda
          la app. */}
      <CommandPalette />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* CONTENEDOR PRINCIPAL.
          flex-1 hace que ocupe todo el espacio que sobra al lado de la sidebar.
          min-w-0 evita que el contenido empuje la sidebar (truco de flexbox). */}
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Header de escritorio: buscador + campanita.
            En movil van dentro de MobileHeader (otro archivo). */}
        <div className="hidden items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900 lg:flex">
          <button
            type="button"
            onClick={abrirBuscador}
            className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            Buscar
            <kbd className="ml-2 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700 dark:text-gray-500">
              Ctrl K
            </kbd>
          </button>

          <NotificacionesCampanita />
        </div>

        {/* Aqui se inyecta el contenido de cada pagina.
            El padding lo manejo aqui para que sea consistente en toda la app. */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}