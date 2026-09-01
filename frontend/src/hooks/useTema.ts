// ============================================================
// HOOK: useTema (MODO CLARO / OSCURO)
// ============================================================
// Yo manejo el tema de la app con 3 opciones:
//   - 'claro'   -> siempre claro.
//   - 'oscuro'  -> siempre oscuro.
//   - 'sistema' -> sigue la preferencia del sistema operativo.
//
// Guardo la eleccion en localStorage para que se recuerde entre
// visitas. La clase "dark" en <html> es lo que activa las variantes
// "dark:" de Tailwind.
//
// OJO: en index.html hay un script inline que aplica el tema ANTES
// de que cargue React, para que no haya un parpadeo blanco al entrar
// en modo oscuro. Este hook mantiene todo sincronizado despues.
// ============================================================

import { useCallback, useEffect, useState } from 'react';

export type Tema = 'claro' | 'oscuro' | 'sistema';

const STORAGE_KEY = 'academix-tema';

// Yo leo el tema guardado. Si no hay nada o es un valor raro, uso 'sistema'.
function leerTemaGuardado(): Tema {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado === 'claro' || guardado === 'oscuro' || guardado === 'sistema') {
    return guardado;
  }
  return 'sistema';
}

// Yo resuelvo si, con el tema elegido, la app debe verse oscura AHORA.
function calcularEsOscuro(tema: Tema): boolean {
  if (tema === 'oscuro') return true;
  if (tema === 'claro') return false;
  // 'sistema': pregunto al navegador.
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Yo aplico (o quito) la clase "dark" en <html>.
function aplicarClase(esOscuro: boolean): void {
  document.documentElement.classList.toggle('dark', esOscuro);
}

export function useTema() {
  const [tema, setTemaState] = useState<Tema>(() => leerTemaGuardado());
  const [esOscuro, setEsOscuro] = useState<boolean>(() =>
    calcularEsOscuro(leerTemaGuardado())
  );

  // Cada vez que cambia el tema elegido: guardo y aplico la clase.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, tema);
    const oscuro = calcularEsOscuro(tema);
    setEsOscuro(oscuro);
    aplicarClase(oscuro);
  }, [tema]);

  // Si el tema es 'sistema', escucho los cambios del sistema operativo
  // (por ejemplo cuando anochece y el modo automatico se activa).
  useEffect(() => {
    if (tema !== 'sistema') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setEsOscuro(e.matches);
      aplicarClase(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [tema]);

  const setTema = useCallback((nuevo: Tema) => setTemaState(nuevo), []);

  // Atajo para el boton: rota claro -> oscuro -> sistema -> claro...
  const rotarTema = useCallback(() => {
    setTemaState((actual) =>
      actual === 'claro' ? 'oscuro' : actual === 'oscuro' ? 'sistema' : 'claro'
    );
  }, []);

  return { tema, esOscuro, setTema, rotarTema };
}
