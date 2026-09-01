// ============================================================
// COMPONENTE: ERRORBOUNDARY
// ============================================================
// React solo permite capturar errores de render con un componente
// de CLASE (no hay hook equivalente todavía). Sin esto, cualquier
// error dentro de un componente deja la pantalla EN BLANCO.
//
// Yo envuelvo toda la app con este boundary: si algo revienta,
// muestro una pantalla amable con un botón para recargar, en vez
// del vacío blanco.
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hayError: boolean;
  mensaje: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hayError: false, mensaje: '' };

  // React llama a esto cuando un hijo lanza un error al renderizar.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hayError: true, mensaje: error.message };
  }

  // Aquí podría enviar el error a un servicio de monitoreo (Sentry,
  // etc.). Por ahora solo lo dejo en la consola para depurar.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  private recargar = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hayError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
        <div className="text-5xl" aria-hidden="true">
          😵‍💫
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          Algo salió mal
        </h1>
        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
          Ocurrió un error inesperado en la aplicación. Recarga la página; si
          vuelve a pasar, cierra sesión y entra de nuevo.
        </p>

        {import.meta.env.DEV && this.state.mensaje && (
          <pre className="mt-4 max-w-md overflow-x-auto rounded-md bg-gray-100 p-3 text-left text-xs text-red-700 dark:bg-gray-900 dark:text-red-300">
            {this.state.mensaje}
          </pre>
        )}

        <button
          type="button"
          onClick={this.recargar}
          className="mt-6 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Recargar la página
        </button>
      </div>
    );
  }
}
