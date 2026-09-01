// ============================================================
// COMPONENTE: BOTONFACEBOOK
// ============================================================
// Renderiza un boton de "Continuar con Facebook". A diferencia de
// Google (que tiene un boton oficial pre-armado), con Facebook
// construyo mi propio boton y llamo al SDK de Facebook manualmente
// con FB.login(). El SDK se carga de forma dinamica la primera vez
// que este componente se monta (no lo puse en index.html porque
// necesita configurarse con un callback "fbAsyncInit" antes de
// cargar, y es mas limpio manejarlo todo aqui).
// ============================================================

import { useEffect, useRef, useState } from 'react';

// Igual que con Google, declaro el tipo minimo que necesito del SDK
// de Facebook, sin instalar paquetes de tipos extra.
declare global {
  interface Window {
    FB?: {
      init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { accessToken: string };
          status: string;
        }) => void,
        opciones: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string;

// Controlo con una variable a nivel de modulo si el script ya se
// esta cargando, para no inyectarlo dos veces si el usuario visita
// Login y Register (ambos montan este componente).
let scriptCargando = false;

function cargarSdkFacebook(onListo: () => void): void {
  if (window.FB) {
    onListo();
    return;
  }

  window.fbAsyncInit = () => {
    window.FB?.init({
      appId: FACEBOOK_APP_ID,
      cookie: true,
      xfbml: false,
      version: 'v21.0',
    });
    onListo();
  };

  if (scriptCargando) return;
  scriptCargando = true;

  const script = document.createElement('script');
  script.src = 'https://connect.facebook.net/es_LA/sdk.js';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

interface BotonFacebookProps {
  onAccessToken: (accessToken: string) => void;
}

export function BotonFacebook({ onAccessToken }: BotonFacebookProps) {
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    cargarSdkFacebook(() => {
      if (montadoRef.current) setListo(true);
    });
    return () => {
      montadoRef.current = false;
    };
  }, []);

  function manejarClick(): void {
    if (!window.FB) return;

    setCargando(true);
    window.FB.login(
      (response) => {
        setCargando(false);
        if (response.status === 'connected' && response.authResponse) {
          onAccessToken(response.authResponse.accessToken);
        }
        // Si el usuario cancela o no autoriza, no hago nada: se queda
        // simplemente en la pantalla de login, sin mostrar error (es
        // una accion voluntaria suya, no una falla real).
      },
      { scope: 'email,public_profile' }
    );
  }

  return (
    <button
      type="button"
      onClick={manejarClick}
      disabled={!listo || cargando}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#166fe0] disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
      </svg>
      {cargando ? 'Conectando...' : 'Continuar con Facebook'}
    </button>
  );
}