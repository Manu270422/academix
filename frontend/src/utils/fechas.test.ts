// ============================================================
// TESTS: utils/fechas
// ============================================================
// Yo pruebo las funciones de fechas porque son puras (mismo input,
// mismo output) y porque un error aquí se ve en TODA la app
// (dashboard, calendario, tarjetas de tarea...).
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  formatearFechaEntrega,
  inicioDeSemana,
  mismoDia,
  soloHora,
  rangoSemana,
} from './fechas';

// Helper: una fecha ISO a N días desde hoy, fijada al mediodía local
// para que el test no sea sensible a la hora a la que se ejecuta
// (cerca de medianoche, "+2h" podía saltar de día).
function enDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

describe('formatearFechaEntrega', () => {
  it('marca como vencida una fecha pasada', () => {
    const r = formatearFechaEntrega(enDias(-3));
    expect(r.estaVencida).toBe(true);
    expect(r.esUrgente).toBe(false);
    expect(r.texto).toMatch(/venció/i);
  });

  it('reconoce "hoy" como urgente', () => {
    const r = formatearFechaEntrega(enDias(0));
    expect(r.texto.toLowerCase()).toContain('hoy');
    expect(r.esUrgente).toBe(true);
    expect(r.estaVencida).toBe(false);
  });

  it('reconoce "mañana" como urgente', () => {
    const r = formatearFechaEntrega(enDias(1));
    expect(r.texto.toLowerCase()).toContain('mañana');
    expect(r.esUrgente).toBe(true);
  });

  it('dice "en X días" dentro de la próxima semana', () => {
    const r = formatearFechaEntrega(enDias(4));
    expect(r.texto).toMatch(/en \d+ días/);
    expect(r.esUrgente).toBe(false);
    expect(r.estaVencida).toBe(false);
  });

  it('usa fecha larga a más de 7 días', () => {
    const r = formatearFechaEntrega(enDias(20));
    expect(r.texto).toMatch(/Vence el /);
  });
});

describe('inicioDeSemana', () => {
  it('devuelve siempre un lunes a medianoche', () => {
    // Un miércoles cualquiera.
    const miercoles = new Date('2026-08-26T15:30:00');
    const lunes = inicioDeSemana(miercoles);
    expect(lunes.getDay()).toBe(1); // 1 = lunes
    expect(lunes.getHours()).toBe(0);
    expect(lunes.getDate()).toBe(24); // lunes 24 de agosto 2026
  });

  it('trata el domingo como fin de semana, no como inicio', () => {
    const domingo = new Date('2026-08-30T10:00:00');
    const lunes = inicioDeSemana(domingo);
    expect(lunes.getDate()).toBe(24); // el lunes anterior
  });

  it('el offset mueve semanas completas', () => {
    const base = new Date('2026-08-26T00:00:00');
    const semanaSiguiente = inicioDeSemana(base, 1);
    expect(semanaSiguiente.getDate()).toBe(31);
  });
});

describe('mismoDia', () => {
  it('true para la misma fecha con distinta hora', () => {
    expect(
      mismoDia(new Date('2026-08-26T01:00'), new Date('2026-08-26T23:00'))
    ).toBe(true);
  });
  it('false para días distintos', () => {
    expect(
      mismoDia(new Date('2026-08-26T23:59'), new Date('2026-08-27T00:01'))
    ).toBe(false);
  });
});

describe('soloHora', () => {
  it('devuelve HH:MM en 24h', () => {
    // Uso una fecha local para evitar líos de zona horaria.
    const d = new Date(2026, 7, 26, 9, 5);
    expect(soloHora(d.toISOString())).toMatch(/^0?9:05$/);
  });
});

describe('rangoSemana', () => {
  it('muestra el rango lunes-domingo', () => {
    const texto = rangoSemana(new Date('2026-08-24T00:00:00'));
    expect(texto).toMatch(/24/);
    expect(texto).toMatch(/30/);
  });
});
