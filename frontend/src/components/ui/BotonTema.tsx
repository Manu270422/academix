// ============================================================
// COMPONENTE: BOTONTEMA (CLARO / OSCURO / SISTEMA)
// ============================================================
// Yo muestro un botón que rota entre los 3 temas al hacer click.
// El icono cambia según el tema elegido:
//   - Sol      -> claro
//   - Luna     -> oscuro
//   - Monitor  -> sistema (sigue al sistema operativo)
//
// Lo dejo como componente aparte para poder reusarlo (por ahora va
// en la Sidebar, pero podría ir también en el login).
// ============================================================

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTema, type Tema } from '../../hooks/useTema';

// Yo defino el texto y el icono de cada tema en un solo lugar.
const CONFIG: Record<Tema, { label: string; Icono: typeof Sun }> = {
  claro: { label: 'Tema claro', Icono: Sun },
  oscuro: { label: 'Tema oscuro', Icono: Moon },
  sistema: { label: 'Tema del sistema', Icono: Monitor },
};

export function BotonTema() {
  const { tema, rotarTema } = useTema();
  const { label, Icono } = CONFIG[tema];

  return (
    <button
      type="button"
      onClick={rotarTema}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
      title={`${label} (click para cambiar)`}
      aria-label={label}
    >
      <Icono className="h-4 w-4" />
      {label}
    </button>
  );
}
