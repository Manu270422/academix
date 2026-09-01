// ============================================================
// DTOs Y ESQUEMAS DE VALIDACIÓN DEL MODULO TAREAS
// ============================================================
// Aqui defino la "forma" de los datos que llegan al backend
// cuando el usuario crea, actualiza, filtra o consulta tareas.
//
// Este módulo es el mas grande del backend porque las tareas tienen
// mas campos y porque el listado soporta filtros opcionales.
// ============================================================

import { z } from 'zod';

// ============================================================
// ENUMS COMO VALORES ZOD
// ============================================================
// Defino aqui los valores validos para "estado" y "prioridad".
// Tienen que coincidir con los enums que defini en schema.prisma.
// Si los pongo desde Zod, valido tambien que el cliente envie un valor
// permitido (no cualquier string raro).

export const estadoTareaEnum = z.enum(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'], {
  errorMap: () => ({
    message: 'El estado debe ser PENDIENTE, EN_PROGRESO o COMPLETADA',
  }),
});

export const prioridadEnum = z.enum(['BAJA', 'MEDIA', 'ALTA'], {
  errorMap: () => ({
    message: 'La prioridad debe ser BAJA, MEDIA o ALTA',
  }),
});

// ============================================================
// VALIDADORES REUTILIZABLES
// ============================================================

// Titulo de la tarea: obligatorio en creación, opcional en update.
const titulo = z
  .string({ required_error: 'El titulo es obligatorio' })
  .trim()
  .min(2, 'El titulo debe tener al menos 2 caracteres')
  .max(200, 'El titulo no puede tener más de 200 caracteres');

// Descripción libre, opcional, hasta 1000 caracteres.
const descripcion = z
  .string()
  .trim()
  .max(1000, 'La descripción no puede tener más de 1000 caracteres')
  .optional();

// Fecha de entrega: la recibo como string ISO (ej: "2026-06-15T23:59:00Z")
// y la convierto automaticamente a Date para guardarla en MySQL.
// También válido que sea una fecha futura: no tiene sentido crear una tarea
// con entrega en el pasado.
const fechaEntrega = z.coerce
  .date({
    errorMap: () => ({
      message: 'La fecha de entrega debe ser una fecha válida (formato ISO)',
    }),
  })
  .refine(
    (fecha) => fecha.getTime() > Date.now(),
    'La fecha de entrega debe ser una fecha futura'
  );

// Id de la materia a la que pertenece la tarea.
// Debe ser un número entero positivo.
const materiaId = z
  .number({
    required_error: 'El id de la materia es obligatorio',
    invalid_type_error: 'El id de la materia debe ser un número',
  })
  .int('El id de la materia debe ser un número entero')
  .positive('El id de la materia debe ser un número positivo');

// ============================================================
// RECURRENCIA (repetir tarea)
// ============================================================
// Cuando el estudiante marca "repetir", el backend crea VARIAS
// tareas independientes de una vez (una por ocurrencia), separadas
// por la frecuencia elegida. No guardo ninguna "regla" en la BD:
// materializo las copias y ya. Cada copia se edita/borra sola.
export const frecuenciaRepeticionEnum = z.enum(
  ['SEMANAL', 'QUINCENAL', 'MENSUAL'],
  {
    errorMap: () => ({
      message: 'La frecuencia debe ser SEMANAL, QUINCENAL o MENSUAL',
    }),
  }
);

const repetir = z
  .object({
    frecuencia: frecuenciaRepeticionEnum,
    // Total de tareas a crear, contando la primera. Máximo 24 para
    // no llenar la base de datos sin control.
    cantidad: z
      .number({ invalid_type_error: 'La cantidad debe ser un número' })
      .int('La cantidad debe ser un número entero')
      .min(2, 'Si repites, deben ser al menos 2')
      .max(24, 'Máximo 24 repeticiones'),
  })
  .optional();

// ============================================================
// ESQUEMA: CREAR TAREA
// ============================================================
// Cumple con la HU06 (registrar tareas asociadas a una materia).
// El cliente NO envia el usuarioId: lo saco del JWT, igual que en materias.
// El cliente SI envia el materiaId porque tiene que decir "esta tarea
// es para Matemáticas IV".
export const createTaskSchema = z.object({
  titulo,
  descripcion,
  fechaEntrega,
  materiaId,
  // Estos dos son opcionales: si no se envian, Prisma usa los defaults
  // que defini en schema.prisma (PENDIENTE y MEDIA).
  estado: estadoTareaEnum.optional(),
  prioridad: prioridadEnum.optional(),
  // Opcional: si viene, se crean varias tareas repetidas.
  repetir,
});

// ============================================================
// ESQUEMA: ACTUALIZAR TAREA
// ============================================================
// Como uso PATCH, todos los campos son opcionales.
// IMPORTANTE: en update NO permito cambiar el materiaId.
// Si el usuario quiere mover una tarea a otra materia, mejor que la
// borre y cree una nueva. Esto simplifica la lógica y reduce bugs.
//
// Para fechaEntrega en update relajo la regla de "fecha futura":
// si la tarea es vieja y el usuario solo quiere cambiar el titulo,
// no tiene sentido obligarlo a cambiar también la fecha.
export const updateTaskSchema = z
  .object({
    titulo: titulo.optional(),
    descripcion: descripcion.nullable(),
    fechaEntrega: z.coerce.date().optional(),
    estado: estadoTareaEnum.optional(),
    prioridad: prioridadEnum.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'Debes enviar al menos un campo para actualizar'
  );

// ============================================================
// ESQUEMA: CAMBIAR ESTADO DE LA TAREA
// ============================================================
// Endpoint dedicado PATCH /tasks/:id/status para cumplir la HU07.
// Es la accion mas frecuente del estudiante (marcar completada),
// asi que merece su propio endpoint mas limpio que el update general.
export const updateTaskStatusSchema = z.object({
  estado: estadoTareaEnum,
});

// ============================================================
// ESQUEMA: PARÁMETROS DE LA URL
// ============================================================
export const taskIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El id debe ser un número' })
    .int('El id debe ser un número entero')
    .positive('El id debe ser un número positivo'),
});

// ============================================================
// ESQUEMA: FILTROS DEL LISTADO (query params)
// ============================================================
// Permite al cliente listar con filtros opcionales:
//   GET /tasks?estado=PENDIENTE
//   GET /tasks?materiaId=1&prioridad=ALTA
//   GET /tasks?estado=PENDIENTE&desde=2026-01-01&hasta=2026-12-31
//
// Todos son opcionales. Si no se envia ninguno, devuelve todas las tareas.
export const listTasksQuerySchema = z.object({
  estado: estadoTareaEnum.optional(),
  prioridad: prioridadEnum.optional(),

  // materiaId puede venir como string en la URL, asi que uso coerce.
  materiaId: z.coerce.number().int().positive().optional(),

  // Filtros de rango de fechas. Util para mostrar "tareas de esta semana".
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

// ============================================================
// TIPOS DERIVADOS
// ============================================================
export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusDto = z.infer<typeof updateTaskStatusSchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;