// ============================================================
// COMPONENTE: BOTONGOOGLE
// ============================================================
// Renderiza el boton oficial de "Continuar con Google" usando la
// libreria Google Identity Services (el script que cargue en
// index.html). Cuando el estudiante hace click y confirma su
// cuenta, Google me entrega un "credential" (un JWT firmado) que
// le paso al callback onCredential para que LoginPage/RegisterPage
// lo manden al backend.
// ============================================================

import { useEffect, useRef } from 'react';

// Google inyecta esta variable global "google" cuando carga su
// script (ver index.html). TypeScript no la conoce, asi que declaro
// el tipo minimo que necesito usar, sin instalar paquetes de tipos
// extra solo para esto.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            contenedor: HTMLElement,
            opciones: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: string | number;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

interface BotonGoogleProps {
  onCredential: (credential: string) => void;
}

export function BotonGoogle({ onCredential }: BotonGoogleProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // El script de Google carga de forma asincrona (con "defer" en
    // index.html), asi que puede que "window.google" todavia no
    // exista en el primer render. Reintento cada 100ms hasta que
    // aparezca, con un limite para no quedar en un bucle eterno si
    // algo sale mal (ej. el script no cargo por bloqueador de anuncios).
    let intentos = 0;
    const intervalo = setInterval(() => {
      intentos += 1;

      if (window.google && contenedorRef.current) {
        clearInterval(intervalo);

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        });

        window.google.accounts.id.renderButton(contenedorRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: '100%',
        });
      } else if (intentos > 50) {
        // Pasaron 5 segundos y no cargo: probablemente un bloqueador
        // de anuncios o problema de red. No hago nada mas, el
        // estudiante simplemente no ve el boton de Google (pero el
        // login normal sigue funcionando).
        clearInterval(intervalo);
      }
    }, 100);

    return () => clearInterval(intervalo);
  }, [onCredential]);

  return <div ref={contenedorRef} className="flex justify-center" />;
}