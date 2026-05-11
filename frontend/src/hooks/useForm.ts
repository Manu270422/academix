// ============================================================
// HOOK PERSONALIZADO: useForm
// ============================================================
// Hook generico para manejar formularios en React.
// Se encarga de:
//   - Mantener el estado de cada campo.
//   - Mantener los errores por campo.
//   - Validar al hacer submit.
//   - Manejar el estado "isSubmitting".
//
// Lo hago generico (con tipo T) para que funcione con cualquier
// formulario: login, registro, crear materia, crear tarea, etc.
// Asi no tengo que duplicar lógica en cada pantalla.
// ============================================================

import { useState, type ChangeEvent, type FormEvent } from 'react';

// Defino la "forma" de las funciones de validación.
// Cada validador recibe el valor y devuelve un mensaje de error,
// o null si todo está bien.
type Validator<T> = (value: T[keyof T], values: T) => string | null;

// Las reglas de validacion: un objeto donde cada llave es el nombre
// de un campo y el valor es la función validadora.
type ValidationRules<T> = Partial<Record<keyof T, Validator<T>>>;

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja el cambio de un input.
   * Lo conecto al evento onChange del input.
   * También limpia el error del campo si tenia uno (mejor UX).
   */
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // Si el campo tenía un error, lo limpio en cuanto el usuario empieza
    // a corregirlo. Asi no le sigo gritando "está mal" mientras escribe.
    if (errors[name as keyof T]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof T];
        return newErrors;
      });
    }
  }

  /**
   * Permite setear un error desde fuera del formulario.
   * Útil cuando el backend devuelve un error de validacion especifico
   * (ej: "ese email ya esta registrado").
   */
  function setFieldError(field: keyof T, error: string) {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }

  /**
   * Valida todos los campos segun las reglas.
   * Devuelve true si todo esta bien, false si hay errores.
   */
  function validate(): boolean {
    const newErrors: Partial<Record<keyof T, string>> = {};

    for (const field in validationRules) {
      const validator = validationRules[field];
      if (validator) {
        const error = validator(values[field], values);
        if (error) {
          newErrors[field] = error;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Maneja el submit del formulario.
   * Lo conecto al evento onSubmit del form.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Si la validación falla, no hago la petición.
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      // Aunque haya error, marco como no-submitting al terminar
      // para que el botón vuelva a estar habilitado.
      setIsSubmitting(false);
    }
  }

  /**
   * Resetea el formulario a sus valores iniciales.
   * Útil despues de un submit exitoso.
   */
  function reset() {
    setValues(initialValues);
    setErrors({});
  }

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldError,
    reset,
  };
}