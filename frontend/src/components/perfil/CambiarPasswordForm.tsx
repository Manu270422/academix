// ============================================================
// COMPONENTE: CAMBIARPASSWORDFORM
// ============================================================
// Formulario para cambiar la contraseña.
// Pide la contraseña actual por seguridad.
// Las reglas de validación coinciden con las del backend.
// ============================================================

import { useState } from 'react';
import axios from 'axios';
import { useForm } from '../../hooks/useForm';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import * as authService from '../../api/auth.service';

interface CambiarPasswordValues extends Record<string, unknown> {
  passwordActual: string;
  passwordNueva: string;
  confirmarNueva: string;
}

export function CambiarPasswordForm() {
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorBackend, setErrorBackend] = useState<string | null>(null);

  const form = useForm<CambiarPasswordValues>({
    initialValues: {
      passwordActual: '',
      passwordNueva: '',
      confirmarNueva: '',
    },
    validationRules: {
      passwordActual: (value) => {
        if (!String(value)) return 'La contraseña actual es obligatoria';
        return null;
      },
      passwordNueva: (value) => {
        const v = String(value);
        if (!v) return 'La nueva contraseña es obligatoria';
        if (v.length < 8) return 'Debe tener al menos 8 caracteres';
        if (v.length > 64) return 'No puede tener mas de 64 caracteres';
        if (!/[A-Z]/.test(v)) return 'Debe contener al menos una mayúscula';
        if (!/[a-z]/.test(v)) return 'Debe contener al menos una minúscula';
        if (!/[0-9]/.test(v)) return 'Debe contener al menos un número';
        return null;
      },
      confirmarNueva: (value, values) => {
        const v = String(value);
        if (!v) return 'Confirma la nueva contraseña';
        if (v !== values.passwordNueva) return 'Las contraseñas no coinciden';
        return null;
      },
    },
    onSubmit: async (values) => {
      setMensajeExito(null);
      setErrorBackend(null);

      try {
        await authService.changePassword({
          passwordActual: String(values.passwordActual),
          passwordNueva: String(values.passwordNueva),
        });

        setMensajeExito('Contraseña cambiada correctamente');
        form.reset();

        // El mensaje desaparece despues de 4 segundos.
        setTimeout(() => setMensajeExito(null), 4000);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Caso especial: 401 = contraseña actual incorrecta.
          // Pongo el error directamente en el campo correspondiente.
          if (error.response?.status === 401) {
            form.setFieldError(
              'passwordActual',
              'La contraseña actual no es correcta'
            );
            return;
          }

          const message =
            (error.response?.data as { message?: string })?.message ??
            'No se pudo cambiar la contraseña.';
          setErrorBackend(message);
        } else {
          setErrorBackend('Ocurrio un error inesperado.');
        }
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}
      {errorBackend && <Alert variant="error">{errorBackend}</Alert>}

      <Input
        label="Contraseña actual"
        name="passwordActual"
        type="password"
        autoComplete="current-password"
        placeholder="Tu contraseña actual"
        value={form.values.passwordActual}
        onChange={form.handleChange}
        error={form.errors.passwordActual}
        showPasswordToggle
      />

      <Input
        label="Nueva contraseña"
        name="passwordNueva"
        type="password"
        autoComplete="new-password"
        placeholder="mínimo 8 caracteres"
        value={form.values.passwordNueva}
        onChange={form.handleChange}
        error={form.errors.passwordNueva}
        showPasswordToggle
      />

      <Input
        label="Confirmar nueva contraseña"
        name="confirmarNueva"
        type="password"
        autoComplete="new-password"
        placeholder="Repite la nueva contraseña"
        value={form.values.confirmarNueva}
        onChange={form.handleChange}
        error={form.errors.confirmarNueva}
        showPasswordToggle
      />

      <div className="flex justify-end">
        <Button type="submit" isLoading={form.isSubmitting}>
          Cambiar contraseña
        </Button>
      </div>
    </form>
  );
}