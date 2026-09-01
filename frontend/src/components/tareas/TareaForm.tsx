// ============================================================
// COMPONENTE: TAREAFORM
// ============================================================
// Formulario para crear y editar tareas.
// Es mas complejo que el de materias porque tiene mas campos:
// titulo, descripcion, fecha, materia, estado, prioridad.
// ============================================================

import { useState } from 'react';
import axios from 'axios';
import type { FrecuenciaRepeticion } from '../../api/tasks.service';
import { useForm } from '../../hooks/useForm';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import {
  isoADateTimeLocal,
  dateTimeLocalAIso,
  fechaMinimaParaInput,
} from '../../utils/fechas';
import type { Tarea, Materia, EstadoTarea, Prioridad } from '../../types';
import type {
  CreateTareaPayload,
  UpdateTareaPayload,
} from '../../api/tasks.service';

interface TareaFormValues extends Record<string, unknown> {
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  materiaId: string; // viene como string del select
  estado: EstadoTarea;
  prioridad: Prioridad;
}

interface TareaFormProps {
  tareaInicial?: Tarea;
  // El form necesita la lista de materias para poblar el select.
  materias: Materia[];
  // Si llego desde una materia especifica (futuro feature), pre-selecciono.
  materiaPreseleccionada?: number;
  // Si llego desde el calendario haciendo click en un día, pre-relleno la
  // fecha. Va en formato datetime-local ("2026-09-01T09:00").
  fechaPreseleccionada?: string;
  onSubmit: (data: CreateTareaPayload | UpdateTareaPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TareaForm({
  tareaInicial,
  materias,
  materiaPreseleccionada,
  fechaPreseleccionada,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TareaFormProps) {
  const isEdicion = Boolean(tareaInicial);
  const [errorBackend, setErrorBackend] = useState<string | null>(null);

  // Repetir tarea: solo tiene sentido al CREAR. Lo manejo con estado
  // aparte del useForm porque no necesita validación propia.
  const [repetir, setRepetir] = useState(false);
  const [frecuencia, setFrecuencia] =
    useState<FrecuenciaRepeticion>('SEMANAL');
  const [repeticiones, setRepeticiones] = useState(4);

  // Construyo los valores iniciales segun si es edición o creación.
  const valoresIniciales: TareaFormValues = {
    titulo: tareaInicial?.titulo ?? '',
    descripcion: tareaInicial?.descripcion ?? '',
    fechaEntrega: tareaInicial
      ? isoADateTimeLocal(tareaInicial.fechaEntrega)
      : fechaPreseleccionada ?? '',
    materiaId: tareaInicial
      ? String(tareaInicial.materiaId)
      : materiaPreseleccionada
      ? String(materiaPreseleccionada)
      : materias[0]?.id
      ? String(materias[0].id)
      : '',
    estado: tareaInicial?.estado ?? 'PENDIENTE',
    prioridad: tareaInicial?.prioridad ?? 'MEDIA',
  };

  const form = useForm<TareaFormValues>({
    initialValues: valoresIniciales,
    validationRules: {
      titulo: (value) => {
        const v = String(value).trim();
        if (!v) return 'El titulo es obligatorio';
        if (v.length < 2) return 'Debe tener al menos 2 caracteres';
        if (v.length > 200) return 'Es demasiado largo';
        return null;
      },
      descripcion: (value) => {
        if (String(value).length > 1000) return 'Es demasiado larga';
        return null;
      },
      fechaEntrega: (value) => {
        if (!String(value)) return 'La fecha de entrega es obligatoria';
        const fecha = new Date(String(value));
        if (Number.isNaN(fecha.getTime())) return 'Fecha invalida';

        // En CREACIÓN valido que sea futura (igual que el backend).
        // En EDICIÓN lo permito porque tal vez solo cambias el titulo.
        if (!isEdicion && fecha.getTime() <= Date.now()) {
          return 'La fecha debe ser futura';
        }
        return null;
      },
      materiaId: (value) => {
        if (!String(value)) return 'Selecciona una materia';
        return null;
      },
    },
    onSubmit: async (values) => {
      setErrorBackend(null);

      try {
        // Construyo el payload segun si es creación o edición.
        if (isEdicion) {
          const payload: UpdateTareaPayload = {
            titulo: String(values.titulo).trim(),
            descripcion: String(values.descripcion).trim() || null,
            fechaEntrega: dateTimeLocalAIso(String(values.fechaEntrega)),
            estado: values.estado,
            prioridad: values.prioridad,
          };
          await onSubmit(payload);
        } else {
          const payload: CreateTareaPayload = {
            titulo: String(values.titulo).trim(),
            descripcion: String(values.descripcion).trim() || undefined,
            fechaEntrega: dateTimeLocalAIso(String(values.fechaEntrega)),
            materiaId: Number(values.materiaId),
            estado: values.estado,
            prioridad: values.prioridad,
            ...(repetir && {
              repetir: { frecuencia, cantidad: repeticiones },
            }),
          };
          await onSubmit(payload);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            (error.response?.data as { message?: string })?.message ??
            'No se pudo guardar la tarea. Intenta de nuevo.';
          setErrorBackend(message);
        } else {
          setErrorBackend('Ocurrió un error inesperado.');
        }
      }
    },
  });

  // Helper para clases base de selects.
  const selectClasses = (hasError: boolean) => `
    w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-900
    transition focus:outline-none focus:ring-2
    ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-200'
    }
  `;

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      {errorBackend && <Alert variant="error">{errorBackend}</Alert>}

      <Input
        label="Titulo de la tarea"
        name="titulo"
        type="text"
        placeholder="Ej: Estudiar para el parcial"
        value={form.values.titulo}
        onChange={form.handleChange}
        error={form.errors.titulo}
        autoFocus
        maxLength={200}
      />

      {/* Descripción */}
      <div>
        <label
          htmlFor="descripcion"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          placeholder="Detalles, instrucciones, etc."
          value={form.values.descripcion}
          onChange={form.handleChange}
          maxLength={1000}
          className={`
            w-full rounded-md border px-3 py-2 text-sm resize-none
            transition focus:outline-none focus:ring-2
            ${
              form.errors.descripcion
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-200'
            }
          `}
        />
        {form.errors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{form.errors.descripcion}</p>
        )}
      </div>

      {/* Fecha de entrega */}
      <Input
        label="Fecha de entrega"
        name="fechaEntrega"
        type="datetime-local"
        value={form.values.fechaEntrega}
        onChange={form.handleChange}
        error={form.errors.fechaEntrega}
        // El min evita que el usuario seleccione fechas pasadas.
        min={isEdicion ? undefined : fechaMinimaParaInput()}
      />

      {/* Repetir tarea: solo al crear. Materializa varias copias. */}
      {!isEdicion && (
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={repetir}
              onChange={(e) => setRepetir(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
            />
            Repetir esta tarea
          </label>

          {repetir && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="frecuencia"
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    Cada
                  </label>
                  <select
                    id="frecuencia"
                    value={frecuencia}
                    onChange={(e) =>
                      setFrecuencia(e.target.value as FrecuenciaRepeticion)
                    }
                    className={selectClasses(false)}
                  >
                    <option value="SEMANAL">Semana</option>
                    <option value="QUINCENAL">2 semanas</option>
                    <option value="MENSUAL">Mes</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="repeticiones"
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    Nº de tareas (2–24)
                  </label>
                  <input
                    id="repeticiones"
                    type="number"
                    min={2}
                    max={24}
                    value={repeticiones}
                    onChange={(e) =>
                      setRepeticiones(
                        Math.max(2, Math.min(24, Number(e.target.value) || 2))
                      )
                    }
                    className={selectClasses(false)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Se crearán {repeticiones} tareas independientes, una cada{' '}
                {frecuencia === 'SEMANAL'
                  ? 'semana'
                  : frecuencia === 'QUINCENAL'
                  ? '2 semanas'
                  : 'mes'}
                , empezando por la fecha de arriba.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Materia: solo se puede elegir en CREACIÓN.
          En edición la dejo deshabilitada porque el backend no permite cambiarla. */}
      <div>
        <label
          htmlFor="materiaId"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Materia
        </label>
        <select
          id="materiaId"
          name="materiaId"
          value={form.values.materiaId}
          onChange={form.handleChange}
          disabled={isEdicion}
          className={`${selectClasses(Boolean(form.errors.materiaId))} ${
            isEdicion ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''
          }`}
        >
          {materias.length === 0 ? (
            <option value="">No tienes materias creadas</option>
          ) : (
            <>
              <option value="">-- Selecciona una materia --</option>
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
            </>
          )}
        </select>
        {form.errors.materiaId && (
          <p className="mt-1 text-sm text-red-600">{form.errors.materiaId}</p>
        )}
        {isEdicion && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            La materia no se puede cambiar después de crear la tarea.
          </p>
        )}
      </div>

      {/* Prioridad y Estado en una fila */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="prioridad"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Prioridad
          </label>
          <select
            id="prioridad"
            name="prioridad"
            value={form.values.prioridad}
            onChange={form.handleChange}
            className={selectClasses(false)}
          >
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="estado"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={form.values.estado}
            onChange={form.handleChange}
            className={selectClasses(false)}
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="COMPLETADA">Completada</option>
          </select>
        </div>
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
        <Button
          type="submit"
          isLoading={isSubmitting || form.isSubmitting}
          disabled={materias.length === 0}
        >
          {isEdicion ? 'Guardar cambios' : 'Crear tarea'}
        </Button>
      </div>
    </form>
  );
}