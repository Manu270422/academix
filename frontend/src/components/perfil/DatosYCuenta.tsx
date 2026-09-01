// ============================================================
// COMPONENTE: DATOSYCUENTA
// ============================================================
// Dos acciones sobre la cuenta:
//   1. Descargar todos mis datos como un archivo .json (portabilidad
//      / respaldo).
//   2. Eliminar la cuenta y TODO lo asociado. Irreversible, con doble
//      confirmación (escribir "ELIMINAR" + contraseña si la cuenta
//      la usa).
// ============================================================

import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { exportarMisDatos, eliminarMiCuenta } from '../../api/auth.service';

export function DatosYCuenta() {
  const { logout } = useAuth();

  // --- Descargar datos ---
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  async function handleDescargar() {
    setDescargando(true);
    setErrorDescarga(null);
    try {
      const datos = await exportarMisDatos();
      const blob = new Blob([JSON.stringify(datos, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'academix-mis-datos.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setErrorDescarga('No se pudieron descargar tus datos. Intenta de nuevo.');
    } finally {
      setDescargando(false);
    }
  }

  // --- Eliminar cuenta ---
  const [abierto, setAbierto] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [password, setPassword] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const puedeEliminar = confirmacion === 'ELIMINAR' && !eliminando;

  async function handleEliminar(e: FormEvent) {
    e.preventDefault();
    if (confirmacion !== 'ELIMINAR') return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await eliminarMiCuenta({
        confirmacion: 'ELIMINAR',
        password: password || undefined,
      });
      // Cuenta borrada: cierro sesión. ProtectedRoute redirige al login.
      logout();
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ??
          'No se pudo eliminar la cuenta.'
        : 'Ocurrió un error inesperado.';
      setErrorEliminar(msg);
      setEliminando(false);
    }
  }

  return (
    <div className="mt-6 max-w-3xl space-y-6">
      {/* Descargar mis datos */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Mis datos
        </h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Descarga una copia de todo lo que Academix guarda de ti: perfil,
          materias, apuntes, tareas y subtareas, en un archivo <code>.json</code>.
        </p>
        <button
          type="button"
          onClick={handleDescargar}
          disabled={descargando}
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {descargando ? 'Preparando...' : 'Descargar mis datos'}
        </button>
        {errorDescarga && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errorDescarga}
          </p>
        )}
      </div>

      {/* Zona de peligro */}
      <div className="rounded-lg border border-red-200 bg-red-50/50 p-6 dark:border-red-500/30 dark:bg-red-500/5">
        <h3 className="mb-1 text-lg font-semibold text-red-800 dark:text-red-300">
          Eliminar mi cuenta
        </h3>
        <p className="mb-4 text-sm text-red-700 dark:text-red-300/80">
          Se borrarán tu cuenta y <strong>todos</strong> tus datos (materias,
          tareas, apuntes, recordatorios). Esta acción <strong>no se puede
          deshacer</strong>.
        </p>

        {!abierto ? (
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Eliminar mi cuenta
          </button>
        ) : (
          <form onSubmit={handleEliminar} className="space-y-3">
            <div>
              <label
                htmlFor="confirmacion"
                className="mb-1 block text-sm font-medium text-red-800 dark:text-red-300"
              >
                Escribe <span className="font-mono">ELIMINAR</span> para confirmar
              </label>
              <input
                id="confirmacion"
                type="text"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                autoComplete="off"
                className="w-full max-w-xs rounded-md border border-red-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-red-500/40 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="passwordEliminar"
                className="mb-1 block text-sm font-medium text-red-800 dark:text-red-300"
              >
                Tu contraseña{' '}
                <span className="font-normal text-red-600/70 dark:text-red-300/60">
                  (si tu cuenta usa contraseña)
                </span>
              </label>
              <input
                id="passwordEliminar"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full max-w-xs rounded-md border border-red-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-red-500/40 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            {errorEliminar && (
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {errorEliminar}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAbierto(false);
                  setConfirmacion('');
                  setPassword('');
                  setErrorEliminar(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!puedeEliminar}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar definitivamente'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
