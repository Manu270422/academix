// ============================================================
// COMPONENTE: NOTIFICACIONESCAMPANITA
// ============================================================
// La campanita de notificaciones que va en el header/sidebar.
// Muestra un contador con las notificaciones sin leer, y al hacer
// clic despliega un panel con la lista de recordatorios enviados
// (tareas que estan por vencer segun los umbrales de 72h/24h/6h).
//
// Tambien reproduce un sonido corto cuando llega una notificacion
// NUEVA (el contador de no leidos sube) mientras el estudiante
// tiene la app abierta, y ofrece activar/desactivar las
// notificaciones push del sistema operativo.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import {
  useMarcarRecordatorioLeido,
  useRecordatorios,
} from '../../hooks/useReminders';
import { usePush } from '../../hooks/usePush';
import { EmptyState } from '../ui/EmptyState';
import { reproducirSonidoNotificacion } from '../../utils/sonido';
import type { Recordatorio } from '../../types';

// Formateo simple de fecha para mostrar cuando se envio el aviso.
// Uso un formato corto (dia + hora) porque es solo informativo.
function formatearFechaEnvio(fechaIso: string | null): string {
  if (!fechaIso) return '';
  return new Date(fechaIso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Traduzco el umbral en horas a un texto legible para el estudiante.
function textoUmbral(horas: number): string {
  if (horas >= 24) {
    const dias = Math.round(horas / 24);
    return dias === 1 ? '1 dia antes' : `${dias} dias antes`;
  }
  return `${horas} horas antes`;
}

export function NotificacionesCampanita() {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useRecordatorios();
  const marcarLeido = useMarcarRecordatorioLeido();
  const push = usePush();

  const recordatorios = data?.recordatorios ?? [];
  const noLeidos = data?.noLeidos ?? 0;

  // Guardo el numero de no-leidos anterior para poder comparar y
  // detectar cuando SUBE (llego una notificacion nueva). Empiezo en
  // null para saber que todavia no cargo la primera vez (y asi NO
  // sonar apenas el estudiante abre la app si ya tenia pendientes).
  const noLeidosAnteriorRef = useRef<number | null>(null);

  useEffect(() => {
    if (data === undefined) return;

    const anterior = noLeidosAnteriorRef.current;

    // Solo sueno si ya habia un valor previo (no en la primera carga)
    // Y ese valor subio (llego una notificacion nueva de verdad).
    if (anterior !== null && noLeidos > anterior) {
      reproducirSonidoNotificacion();
    }

    noLeidosAnteriorRef.current = noLeidos;
  }, [data, noLeidos]);

  // Cierro el panel si el usuario hace clic afuera de el.
  useEffect(() => {
    function manejarClicAfuera(evento: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', manejarClicAfuera);
    return () => document.removeEventListener('mousedown', manejarClicAfuera);
  }, []);

  function manejarClicNotificacion(recordatorio: Recordatorio) {
    if (!recordatorio.leidoEnApp) {
      marcarLeido.mutate(recordatorio.id);
    }
  }

  return (
    <div className="relative" ref={contenedorRef}>
      {/* Boton de la campanita */}
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {noLeidos > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {noLeidos > 9 ? '9+' : noLeidos}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {abierto && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Notificaciones
            </h3>

            {/* Boton de activar/desactivar push, solo si el navegador
                lo soporta. */}
            {push.soportado && (
              <button
                type="button"
                onClick={push.activo ? push.desactivar : push.activar}
                disabled={push.cargando}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                title={
                  push.activo
                    ? 'Desactivar notificaciones del sistema'
                    : 'Activar notificaciones del sistema'
                }
              >
                {push.activo ? (
                  <BellRing className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <BellOff className="h-3.5 w-3.5" />
                )}
                {push.activo ? 'Activas' : 'Activar'}
              </button>
            )}
          </div>

          {push.error && (
            <p className="border-b border-gray-100 px-4 py-2 text-xs text-red-600">
              {push.error}
            </p>
          )}

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                Cargando...
              </p>
            )}

            {!isLoading && recordatorios.length === 0 && (
              <div className="px-4 py-6">
                <EmptyState
                  icon={<Bell className="h-8 w-8" />}
                  title="Todo al dia"
                  description="No tienes notificaciones por ahora."
                />
              </div>
            )}

            {!isLoading &&
              recordatorios.map((recordatorio) => (
                <button
                  key={recordatorio.id}
                  type="button"
                  onClick={() => manejarClicNotificacion(recordatorio)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-gray-50 ${
                    !recordatorio.leidoEnApp ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {recordatorio.tarea.titulo}
                    </span>
                    {!recordatorio.leidoEnApp && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {recordatorio.tarea.materia.nombre} ·{' '}
                    {textoUmbral(recordatorio.anticipacionHoras)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatearFechaEnvio(recordatorio.fechaEnvioEmail)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}