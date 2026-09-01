// ============================================================
// TESTS: utils/ics
// ============================================================
// Yo verifico que el .ics que genero cumple lo básico del formato
// iCalendar: estructura, un evento por tarea, escapes y UID estable.
// ============================================================

import { describe, it, expect } from 'vitest';
import { generarIcs } from './ics';
import type { Tarea } from '../types';

function tarea(over: Partial<Tarea> = {}): Tarea {
  return {
    id: 1,
    titulo: 'Ensayo',
    descripcion: null,
    fechaEntrega: '2026-09-01T14:00:00.000Z',
    estado: 'PENDIENTE',
    prioridad: 'ALTA',
    materiaId: 2,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    materia: { id: 2, nombre: 'Historia', color: '#ff0000' },
    ...over,
  };
}

describe('generarIcs', () => {
  it('tiene la envoltura VCALENDAR', () => {
    const ics = generarIcs([tarea()]);
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('VERSION:2.0');
  });

  it('usa saltos de línea CRLF', () => {
    expect(generarIcs([tarea()])).toContain('\r\n');
  });

  it('crea un VEVENT por tarea', () => {
    const ics = generarIcs([tarea({ id: 1 }), tarea({ id: 2 })]);
    const eventos = ics.match(/BEGIN:VEVENT/g) ?? [];
    expect(eventos).toHaveLength(2);
  });

  it('el UID es estable por id de tarea', () => {
    expect(generarIcs([tarea({ id: 42 })])).toContain('UID:tarea-42@academix');
  });

  it('escapa las comas y los puntos y coma del título', () => {
    const ics = generarIcs([tarea({ titulo: 'Parte 1, 2; y 3' })]);
    expect(ics).toContain('SUMMARY:Parte 1\\, 2\\; y 3 (Historia)');
  });

  it('incluye un recordatorio (VALARM) un día antes', () => {
    const ics = generarIcs([tarea()]);
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-P1D');
  });

  it('convierte las fechas a UTC con Z', () => {
    const ics = generarIcs([tarea()]);
    expect(ics).toContain('DTEND:20260901T140000Z');
  });

  it('funciona con lista vacía', () => {
    const ics = generarIcs([]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
