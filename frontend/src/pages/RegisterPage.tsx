// ============================================================
// PAGINA: REGISTRO DE USUARIO
// ============================================================
// Cumple con la HU01 (registro de usuarios).
// Las reglas de validación COINCIDEN con las del backend (Modulo 3 con Zod).
// Asi el usuario ve errores instantáneos sin esperar al servidor.
// ============================================================

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { BotonGoogle } from '../components/auth/BotonGoogle';

interface RegisterFormValues extends Record<string, unknown> {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
}

export function RegisterPage() {
  const { register, loginConGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [errorBackend, setErrorBackend] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    initialValues: {
      nombre: '',
      email: '',
      password: '',
      confirmarPassword: '',
    },
    validationRules: {
      // Validador del nombre: entre 2 y 100 caracteres.
      nombre: (value) => {
        const v = String(value).trim();
        if (!v) return 'El nombre es obligatorio';
        if (v.length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (v.length > 100) return 'El nombre es demasiado largo';
        return null;
      },

      // Validador del email.
      email: (value) => {
        const v = String(value).trim();
        if (!v) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          return 'El formato del email no es valido';
        }
        if (v.length > 150) return 'El email es demasiado largo';
        return null;
      },

      // Validador del password: mismas reglas que el backend.
      // Esto es importante para que el frontend y el backend esten sincronizados.
      password: (value) => {
        const v = String(value);
        if (!v) return 'La contrasena es obligatoria';
        if (v.length < 8) return 'Debe tener al menos 8 caracteres';
        if (v.length > 64) return 'No puede tener mas de 64 caracteres';
        if (!/[A-Z]/.test(v)) return 'Debe contener al menos una mayuscula';
        if (!/[a-z]/.test(v)) return 'Debe contener al menos una minuscula';
        if (!/[0-9]/.test(v)) return 'Debe contener al menos un numero';
        return null;
      },

      // Confirmación: debe coincidir con el password.
      // Aqui uso el segundo argumento (values) para acceder a otros campos.
      confirmarPassword: (value, values) => {
        const v = String(value);
        if (!v) return 'Confirma tu contraseña';
        if (v !== values.password) return 'Las contraseñas no coinciden';
        return null;
      },
    },
    onSubmit: async (values) => {
      setErrorBackend(null);

      try {
        await register({
          nombre: String(values.nombre).trim(),
          email: String(values.email).trim().toLowerCase(),
          password: String(values.password),
        });

        // Registro exitoso: el usuario queda autenticado automáticamente.
        navigate('/dashboard', { replace: true });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Caso especial: 409 = email ya registrado.
          // Pongo el error directamente en el campo de email para mejor UX.
          if (error.response?.status === 409) {
            form.setFieldError('email', 'Este email ya esta registrado');
            return;
          }

          // Otros errores: los muestro como alerta general.
          const message =
            (error.response?.data as { message?: string })?.message ??
            'No se pudo crear la cuenta. Intenta de nuevo.';
          setErrorBackend(message);
        } else {
          setErrorBackend('Ocurrió un error inesperado.');
        }
      }
    },
  });

  // Con Google, "registrarse" e "iniciar sesión" son la misma acción:
  // si el correo no existe, el backend crea la cuenta automaticamente.
  async function manejarCredentialGoogle(credential: string): Promise<void> {
    setErrorBackend(null);
    try {
      await loginConGoogle(credential);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { message?: string })?.message ??
          'No se pudo continuar con Google.';
        setErrorBackend(message);
      } else {
        setErrorBackend('Ocurrió un error inesperado con Google.');
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-brand-700">Academix</h1>
          <p className="mt-2 text-gray-600">Crea tu cuenta gratis</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md sm:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            Crear cuenta
          </h2>

          {errorBackend && (
            <div className="mb-4">
              <Alert variant="error">{errorBackend}</Alert>
            </div>
          )}

          {/* Boton de Google, arriba del formulario tradicional. */}
          <div className="mb-4">
            <BotonGoogle onCredential={manejarCredentialGoogle} />
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">o con tu correo</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Nombre completo"
              name="nombre"
              type="text"
              autoComplete="name"
              placeholder="Carlos Manuel Turizo Hernández"
              value={form.values.nombre}
              onChange={form.handleChange}
              error={form.errors.nombre}
              autoFocus
            />

            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={form.values.email}
              onChange={form.handleChange}
              error={form.errors.email}
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={form.values.password}
              onChange={form.handleChange}
              error={form.errors.password}
              showPasswordToggle
            />

            <Input
              label="Confirmar contraseña"
              name="confirmarPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={form.values.confirmarPassword}
              onChange={form.handleChange}
              error={form.errors.confirmarPassword}
              showPasswordToggle
            />

            <Button
              type="submit"
              size="lg"
              isLoading={form.isSubmitting}
              className="w-full"
            >
              {form.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Inicia sesión aqui
            </Link>
          </p>
        </div>

        {/* Footer con el creador y los links legales */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Academix - Carlos Manuel Turizo Hernández - SENA ADSO
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          <Link to="/privacidad" className="hover:underline">
            Política de Privacidad
          </Link>
          {' · '}
          <Link to="/terminos" className="hover:underline">
            Términos de Servicio
          </Link>
        </p>
      </div>
    </div>
  );
}