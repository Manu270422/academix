// ============================================================
// HOOK: usePwaInstall
// ============================================================
// Yo detecto si el navegador ofrece instalar Academix como app
// ("Añadir a la pantalla de inicio") y expongo una función para
// lanzar ese diálogo desde un botón mío.
//
// Cómo funciona:
//   - El navegador dispara el evento 'beforeinstallprompt' cuando la
//     app cumple los requisitos de PWA y aún no está instalada.
//   - Yo guardo ese evento y, cuando el estudiante pulsa mi botón,
//     llamo a event.prompt().
//   - Si ya está instalada (display-mode: standalone) o el navegador
//     no lo soporta (iOS Safari), no muestro el botón.
// ============================================================

import { useCallback, useEffect, useState } from 'react';

// El evento no está en los tipos estándar de TS, así que lo describo.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function estaInstalada(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS marca esto cuando se abre desde la pantalla de inicio.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function usePwaInstall() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalada, setInstalada] = useState<boolean>(estaInstalada);

  useEffect(() => {
    function onBeforePrompt(e: Event) {
      // Evito que el navegador muestre su propio mini-infobar.
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalada(true);
      setEvento(null);
    }

    window.addEventListener('beforeinstallprompt', onBeforePrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforePrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const instalar = useCallback(async () => {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    // El evento solo se puede usar una vez.
    setEvento(null);
    if (outcome === 'accepted') setInstalada(true);
  }, [evento]);

  return {
    // Solo tiene sentido mostrar el botón si hay evento y no está instalada.
    sePuedeInstalar: Boolean(evento) && !instalada,
    instalada,
    instalar,
  };
}
