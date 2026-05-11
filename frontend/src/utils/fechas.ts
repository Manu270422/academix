// ============================================================
// UTILIDADES PARA FORMATEO DE FECHAS
// ============================================================
// Aquí centralizo las funciones de manejo de fechas para no andar
// duplicando lógica en los componentes.
//
// Mostrar "vence en 3 días" es mucho mas útil que "2026-05-15"
// porque el cerebro humano procesa fechas relativas mas rápido.
// ============================================================

/**
 * Devuelve un texto amigable indicando cuando vence una tarea.
 * Ejemplos:
 *   - "Venció hace 3 días"  (vencida)
 *   - "Vence hoy"
 *   - "Vence mañana"
 *   - "Vence en 5 días"
 *   - "Vence el 15 de julio"  (mas de 7 días)
 */
export function formatearFechaEntrega(fechaIso: string): {
  texto: string;
  estaVencida: boolean;
  esUrgente: boolean; // hoy o mañana
} {
  const fecha = new Date(fechaIso);
  const ahora = new Date();

  // Calculo la diferencia en días.
  // Para que "mañana" cuente bien, normalizo ambas fechas a medianoche.
  const fechaSinHora = new Date(fecha);
  fechaSinHora.setHours(0, 0, 0, 0);

  const ahoraSinHora = new Date(ahora);
  ahoraSinHora.setHours(0, 0, 0, 0);

  const diffMs = fechaSinHora.getTime() - ahoraSinHora.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Vencida
  if (diffDias < 0) {
    const diasVencida = Math.abs(diffDias);
    return {
      texto:
        diasVencida === 1
          ? 'Venció hace 1 día'
          : `Venció hace ${diasVencida} días`,
      estaVencida: true,
      esUrgente: false,
    };
  }

  // Hoy
  if (diffDias === 0) {
    return { texto: 'Vence hoy', estaVencida: false, esUrgente: true };
  }

  // Mañana
  if (diffDias === 1) {
    return { texto: 'Vence mañana', estaVencida: false, esUrgente: true };
  }

  // Próximos 7 días
  if (diffDias <= 7) {
    return {
      texto: `Vence en ${diffDias} días`,
      estaVencida: false,
      esUrgente: false,
    };
  }

  // Más de 7 días: muestro la fecha completa formateada.
  const opciones: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
  };
  // Si es de otro año, añado el año al formato..
  if (fecha.getFullYear() !== ahora.getFullYear()) {
    opciones.year = 'numeric';
  }

  return {
    texto: `Vence el ${fecha.toLocaleDateString('es-CO', opciones)}`,
    estaVencida: false,
    esUrgente: false,
  };
}

/**
 * Convierte una fecha ISO a un string compatible con input type="datetime-local".
 * Necesario porque el input no acepta el formato ISO con la "Z".
 *
 * Ej: "2026-12-15T23:59:00.000Z" -> "2026-12-15T18:59"  (en GMT-5 Colombia)
 */
export function isoADateTimeLocal(fechaIso: string): string {
  const fecha = new Date(fechaIso);

  // Ajusto al timezone local del usuario.
  const offsetMinutos = fecha.getTimezoneOffset();
  const fechaLocal = new Date(fecha.getTime() - offsetMinutos * 60 * 1000);

  // Devuelvo solo los primeros 16 caracteres (YYYY-MM-DDTHH:MM).
  return fechaLocal.toISOString().slice(0, 16);
}

/**
 * Convierte un valor de input datetime-local a string ISO para enviar al backend.
 *
 * Ej: "2026-12-15T18:59" -> "2026-12-15T23:59:00.000Z"  (desde GMT-5)
 */
export function dateTimeLocalAIso(valor: string): string {
  return new Date(valor).toISOString();
}

/**
 * Devuelve un valor mínimo para input datetime-local: ahora mismo.
 * Lo uso para que el usuario no pueda elegir fechas en el pasado.
 */
export function fechaMinimaParaInput(): string {
  return isoADateTimeLocal(new Date().toISOString());
}