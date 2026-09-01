// ============================================================
// SERVICIO DE TAREAS
// ============================================================
// Aquí vive la LÓGICA DE NEGOCIO del CRUD de tareas:
//   - Crear tareas verificando que la materia destino sea del usuario.
//   - Listar con filtros opcionales (estado, prioridad, materia, fechas).
//   - Obtener, actualizar, cambiar estado y eliminar verificando dueño.
//
// CADENA DE PROPIEDAD CLAVE:
//   usuario -> materia -> tarea
// Una tarea pertenece a una materia, y la materia pertenece al usuario.
// Para verificar que un usuario "es dueño" de una tarea, busco la tarea
// junto con su materia y verifico que materia.usuarioId == usuarioAutenticado.id.
// ============================================================

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';
import {
  CreateTaskDto,
  UpdateTaskDto,
  ListTasksQuery,
} from './tasks.dto';
import { UMBRALES_RECORDATORIO_HORAS } from '../reminders/reminders.constants';

// ============================================================
// HELPER: VERIFICAR QUE UNA MATERIA PERTENECE AL USUARIO
// ============================================================
/**
 * Verifica que una materia exista Y pertenezca al usuario autenticado.
 * Si no, lanza 404 (no 403, por la misma razón de seguridad explicada
 * en el módulo de materias: no revelar si existen recursos ajenos).
 *
 * Lo uso al crear una tarea para asegurar que el usuario solo pueda
 * asignar tareas a SUS materias.
 */
async function verificarMateriaDelUsuario(
  usuarioId: number,
  materiaId: number
): Promise<void> {
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId },
    select: { id: true }, // solo necesito saber si existe, no traigo nada más
  });

  if (!materia) {
    throw new AppError('Materia no encontrada', 404);
  }
}

// ============================================================
// CREAR TAREA
// ============================================================
/**
 * Crea una nueva tarea asociada a una materia del usuario autenticado.
 * Cumple con la HU06 (registrar tareas con fecha de entrega).
 */
// Dada la fecha de la primera tarea y la frecuencia, calculo la fecha
// de la ocurrencia numero "i" (i = 0 es la primera).
function fechaOcurrencia(
  base: Date,
  frecuencia: 'SEMANAL' | 'QUINCENAL' | 'MENSUAL',
  i: number
): Date {
  const d = new Date(base);
  if (frecuencia === 'SEMANAL') d.setDate(d.getDate() + 7 * i);
  else if (frecuencia === 'QUINCENAL') d.setDate(d.getDate() + 14 * i);
  else d.setMonth(d.getMonth() + i); // MENSUAL
  return d;
}

// Datos comunes para crear UNA tarea (con sus 3 recordatorios).
function datosNuevaTarea(data: CreateTaskDto, fechaEntrega: Date) {
  return {
    titulo: data.titulo,
    descripcion: data.descripcion ?? null,
    fechaEntrega,
    materiaId: data.materiaId,
    ...(data.estado && { estado: data.estado }),
    ...(data.prioridad && { prioridad: data.prioridad }),
    recordatorios: {
      create: UMBRALES_RECORDATORIO_HORAS.map((horas) => ({
        anticipacionHoras: horas,
      })),
    },
  };
}

export async function create(usuarioId: number, data: CreateTaskDto) {
  // PASO 1: Verifico que la materia destino sea del usuario.
  // Sin esto, alguien podria crear tareas en materias ajenas mandando
  // un materiaId que no le pertenece.
  await verificarMateriaDelUsuario(usuarioId, data.materiaId);

  const incluirMateria = {
    materia: { select: { id: true, nombre: true, color: true } },
  } as const;

  // ---- CASO SIN REPETICION: creo una sola tarea ----
  if (!data.repetir) {
    const tarea = await prisma.tarea.create({
      data: datosNuevaTarea(data, data.fechaEntrega),
      include: incluirMateria,
    });
    logger.info(
      `Tarea creada: "${tarea.titulo}" (id: ${tarea.id}) en materia ${tarea.materiaId}`
    );
    return { tarea, creadas: 1 };
  }

  // ---- CASO CON REPETICION: creo N tareas independientes ----
  // Calculo las fechas de todas las ocurrencias.
  const { frecuencia, cantidad } = data.repetir;
  const fechas = Array.from({ length: cantidad }, (_, i) =>
    fechaOcurrencia(data.fechaEntrega, frecuencia, i)
  );

  // $transaction: o se crean TODAS o ninguna.
  const creadas = await prisma.$transaction(
    fechas.map((fecha) =>
      prisma.tarea.create({
        data: datosNuevaTarea(data, fecha),
        include: incluirMateria,
      })
    )
  );

  logger.info(
    `Tarea "${data.titulo}" repetida ${frecuencia} x${cantidad} ` +
      `(ids: ${creadas.map((t) => t.id).join(', ')}) por usuario ${usuarioId}`
  );

  return { tarea: creadas[0], creadas: creadas.length };
}

// ============================================================
// LISTAR TAREAS DEL USUARIO (CON FILTROS)
// ============================================================
/**
 * Devuelve las tareas del usuario autenticado, opcionalmente filtradas.
 *
 * El truco para filtrar por usuario sin tener usuarioId en la tarea:
 * filtro por la relación materia.usuarioId. Prisma me deja hacer eso
 * de forma elegante con la sintaxis de "where" anidado.
 */
export async function findAll(usuarioId: number, filters: ListTasksQuery) {
  // Construyo el filtro WHERE dinamicamente segun los parametros enviados.
  // Empiezo con el filtro base obligatorio: tareas cuya materia es del usuario.
  const where: Prisma.TareaWhereInput = {
    materia: { usuarioId },
  };

  // Anado filtros opcionales solo si el cliente los envio.
  // Asi GET /tasks devuelve todo, y GET /tasks?estado=PENDIENTE filtra.
  if (filters.estado) {
    where.estado = filters.estado;
  }

  if (filters.prioridad) {
    where.prioridad = filters.prioridad;
  }

  if (filters.materiaId) {
    where.materiaId = filters.materiaId;
  }

  // Para los filtros de fecha uso el operador "gte" (greater than or equal)
  // y "lte" (less than or equal). Si solo viene "desde", filtro desde esa
  // fecha hacia adelante; si solo viene "hasta", al reves.
  if (filters.desde || filters.hasta) {
    where.fechaEntrega = {};
    if (filters.desde) {
      where.fechaEntrega.gte = filters.desde;
    }
    if (filters.hasta) {
      where.fechaEntrega.lte = filters.hasta;
    }
  }

  return prisma.tarea.findMany({
    where,
    // Ordeno por fecha de entrega ascendente: las mas urgentes primero.
    // Si dos tareas tienen la misma fecha, ordeno por prioridad y luego
    // por fecha de creacion. Asi el listado es siempre util.
    orderBy: [
      { fechaEntrega: 'asc' },
      { prioridad: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      materia: {
        select: { id: true, nombre: true, color: true },
      },
      // Traigo el checklist de cada tarea, ordenado.
      subtareas: {
        orderBy: [{ orden: 'asc' }, { id: 'asc' }],
      },
    },
  });
}

// ============================================================
// OBTENER UNA TAREA POR ID
// ============================================================
/**
 * Devuelve una tarea especifica del usuario autenticado.
 * Aplica el mismo principio de aislamiento que en materias.
 */
export async function findOne(usuarioId: number, tareaId: number) {
  const tarea = await prisma.tarea.findFirst({
    where: {
      id: tareaId,
      // Filtro por la relacion: la materia de esta tarea debe ser del usuario.
      // Esta linea es la que aplica el aislamiento por usuario.
      materia: { usuarioId },
    },
    include: {
      materia: {
        select: { id: true, nombre: true, color: true },
      },
      subtareas: {
        orderBy: [{ orden: 'asc' }, { id: 'asc' }],
      },
    },
  });

  if (!tarea) {
    throw new AppError('Tarea no encontrada', 404);
  }

  return tarea;
}

// ============================================================
// ACTUALIZAR TAREA
// ============================================================
/**
 * Actualiza los campos enviados de una tarea.
 * Solo permite editar tareas que pertenecen al usuario autenticado.
 */
export async function update(
  usuarioId: number,
  tareaId: number,
  data: UpdateTaskDto
) {
  // PASO 1: Verifico que la tarea exista Y sea del usuario.
  await findOne(usuarioId, tareaId);

  // PASO 2: Actualizo solo los campos enviados.
  const tarea = await prisma.tarea.update({
    where: { id: tareaId },
    data: {
      ...(data.titulo !== undefined && { titulo: data.titulo }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
      ...(data.fechaEntrega !== undefined && { fechaEntrega: data.fechaEntrega }),
      ...(data.estado !== undefined && { estado: data.estado }),
      ...(data.prioridad !== undefined && { prioridad: data.prioridad }),
      // Si la fecha de entrega cambio, BORRO los 3 recordatorios viejos
      // y creo 3 nuevos desde cero (deleteMany + create en la misma
      // operacion). Es mas simple y confiable que tratar de reajustar
      // cada uno: evita arrastrar intentosEnvio/ultimoError viejos que
      // ya no aplican a la nueva fecha.
      ...(data.fechaEntrega !== undefined && {
        recordatorios: {
          deleteMany: {},
          create: UMBRALES_RECORDATORIO_HORAS.map((horas) => ({
            anticipacionHoras: horas,
          })),
        },
      }),
    },
    include: {
      materia: {
        select: { id: true, nombre: true, color: true },
      },
    },
  });

  logger.info(`Tarea ${tareaId} actualizada por usuario ${usuarioId}`);

  return tarea;
}

// ============================================================
// CAMBIAR ESTADO DE LA TAREA
// ============================================================
/**
 * Endpoint dedicado para cambiar el estado de una tarea.
 * Es la accion mas frecuente del estudiante (marcar completada),
 * asi que merece su propio metodo separado del update general.
 * Cumple con la HU07 (cambiar estado: pendiente, en progreso, completada).
 */
export async function updateStatus(
  usuarioId: number,
  tareaId: number,
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA'
) {
  // Verifico dueno.
  await findOne(usuarioId, tareaId);

  const tarea = await prisma.tarea.update({
    where: { id: tareaId },
    data: { estado },
    include: {
      materia: {
        select: { id: true, nombre: true, color: true },
      },
    },
  });

  logger.info(`Tarea ${tareaId} cambio de estado a ${estado}`);

  return tarea;
}

// ============================================================
// ELIMINAR TAREA
// ============================================================
/**
 * Elimina una tarea del usuario autenticado.
 */
export async function remove(usuarioId: number, tareaId: number) {
  await findOne(usuarioId, tareaId);

  await prisma.tarea.delete({
    where: { id: tareaId },
  });

  logger.info(`Tarea ${tareaId} eliminada por usuario ${usuarioId}`);
}