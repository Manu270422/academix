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
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* CONTENEDOR PRINCIPAL.
          flex-1 hace que ocupe todo el espacio que sobra al lado de la sidebar.
          min-w-0 evita que el contenido empuje la sidebar (truco de flexbox). */}
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Aqui se inyecta el contenido de cada pagina.
            El padding lo manejo aqui para que sea consistente en toda la app. */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}