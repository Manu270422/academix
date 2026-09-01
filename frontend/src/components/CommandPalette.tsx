// ============================================================
// COMPONENTE: COMMANDPALETTE (buscador global · Ctrl/Cmd + K)
// ============================================================
// Un buscador que se abre en cualquier pantalla con Ctrl+K (o
// Cmd+K en Mac) y deja saltar rápido a:
//   - una materia,
//   - una tarea,
//   - una sección de la app (Dashboard, Calendario, ...).
//
// Es 100% frontend: lee las materias y tareas que React Query ya
// tiene cacheadas, no hace peticiones nuevas.
//
// Se monta UNA vez, dentro de AppLayout. También se puede abrir
// disparando el evento 'academix:open-search' (lo usa el botón de
// la cabecera).
// ============================================================

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useMateriasList } from '../hooks/useMaterias';
import { useTareasList } from '../hooks/useTareas';

// Minúsculas y sin tildes, para que "calculo" encuentre "Cálculo".
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Secciones fijas de la app.
const SECCIONES: { nombre: string; ruta: string }[] = [
  { nombre: 'Dashboard', ruta: '/dashboard' },
  { nombre: 'Calendario', ruta: '/calendario' },
  { nombre: 'Materias', ruta: '/materias' },
  { nombre: 'Tareas', ruta: '/tareas' },
  { nombre: 'Estadísticas', ruta: '/estadisticas' },
  { nombre: 'Mi perfil', ruta: '/perfil' },
];

type Resultado = {
  clave: string;
  tipo: 'Sección' | 'Materia' | 'Tarea';
  titulo: string;
  subtitulo?: string;
  color?: string | null;
  ruta: string;
};

const LIMITE = 8;

export function CommandPalette() {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: materias = [] } = useMateriasList();
  const { data: tareas = [] } = useTareasList();

  // ---- Abrir / cerrar ----
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAbierto((v) => !v);
      }
      if (e.key === 'Escape') setAbierto(false);
    }
    function onOpenEvent() {
      setAbierto(true);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('academix:open-search', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('academix:open-search', onOpenEvent);
    };
  }, []);

  // Al abrir: limpio y enfoco. Al cerrar: reseteo la selección.
  useEffect(() => {
    if (abierto) {
      setQuery('');
      setSeleccion(0);
      // Espero al render para que el input exista.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [abierto]);

  // ---- Resultados ----
  const resultados = useMemo<Resultado[]>(() => {
    const q = normalizar(query.trim());

    const secciones: Resultado[] = SECCIONES.filter(
      (s) => !q || normalizar(s.nombre).includes(q)
    ).map((s) => ({
      clave: `sec-${s.ruta}`,
      tipo: 'Sección',
      titulo: s.nombre,
      ruta: s.ruta,
    }));

    const mats: Resultado[] = materias
      .filter((m) => !q || normalizar(m.nombre).includes(q))
      .slice(0, LIMITE)
      .map((m) => ({
        clave: `mat-${m.id}`,
        tipo: 'Materia',
        titulo: m.nombre,
        subtitulo: m.descripcion ?? undefined,
        color: m.color,
        ruta: `/materias/${m.id}`,
      }));

    // Sin query no muestro tareas (serían demasiadas).
    const tars: Resultado[] = q
      ? tareas
          .filter((t) => {
            return (
              normalizar(t.titulo).includes(q) ||
              (t.descripcion ? normalizar(t.descripcion).includes(q) : false) ||
              (t.materia ? normalizar(t.materia.nombre).includes(q) : false)
            );
          })
          .slice(0, LIMITE)
          .map((t) => ({
            clave: `tar-${t.id}`,
            tipo: 'Tarea',
            titulo: t.titulo,
            subtitulo: t.materia?.nombre,
            color: t.materia?.color,
            ruta: `/materias/${t.materiaId}`,
          }))
      : [];

    return [...secciones, ...mats, ...tars];
  }, [query, materias, tareas]);

  // Mantengo la selección dentro de rango cuando cambian los resultados.
  useEffect(() => {
    setSeleccion((s) => Math.min(s, Math.max(0, resultados.length - 1)));
  }, [resultados.length]);

  function activar(r: Resultado | undefined) {
    if (!r) return;
    setAbierto(false);
    navigate(r.ruta);
  }

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSeleccion((s) => Math.min(s + 1, resultados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSeleccion((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activar(resultados[seleccion]);
    }
  }

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setAbierto(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-4 w-4 shrink-0 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSeleccion(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Buscar materias, tareas o secciones..."
            className="w-full bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
          />
        </div>

        {/* Resultados */}
        {resultados.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Sin resultados para "{query}"
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {resultados.map((r, i) => (
              <li key={r.clave}>
                <button
                  type="button"
                  onMouseEnter={() => setSeleccion(i)}
                  onClick={() => activar(r)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                    i === seleccion
                      ? 'bg-brand-50 dark:bg-brand-500/10'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        r.tipo === 'Sección'
                          ? '#9CA3AF'
                          : r.color ?? '#9CA3AF',
                    }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {r.titulo}
                    </span>
                    {r.subtitulo && (
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                        {r.subtitulo}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {r.tipo}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Pie con atajos */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
          <span>↑↓ moverse · ↵ abrir · esc cerrar</span>
          <span>Ctrl/Cmd + K</span>
        </div>
      </div>
    </div>
  );
}
