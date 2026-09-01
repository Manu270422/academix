// ============================================================
// TESTS: componente StatCard
// ============================================================
// Un test de componente sencillo para dejar montado el patrón
// (render + consultas de Testing Library) que usaré en el resto.
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('muestra la etiqueta y el valor', () => {
    render(<StatCard label="Pendientes" value={7} icon={<span>i</span>} />);
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('acepta valores de texto (ej. "—")', () => {
    render(<StatCard label="Cumplimiento" value="—" icon={<span>i</span>} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
