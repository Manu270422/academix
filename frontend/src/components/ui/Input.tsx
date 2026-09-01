// ============================================================
// COMPONENTE: INPUT
// ============================================================
// Input reutilizable con etiqueta, mensaje de error y soporte para
// mostrar/ocultar contraseña.
//
// Lo voy a usar en TODOS los formularios de la app: login, registro,
// crear materia, crear tarea, editar perfil, etc. Por eso vale la pena
// hacerlo bien una sola vez.
// ============================================================

import { forwardRef, useState, type InputHTMLAttributes } from 'react';

// Defino las props del componente.
// Heredo todas las props HTML estándar de un input (placeholder, type, etc.)
// y anado las mias propias (label, error, etc.).
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  // Si es true, muestro el icono de "ojo" para alternar visibilidad.
  // Solo tiene sentido cuando type="password".
  showPasswordToggle?: boolean;
}

// Uso forwardRef para que el componente padre pueda hacer focus en este input.
// Esto será útil cuando quiera enfocar automáticamente el primer campo
// de un formulario al abrirse.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, showPasswordToggle = false, type = 'text', id, ...rest },
  ref
) {
  // Estado local para alternar entre password (oculto) y text (visible).
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Calculo el type real del input.
  // Si es un campo de password con toggle activado y el usuario clickeo
  // el ojo, muestro el password en texto plano.
  const inputType =
    showPasswordToggle && type === 'password' && mostrarPassword
      ? 'text'
      : type;

  // Genero un id automatico si no me pasaron uno.
  // El id es necesario para asociar el label con el input (accesibilidad).
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="w-full">
      {/* Label clicable: al hacer click, enfoca el input. */}
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>

      {/* Wrapper relativo para poder posicionar el icono del ojo encima. */}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          // Clases condicionales: si hay error, borde rojo; si no, borde gris.
          // El "transition" hace que el cambio sea suave.
          className={`
            w-full rounded-md border px-3 py-2 text-sm
            transition focus:outline-none focus:ring-2
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-200'
            }
            ${showPasswordToggle ? 'pr-10' : ''}
          `}
          {...rest}
        />

        {/* Boton "ojo" para mostrar/ocultar password.
            Solo aparece si showPasswordToggle es true. */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setMostrarPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            // Aria-label para lectores de pantalla.
            aria-label={
              mostrarPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'
            }
          >
            {/* Iconos en SVG inline para no depender de librerías externas. */}
            {mostrarPassword ? (
              // Icono de ojo tachado
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
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              // Icono de ojo abierto
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
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Mensaje de error: solo aparece si hay error.
          Tiene un id para asociarlo al input via aria-describedby. */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});