// ============================================================
// COMPONENTE: SIDEBAR (BARRA LATERAL)
// ============================================================
// Es la barra lateral fija que aparece a la izquierda en escritorio.
// En móvil se convierte en un panel deslizante que se abre y cierra.
//
// Contiene:
//   - Logo/branding de Academix.
//   - Navegación principal (Dashboard, Materias, Tareas, Perfil).
//   - Info del usuario logueado.
//   - Links legales (privacidad/terminos).
//   - Botón de cerrar sesión.
// ============================================================

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BotonTema } from '../ui/BotonTema';
import { BotonInstalarApp } from '../ui/BotonInstalarApp';

interface SidebarProps {
  // Estas props son solo para el modo móvil:
  // permiten cerrar la sidebar al hacer click en un link o en el overlay.
  isOpen: boolean;
  onClose: () => void;
}

// Defino los items del menú en un array para no repetir código.
// Si manana quiero anadir una pagina mas, solo anado un objeto aqui.
// El "icon" lo defino como una función que devuelve JSX para mantener todo unificado.
const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
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
          d="M2.25 12 12 2.25 21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    path: '/calendario',
    label: 'Calendario',
    icon: (
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
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
        />
      </svg>
    ),
  },
  {
    path: '/materias',
    label: 'Materias',
    icon: (
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
    ),
  },
  {
    path: '/tareas',
    label: 'Tareas',
    icon: (
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
    ),
  },
  {
    path: '/estadisticas',
    label: 'Estadísticas',
    icon: (
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
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
  {
    path: '/papelera',
    label: 'Papelera',
    icon: (
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
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    ),
  },
  {
    path: '/perfil',
    label: 'Mi perfil',
    icon: (
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
          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { usuario, logout } = useAuth();

  // Saco las iniciales del nombre para el avatar.
  // Ej: "Carlos Manuel Turizo" -> "CT"
  const iniciales = usuario?.nombre
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('') ?? '?';

  return (
    <>
      {/* OVERLAY OSCURO (solo en móvil cuando la sidebar esta abierta).
          Si hago click aqui, se cierra la sidebar.
          En escritorio (lg+) lo oculto siempre. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR PROPIAMENTE DICHA.
          Lógica de visibilidad:
          - En escritorio (lg+): siempre visible, posición sticky.
          - En móvil: se desliza desde la izquierda usando "translate-x".
            Cuando isOpen es false, esta fuera de pantalla con -translate-x-full. */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex w-64 flex-col bg-white dark:bg-gray-900 shadow-xl
          transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 dark:lg:border-gray-800
        `}
      >
        {/* CABECERA: logo de Academix */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6">
          <h1 className="text-xl font-bold text-brand-700">Academix</h1>

          {/* Botón para cerrar en móvil. En desktop esta oculto. */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 lg:hidden"
            aria-label="Cerrar menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* NAVEGACION PRINCIPAL.
            Uso NavLink de react-router para que detecte automáticamente
            la ruta activa y le aplique estilos diferentes. */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose} // cierra el menú en móvil al navegar
                  // El segundo argumento de className en NavLink recibe { isActive }.
                  // Asi puedo aplicar estilos distintos al item de la página actual.
                  className={({ isActive }) => `
                    flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
                    transition-colors
                    ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* PIE: info del usuario, links legales y botón cerrar sesión */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          {/* Tarjeta del usuario con avatar de iniciales */}
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {iniciales}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {usuario?.nombre}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {usuario?.email}
              </p>
            </div>
          </div>

          {/* Instalar como app (solo aparece si el navegador lo ofrece) */}
          <BotonInstalarApp />

          {/* Selector de tema (claro / oscuro / sistema) */}
          <div className="mb-2">
            <BotonTema />
          </div>

          {/* Botón de logout */}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
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
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>
            Cerrar sesión
          </button>

          {/* Links legales, discretos, debajo del boton de logout */}
          <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
            <NavLink to="/privacidad" className="hover:underline">
              Privacidad
            </NavLink>
            {' · '}
            <NavLink to="/terminos" className="hover:underline">
              Términos
            </NavLink>
          </p>
        </div>
      </aside>
    </>
  );
}