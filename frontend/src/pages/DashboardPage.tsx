// ============================================================
// PAGINA: DASHBOARD (CON ESTADISTICAS REALES)
// ============================================================
// Pantalla principal que ve el usuario al entrar a Academix.
// Muestra:
//   - Saludo personalizado según la hora.
//   - Tarjetas con estadísticas en vivo.
//   - Tareas próximas a vencer.
//   - Acciones rápidas para crear materia o tarea.
// ============================================================

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { ProximasTareas } from '../components/dashboard/ProximasTareas';
import { useMateriasList } from '../hooks/useMaterias';
import { useTareasList } from '../hooks/useTareas';

export function DashboardPage() {
  const { usuario } = useAuth();

  // Pido los datos al backend.
  // React Query los tiene cacheados, asi que si vengo de otra pagina
  // (por ejemplo después de crear una tarea) los datos están al instante.
  const { data: materias = [] } = useMateriasList();
  const { data: tareas = [] } = useTareasList();

  // ============================================================
  // CALCULO DE ESTADISTICAS
  // ============================================================
  // useMemo evita recalcular en cada render: solo recalcula cuando
  // las tareas cambian. Para listas pequeñas no importa, pero es
  // buena practica con calculos derivados.
  //
  // IMPORTANTE: 'ahora' vive DENTRO del memo para que no sea una
  // dependencia externa. Si lo pusiera afuera, cambiaria en cada
  // render (new Date() siempre es un valor nuevo) y el memo nunca
  // serviria de nada porque sus deps cambiarían constantemente.
  const stats = useMemo(() => {
    const ahora = new Date().getTime();
    const total = tareas.length;
    const pendientes = tareas.filter((t) => t.estado === 'PENDIENTE').length;
    const enProgreso = tareas.filter((t) => t.estado === 'EN_PROGRESO').length;
    const completadas = tareas.filter((t) => t.estado === 'COMPLETADA').length;

    // Tareas vencidas: fecha pasada Y no completadas.
    const vencidas = tareas.filter(
      (t) =>
        t.estado !== 'COMPLETADA' &&
        new Date(t.fechaEntrega).getTime() < ahora
    ).length;

    return {
      totalMaterias: materias.length,
      total,
      pendientes,
      enProgreso,
      completadas,
      vencidas,
    };
  }, [materias, tareas]); // Solo se recalcula si cambian las listas

  // Saludo según la hora del dia.
  const hora = new Date().getHours();
  let saludo = 'Buenas noches';
  if (hora >= 5 && hora < 12) saludo = 'Buenos dias';
  else if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';

  // Primer nombre del usuario para el saludo.
  const primerNombre = usuario?.nombre?.split(' ')[0] ?? 'estudiante';

  return (
    <AppLayout>
      {/* Cabecera con saludo */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {saludo}, {primerNombre} 👋
        </h2>
        <p className="mt-1 text-gray-600">
          Aqui tienes un resumen de tu actividad académica.
        </p>
      </div>

      {/* Alerta de tareas vencidas (solo si hay) */}
      {stats.vencidas > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5 shrink-0 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Tienes {stats.vencidas}{' '}
                {stats.vencidas === 1 ? 'tarea vencida' : 'tareas vencidas'}
              </p>
              <p className="mt-0.5 text-sm text-red-700">
                Revisa tus tareas y actualiza su estado.{' '}
                <Link
                  to="/tareas"
                  className="font-medium underline hover:no-underline"
                >
                  Ver tareas
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Materias"
          value={stats.totalMaterias}
          variant="info"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          }
        />
        <StatCard
          label="Total tareas"
          value={stats.total}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
              />
            </svg>
          }
        />
        <StatCard
          label="Pendientes"
          value={stats.pendientes}
          variant="warning"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
        <StatCard
          label="En progreso"
          value={stats.enProgreso}
          variant="info"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          }
        />
        <StatCard
          label="Completadas"
          value={stats.completadas}
          variant="success"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
      </div>

      {/* Grid principal: proximas tareas + acciones rapidas */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Próximas tareas (ocupa 2 columnas en desktop) */}
        <div className="lg:col-span-2">
          <ProximasTareas tareas={tareas} />
        </div>

        {/* Acciones rápidas */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3">
            <h3 className="text-base font-semibold text-gray-900">
              Acciones rápidas
            </h3>
          </div>
          <div className="space-y-2 p-4">
            <Link
              to="/materias"
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Nueva materia
                </p>
                <p className="text-xs text-gray-600">
                  Crea una nueva asignatura
                </p>
              </div>
            </Link>

            <Link
              to="/tareas"
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Nueva tarea
                </p>
                <p className="text-xs text-gray-600">
                  Registra una nueva actividad
                </p>
              </div>
            </Link>

            <Link
              to="/perfil"
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Mi perfil
                </p>
                <p className="text-xs text-gray-600">
                  Edita tu información
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}