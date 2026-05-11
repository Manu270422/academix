// ============================================================
// COMPONENTE: EDITARNOMBREFORM
// ============================================================
// Formulario para editar el nombre del usuario.
// Cuando el cambio es exitoso, actualizo el AuthContext para que
// el nuevo nombre se vea inmediatamente en la sidebar.
// ============================================================

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import * as authService from '../../api/auth.service';

interface EditarNombreValues extends Record<string, unknown> {
  nombre: string;
}

export function EditarNombreForm() {
  const { usuario, updateUserData } = useAuth();
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorBackend, setErrorBackend] = useState<string | null>(null);

  const form = useForm<EditarNombreValues>({
    initialValues: {
      nombre: usuario?.nombre ?? '',
    },
    validationRules: {
      nombre: (value) => {
        const v = String(value).trim();
        if (!v) return 'El nombre es obligatorio';
        if (v.length < 2) return 'Debe tener al menos 2 caracteres';
        if (v.length > 100) return 'Es demasiado largo';
        return null;
      },
    },
    onSubmit: async (values) => {
      setMensajeExito(null);
      setErrorBackend(null);

      try {
        const usuarioActualizado = await authService.updateProfile({
          nombre: String(values.nombre).trim(),
        });

        // Actualizo el contexto para que la sidebar y demas componentes
        // muestren el nuevo nombre sin tener que recargar la página.
        updateUserData(usuarioActualizado);

        setMensajeExito('Nombre actualizado correctamente');

        // Hago que el mensaje desaparezca despues de 3 segundos.
        setTimeout(() => setMensajeExito(null), 3000);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            (error.response?.data as { message?: string })?.message ??
            'No se pudo actualizar el nombre.';
          setErrorBackend(message);
        } else {
          setErrorBackend('Ocurrio un error inesperado.');
        }
      }
    },
  });

  // Detecto si el nombre cambio respecto al original.
  // Asi puedo deshabilitar el boton si no hay nada que guardar.
  const sinCambios =
    String(form.values.nombre).trim() === (usuario?.nombre ?? '');

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}
      {errorBackend && <Alert variant="error">{errorBackend}</Alert>}

      <Input
        label="Nombre completo"
        name="nombre"
        type="text"
        value={form.values.nombre}
        onChange={form.handleChange}
        error={form.errors.nombre}
        maxLength={100}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={form.isSubmitting}
          disabled={sinCambios || form.isSubmitting}
        >
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}