// ============================================================
// TESTS: CommandPalette (buscador global)
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';

function renderPalette() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CommandPalette />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CommandPalette', () => {
  it('empieza cerrado', () => {
    renderPalette();
    expect(
      screen.queryByPlaceholderText(/buscar materias/i)
    ).not.toBeInTheDocument();
  });

  it('se abre con Ctrl+K y se cierra con Escape', () => {
    renderPalette();

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(
      screen.getByPlaceholderText(/buscar materias/i)
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(
      screen.queryByPlaceholderText(/buscar materias/i)
    ).not.toBeInTheDocument();
  });

  it('se abre con el evento academix:open-search y muestra las secciones', () => {
    renderPalette();
    fireEvent(window, new Event('academix:open-search'));

    // Sin escribir nada ya aparecen las secciones de navegación.
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Calendario')).toBeInTheDocument();
  });

  it('filtra las secciones por texto', () => {
    renderPalette();
    fireEvent(window, new Event('academix:open-search'));

    fireEvent.change(screen.getByPlaceholderText(/buscar materias/i), {
      target: { value: 'calen' },
    });

    expect(screen.getByText('Calendario')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
});
