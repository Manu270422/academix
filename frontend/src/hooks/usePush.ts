// ============================================================
// HOOK: NOTIFICACIONES PUSH
// ============================================================
// Maneja el estado de las notificaciones push del estudiante:
// si el navegador las soporta, si ya estan activas, y las acciones
// para activarlas o desactivarlas.
// ============================================================

import { useEffect, useState } from 'react';
import {
  crearSuscripcionPush,
  obtenerSuscripcionActual,
  registrarServiceWorker,
  soportaPush,
} from '../utils/push';
import {
  eliminarSuscripcionPush,
  guardarSuscripcionPush,
} from '../api/push.service';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

export function usePush() {
  const [activo, setActivo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al montar, reviso si el estudiante ya tenia las notificaciones
  // activas de una sesion anterior (para no mostrarle el boton de
  // "Activar" si ya las tiene prendidas).
  useEffect(() => {
    if (!soportaPush()) return;

    registrarServiceWorker()
      .then((registro) => obtenerSuscripcionActual(registro))
      .then((suscripcion) => setActivo(suscripcion !== null))
      .catch(() => undefined);
  }, []);

  async function activar(): Promise<void> {
    if (!soportaPush()) {
      setError('Tu navegador no soporta notificaciones push.');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const registro = await registrarServiceWorker();
      const suscripcion = await crearSuscripcionPush(
        registro,
        VAPID_PUBLIC_KEY
      );

      await guardarSuscripcionPush(
        suscripcion.toJSON() as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        }
      );

      setActivo(true);
    } catch {
      // El error mas comun es que el estudiante le dio "Bloquear"
      // al permiso del navegador.
      setError(
        'No se pudo activar. Revisa los permisos de notificaciones de tu navegador.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function desactivar(): Promise<void> {
    setCargando(true);

    try {
      const registro = await registrarServiceWorker();
      const suscripcion = await obtenerSuscripcionActual(registro);

      if (suscripcion) {
        await eliminarSuscripcionPush(suscripcion.endpoint);
        await suscripcion.unsubscribe();
      }

      setActivo(false);
    } finally {
      setCargando(false);
    }
  }

  return { activo, cargando, error, activar, desactivar, soportado: soportaPush() };
}