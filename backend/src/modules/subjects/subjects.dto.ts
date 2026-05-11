// ============================================================
// DTOs Y ESQUEMAS DE VALIDACIÓN DEL MÓDULO MATERIAS
// ============================================================
// Aqui defino la "forma" de los datos que llegan al backend
// cuando el usuario crea, actualiza o consulta materias.
//
// Como en el modulo de auth, uso Zod para validar todo lo que
// envia el cliente antes de tocar la base de datos.
// ============================================================

import { z } from 'zod';

// ============================================================
// VALIDADORES REUTILIZABLES
// ============================================================
// Aqui defino reglas que se repiten para no escribirlas dos veces.

// El nombre de la materia: obligatorio, entre 2 y 100 caracteres.
const nombreMateria = z
  .string({ required_error: 'El nombre es obligatorio' })
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede tener más de 100 caracteres');

// Color en formato hexadecimal (#RRGGBB).
// Lo uso en el frontend para diferenciar visualmente cada materia.
// El regex valida que sea: # seguido de 6 caracteres hexadecimales.
// Lo dejo opcional con .optional() porque no todos los usuarios querran asignar color.
const colorHex = z
  .string()
  .regex(
    /^#[0-9A-Fa-f]{6}$/,
    'El color debe tener formato hexadecimal válido (ej: #4A90E2)'
  )
  .optional();

// Descripción libre: opcional, hasta 500 caracteres.
const descripcionMateria = z
  .string()
  .trim()
  .max(500, 'La descripción no puede tener mas de 500 caracteres')
  .optional();

// ============================================================
// ESQUEMA: CREAR MATERIA
// ============================================================
// Cumple con la HU03 (crear materias).
// El usuario_id NO viene en el body: lo saco del token JWT.
// Eso es importante por seguridad: si el cliente lo enviara, podría
// crear materias a nombre de OTRO usuario.
export const createSubjectSchema = z.object({
  nombre: nombreMateria,
  color: colorHex,
  descripcion: descripcionMateria,
});

// ============================================================
// ESQUEMA: ACTUALIZAR MATERIA
// ============================================================
// Cumple con la HU04 (editar materias).
// Como uso PATCH, todos los campos son opcionales: el usuario puede
// querer cambiar solo el nombre, solo el color, o solo la descripción.
//
// Sin embargo, si el body llega completamente vacío no tiene sentido,
// asi que pido al menos UN campo con el .refine().
export const updateSubjectSchema = z
  .object({
    nombre: nombreMateria.optional(),
    color: colorHex,
    // Para descripción permito que se envie null para "limpiar" el campo.
    descripcion: descripcionMateria.nullable(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'Debes enviar al menos un campo para actualizar'
  );

// ============================================================
// ESQUEMA: PARAMETROS DE LA URL
// ============================================================
// Para rutas como GET /subjects/:id, valido que el :id sea un número.
// Express recibe los params como string siempre, asi que uso coerce
// para convertirlos automaticamente a número.
export const subjectIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El id debe ser un número' })
    .int('El id debe ser un número entero')
    .positive('El id debe ser un número positivo'),
});

// ============================================================
// TIPOS DERIVADOS
// ============================================================
export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;
export type SubjectIdParam = z.infer<typeof subjectIdParamSchema>;