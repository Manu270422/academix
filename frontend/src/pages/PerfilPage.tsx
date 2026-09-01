// ============================================================
// PAGINA: PERFIL DEL USUARIO
// ============================================================
// Permite al usuario:
//   - Ver su información (id, email, fecha de creacion).
//   - Editar su nombre.
//   - Cambiar su contraseña.
//   - Consultar la Política de Privacidad y los Términos de Servicio.
// ============================================================

import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { EditarNombreForm } from '../components/perfil/EditarNombreForm';
import { CambiarPasswordForm } from '../components/perfil/CambiarPasswordForm';
import { DatosYCuenta } from '../components/perfil/DatosYCuenta';

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          Mi perfil
        </h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Gestiona tu información personal y tu seguridad.
        </p>
      </div>

      {/* Tarjeta principal con avatar e info de solo lectura */}
      <div className="mb-6 max-w-3xl rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Avatar grande con iniciales */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">
            {iniciales}
          </div>

          {/* Info de solo lectura */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-semibold text-gray-900 dark:text-gray-100">
              {usuario?.nombre}
            </h3>
            <p className="truncate text-sm text-gray-600 dark:text-gray-400">{usuario?.email}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Información personal
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Actualiza tu nombre. El email no se puede modificar.
          </p>
          <EditarNombreForm />
        </div>

        {/* Cambiar contraseña */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Seguridad
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Cambia tu contraseña. Por seguridad, requerimos la actual.
          </p>
          <CambiarPasswordForm />
        </div>
      </div>

      {/* Informacion legal: politica de privacidad y terminos de servicio.
          La dejo visible aqui para que el estudiante siempre pueda
          consultarla y este informado de cualquier novedad. */}
      <div className="mt-6 max-w-3xl rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Información legal
        </h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Consulta cómo protegemos tu información y las reglas de uso
          de Academix.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Link
            to="/privacidad"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Política de Privacidad
          </Link>
          <Link
            to="/terminos"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Términos de Servicio
          </Link>
        </div>
      </div>

      {/* Descargar mis datos + eliminar cuenta */}
      <DatosYCuenta />
    </AppLayout>
  );
}