// ============================================================
// PÁGINA: INICIO DE SESIÓN
// ============================================================
// Cumple con la HU02 (inicio de sesión seguro).
// Si el usuario ya esta logueado y entra aqui, lo mando al dashboard.
// Si no esta logueado, le muestro el formulario.
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

interface LoginFormValues extends Record<string, unknown> {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login, loginConGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Estado para errores generales del backend (ej: credenciales invalidas).
  // Lo manejo aparte del useForm porque no es de un campo especÍfico.
  const [errorBackend, setErrorBackend] = useState<string | null>(null);

  // Configuro el formulario con sus validaciones y la funciÓn de submit.
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: {
      // Validador del email: que no este vacÍo y tenga formato valido.
      email: (value) => {
        const v = String(value).trim();
        if (!v) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          return 'El formato del email no es valido';
        }
        return null;
      },
      // Validador del password: que no este vacio.
      // No valido fuerza aqui porque en login solo verifico identidad.
      password: (value) => {
        if (!String(value)) return 'La contrasena es obligatoria';
        return null;
      },
    },
    // Esta funciÓn se ejecuta cuando el formulario es valido.
    onSubmit: async (values) => {
      // Limpio errores anteriores del backend.
      setErrorBackend(null);

      try {
        await login({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });

        // Si el login fue exitoso, redirijo al dashboard.
        navigate('/dashboard', { replace: true });
      } catch (error) {
        // Si el backend respondió con un error, lo muestro al usuario.
        // axios.isAxiosError me ayuda a tipar el error correctamente.
        if (axios.isAxiosError(error)) {
          const message =
            (error.response?.data as { message?: string })?.message ??
            'No se pudo iniciar sesión. Intenta de nuevo.';
          setErrorBackend(message);
        } else {
          setErrorBackend('Ocurrió un error inesperado.');
        }
      }
    },
  });

  // Uso el mismo manejo de errores que el login normal, pero para
  // cuando el estudiante entra con el boton de Google.
  async function manejarCredentialGoogle(credential: string): Promise<void> {
    setErrorBackend(null);
    try {
      await loginConGoogle(credential);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { message?: string })?.message ??
          'No se pudo iniciar sesión con Google.';
        setErrorBackend(message);
      } else {
        setErrorBackend('Ocurrió un error inesperado con Google.');
      }
    }
  }

  // Si la app aun esta verificando si hay sesion, muestro un loader.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  // Si ya esta logueado, no tiene sentido mostrar login: lo mando al dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4 py-8">
      <div className="w-full max-w-md">
        {/* Encabezado con el branding */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-brand-700">Academix</h1>
          <p className="mt-2 text-gray-600">Tu gestor académico personal</p>
        </div>

        {/* Caja del formulario */}
        <div className="rounded-lg bg-white p-6 shadow-md sm:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            Iniciar sesión
          </h2>

          {/* Si hay un error del backend, lo muestro arriba del form. */}
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
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={form.values.email}
              onChange={form.handleChange}
              error={form.errors.email}
              autoFocus
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={form.values.password}
              onChange={form.handleChange}
              error={form.errors.password}
              showPasswordToggle
            />

            <Button
              type="submit"
              size="lg"
              isLoading={form.isSubmitting}
              className="w-full"
            >
              {form.isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          {/* Link al registro para usuarios nuevos */}
          <p className="mt-6 text-center text-sm text-gray-600">
            No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Registrate aquí
            </Link>
          </p>
        </div>

        {/* Footer con el creador */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Academix - Carlos Manuel Turizo Hernández - SENA ADSO
        </p>
      </div>
    </div>
  );
}