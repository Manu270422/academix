// ============================================================
// PAGINA: PERFIL DEL USUARIO
// ============================================================
// Permite al usuario:
//   - Ver su información (id, email, fecha de creacion).
//   - Editar su nombre.
//   - Cambiar su contraseña.
// ============================================================

import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { EditarNombreForm } from '../components/perfil/EditarNombreForm';
import { CambiarPasswordForm } from '../components/perfil/CambiarPasswordForm';

export function PerfilPage() {
  const { usuario } = useAuth();

  // Saco las iniciales del nombre para el avatar grande.
  const iniciales =
    usuario?.nombre
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') ?? '?';

  return (
    <AppLayout>
      {/* Cabecera */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Mi perfil
        </h2>
        <p className="mt-1 text-gray-600">
          Gestiona tu información personal y tu seguridad.
        </p>
      </div>

      {/* Tarjeta principal con avatar e info de solo lectura */}
      <div className="mb-6 max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Avatar grande con iniciales */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">
            {iniciales}
          </div>

          {/* Info de solo lectura */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-semibold text-gray-900">
              {usuario?.nombre}
            </h3>
            <p className="truncate text-sm text-gray-600">{usuario?.email}</p>
            <p className="mt-1 text-xs text-gray-500">
              Cuenta creada el{' '}
              {usuario &&
                new Date(usuario.createdAt).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de formularios */}
      <div className="grid max-w-3xl grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editar nombre */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            Información personal
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Actualiza tu nombre. El email no se puede modificar.
          </p>
          <EditarNombreForm />
        </div>

        {/* Cambiar contraseña */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            Seguridad
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Cambia tu contraseña. Por seguridad, requerimos la actual.
          </p>
          <CambiarPasswordForm />
        </div>
      </div>
    </AppLayout>
  );
}