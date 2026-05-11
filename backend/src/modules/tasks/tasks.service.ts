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
export async function create(usuarioId: number, data: CreateTaskDto) {
  // PASO 1: Verifico que la materia destino sea del usuario.
  // Sin esto, alguien podria crear tareas en materias ajenas mandando
  // un materiaId que no le pertenece.
  await verificarMateriaDelUsuario(usuarioId, data.materiaId);

  // PASO 2: Creo la tarea.
  // No necesito guardar usuarioId en la tarea: la propiedad se infiere
  // a traves de la materia (tarea -> materia -> usuario).
  const tarea = await prisma.tarea.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      fechaEntrega: data.fechaEntrega,
      materiaId: data.materiaId,
      // Si no se envian, Prisma usa los defaults de schema.prisma.
      ...(data.estado && { estado: data.estado }),
      ...(data.prioridad && { prioridad: data.prioridad }),
    },
    // Incluyo los datos de la materia en la respuesta para que el frontend
    // no tenga que hacer otra petición para mostrar "Tarea X - Materia Y".
    include: {
      materia: {
        select: { id: true, nombre: true, color: true },
      },
    },
  });

  logger.info(
    `Tarea creada: "${tarea.titulo}" (id: ${tarea.id}) en materia ${tarea.materiaId}`
  );

  return tarea;
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