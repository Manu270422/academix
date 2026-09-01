// ============================================================
// COMPONENTE: BOTONINSTALARAPP
// ============================================================
// Yo muestro un botón "Instalar app" solo cuando el navegador
// realmente ofrece instalar Academix (y no está ya instalada).
// Si no se puede, no renderizo nada.
// ============================================================

import { Download } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export function BotonInstalarApp() {
  const { sePuedeInstalar, instalar } = usePwaInstall();

  if (!sePuedeInstalar) return null;

  return (
    <button
      type="button"
      onClick={instalar}
      className="mb-2 flex w-full items-center justify-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
    >
      <Download className="h-4 w-4" />
      Instalar app
    </button>
  );
}
