// ============================================================
// UTILIDAD: EXPORTAR TAREAS A .ICS (iCalendar)
// ============================================================
// Yo genero un archivo .ics con las tareas para que el estudiante lo
// importe a su calendario del móvil (Google Calendar, Apple, Outlook)
// y vea ahí sus fechas de entrega junto al resto de su vida.
//
// El formato iCalendar (RFC 5545) es texto plano con reglas estrictas:
//   - Líneas terminadas en CRLF (\r\n).
//   - Fechas en UTC con formato 20260901T140000Z.
//   - Caracteres especiales (, ; \ y salto de línea) escapados.
//   - Cada tarea es un VEVENT con su UID único.
//
// Yo hago todo en el navegador: no necesito backend para esto.
// ============================================================

import type { Tarea } from '../types';

// Yo escapo los caracteres que el formato reserva.
function escaparTexto(valor: string): string {
  return valor
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Yo paso una fecha ISO a la forma UTC que exige el formato: 20260901T140000Z.
function aFechaIcs(fechaIso: string): string {
  return new Date(fechaIso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

// Yo "doblo" las líneas de más de 75 caracteres como pide el RFC:
// la continuación empieza con un espacio. Sin esto, Google Calendar
// puede rechazar el archivo.
function doblarLinea(linea: string): string {
  if (linea.length <= 75) return linea;
  const partes: string[] = [];
  let resto = linea;
  partes.push(resto.slice(0, 75));
  resto = resto.slice(75);
  while (resto.length > 74) {
    partes.push(' ' + resto.slice(0, 74));
    resto = resto.slice(74);
  }
  if (resto.length) partes.push(' ' + resto);
  return partes.join('\r\n');
}

// Yo traduzco mis enums a algo legible para la descripción del evento.
const TEXTO_ESTADO: Record<Tarea['estado'], string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
};
const TEXTO_PRIORIDAD: Record<Tarea['prioridad'], string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
};

/**
 * Yo construyo el contenido .ics completo a partir de una lista de tareas.
 * Cada tarea es un evento de 30 minutos que termina en su fecha de entrega
 * (así el bloque queda "antes" de la hora límite en el calendario), con
 * un recordatorio 24h antes.
 */
export function generarIcs(tareas: Tarea[]): string {
  const ahora = aFechaIcs(new Date().toISOString());

  const lineas: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Academix//Gestor Academico//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Academix - Entregas',
  ];

  for (const tarea of tareas) {
    const fin = new Date(tarea.fechaEntrega);
    const inicio = new Date(fin.getTime() - 30 * 60 * 1000);
    const materia = tarea.materia?.nombre ?? 'Sin materia';

    const descripcion = [
      `Materia: ${materia}`,
      `Estado: ${TEXTO_ESTADO[tarea.estado]}`,
      `Prioridad: ${TEXTO_PRIORIDAD[tarea.prioridad]}`,
      tarea.descripcion ? `\n${tarea.descripcion}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    lineas.push(
      'BEGIN:VEVENT',
      // UID estable: si el estudiante re-exporta, el calendario actualiza
      // el evento en vez de duplicarlo.
      `UID:tarea-${tarea.id}@academix`,
      `DTSTAMP:${ahora}`,
      `DTSTART:${aFechaIcs(inicio.toISOString())}`,
      `DTEND:${aFechaIcs(tarea.fechaEntrega)}`,
      doblarLinea(`SUMMARY:${escaparTexto(`${tarea.titulo} (${materia})`)}`),
      doblarLinea(`DESCRIPTION:${escaparTexto(descripcion)}`),
      tarea.estado === 'COMPLETADA' ? 'STATUS:CONFIRMED' : 'STATUS:TENTATIVE',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      doblarLinea(`DESCRIPTION:${escaparTexto(`Mañana vence: ${tarea.titulo}`)}`),
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lineas.push('END:VCALENDAR');
  return lineas.join('\r\n');
}

/**
 * Yo disparo la descarga del .ics en el navegador creando un Blob y un
 * enlace temporal al que le hago click por código.
 */
export function descargarIcs(tareas: Tarea[], nombreArchivo = 'academix.ics') {
  const contenido = generarIcs(tareas);
  const blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  // Libero la URL temporal para no dejar memoria colgada.
  URL.revokeObjectURL(url);
}
