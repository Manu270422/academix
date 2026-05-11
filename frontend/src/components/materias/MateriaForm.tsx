// ============================================================
// COMPONENTE: MATERIAFORM
// ============================================================
// Formulario para crear y editar materias.
// Es el mismo formulario para ambos casos: si recibe "materiaInicial",
// lo usa para precargar los campos (modo edicion); si no, todos vacios (creacion).
//
// Maneja:
//   - Validación (mismas reglas que el backend con Zod).
//   - Picker de color con paleta predefinida.
//   - Estado de carga durante submit.
//   - Errores generales del backend.
// ============================================================

import { useState } from 'react';
import axios from 'axios';
import { useForm } from '../../hooks/useForm';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import type { Materia } from '../../types';
import type {
  CreateMateriaPayload,
  UpdateMateriaPayload,
} from '../../api/subjects.service';

// ============================================================
// PALETA DE COLORES PREDEFINIDA
// ============================================================
// Le doy al usuario una selección curada en lugar de un input hex libre.
// 10 colores que se ven bien y son distinguibles entre si.
const COLORES_DISPONIBLES = [
  { hex: '#3B82F6', nombre: 'Azul' },
  { hex: '#10B981', nombre: 'Verde' },
  { hex: '#F59E0B', nombre: 'Amarillo' },
  { hex: '#EF4444', nombre: 'Rojo' },
  { hex: '#8B5CF6', nombre: 'Morado' },
  { hex: '#EC4899', nombre: 'Rosa' },
  { hex: '#14B8A6', nombre: 'Turquesa' },
  { hex: '#F97316', nombre: 'Naranja' },
  { hex: '#6366F1', nombre: 'Indigo' },
  { hex: '#64748B', nombre: 'Gris' },
];

interface MateriaFormValues extends Record<string, unknown> {
  nombre: string;
  descripcion: string;
}

interface MateriaFormProps {
  // Si lo paso, el form esta en modo edición. Si no, en modo creación.
  materiaInicial?: Materia;
  onSubmit: (data: CreateMateriaPayload | UpdateMateriaPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MateriaForm({
  materiaInicial,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MateriaFormProps) {
  const isEdicion = Boolean(materiaInicial);

  // El color lo manejo como estado separado del form, porque no es un
  // input HTML estandar (es un picker visual).
  const [colorSeleccionado, setColorSeleccionado] = useState<string>(
    materiaInicial?.color ?? COLORES_DISPONIBLES[0].hex
  );

  const [errorBackend, setErrorBackend] = useState<string | null>(null);

  const form = useForm<MateriaFormValues>({
    initialValues: {
      nombre: materiaInicial?.nombre ?? '',
      descripcion: materiaInicial?.descripcion ?? '',
    },
    validationRules: {
      // Mismas reglas que el backend (Modulo 5 con Zod).
      nombre: (value) => {
        const v = String(value).trim();
        if (!v) return 'El nombre es obligatorio';
        if (v.length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (v.length > 100) return 'El nombre es demasiado largo';
        return null;
      },
      descripcion: (value) => {
        const v = String(value);
        if (v.length > 500) return 'La descripcion es demasiado larga';
        return null;
      },
    },
    onSubmit: async (values) => {
      setErrorBackend(null);

      try {
        const payload: CreateMateriaPayload = {
          nombre: String(values.nombre).trim(),
          color: colorSeleccionado,
          // Si la descripción esta vacía, la mando como undefined
          // para que el backend no guarde un string vacío.
          descripcion: String(values.descripcion).trim() || undefined,
        };

        await onSubmit(payload);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            (error.response?.data as { message?: string })?.message ??
            'No se pudo guardar la materia. Intenta de nuevo.';
          setErrorBackend(message);
        } else {
          setErrorBackend('Ocurrio un error inesperado.');
        }
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      {errorBackend && <Alert variant="error">{errorBackend}</Alert>}

      <Input
        label="Nombre de la materia"
        name="nombre"
        type="text"
        placeholder="Ej: Matematicas IV"
        value={form.values.nombre}
        onChange={form.handleChange}
        error={form.errors.nombre}
        autoFocus
        maxLength={100}
      />

      {/* Picker de color: una grilla de circulos clickeables.
          El seleccionado tiene un anillo alrededor para distinguirlo. */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORES_DISPONIBLES.map((color) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => setColorSeleccionado(color.hex)}
              className={`
                h-9 w-9 rounded-full border-2 transition
                ${
                  colorSeleccionado === color.hex
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent hover:scale-105'
                }
              `}
              style={{ backgroundColor: color.hex }}
              aria-label={`Seleccionar color ${color.nombre}`}
              title={color.nombre}
            />
          ))}
        </div>
      </div>

      {/* Descripción: usa textarea en lugar de input para multilinea.
          No tengo un componente Textarea reutilizable porque solo lo uso aquí
          y en tareas. Lo armo inline. */}
      <div>
        <label
          htmlFor="descripcion"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          placeholder="Detalles, profesor, horario, etc."
          value={form.values.descripcion}
          onChange={form.handleChange}
          maxLength={500}
          className={`
            w-full rounded-md border px-3 py-2 text-sm resize-none
            transition focus:outline-none focus:ring-2
            ${
              form.errors.descripcion
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-brand-500 focus:ring-brand-200'
            }
          `}
        />
        {form.errors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{form.errors.descripcion}</p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting || form.isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting || form.isSubmitting}>
          {isEdicion ? 'Guardar cambios' : 'Crear materia'}
        </Button>
      </div>
    </form>
  );
}