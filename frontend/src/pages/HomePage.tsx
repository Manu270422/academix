// ============================================================
// PAGINA DE PRUEBA - HOME
// ============================================================
// Esta página es solo para verificar que el Módulo 7 funciona.
// La voy a reemplazar en proximos módulos por el Login real.
// Por ahora muestra el estado de la sesión para confirmar que todo
// esta conectado correctamente.
// ============================================================

import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const { usuario, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-brand-700">Academix</h1>
          <p className="mt-2 text-gray-600">
            Tu gestor académico personal
          </p>
        </header>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Estado de la conexión
          </h2>

          {isAuthenticated && usuario ? (
            <div className="space-y-3">
              <p className="text-green-700">
                <span className="font-semibold">Sesión activa</span>
              </p>
              <div className="rounded bg-gray-50 p-4">
                <p>
                  <span className="font-medium">Nombre:</span> {usuario.nombre}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {usuario.email}
                </p>
                <p>
                  <span className="font-medium">ID de usuario:</span>{' '}
                  {usuario.id}
                </p>
              </div>
              <button
                onClick={logout}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-700">
                No hay una sesión activa.
              </p>
              <p className="text-sm text-gray-500">
                En el siguiente módulo crearemos las pantallas de login y
                registro. Por ahora, este es solo el cimiento del frontend.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Cimientos verificados
          </h2>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>React + TypeScript + Vite funcionando</li>
            <li>TailwindCSS aplicando estilos</li>
            <li>React Router navegando</li>
            <li>Cliente Axios listo para hablar con el backend</li>
            <li>Contexto de autenticación funcionando</li>
            <li>Refresh automático de tokens configurado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}