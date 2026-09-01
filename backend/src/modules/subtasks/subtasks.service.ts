// ============================================================
// SERVICIO DE SUBTAREAS
// ============================================================
// LOGICA DE NEGOCIO del checklist de una tarea.
//
// CADENA DE PROPIEDAD:
//   usuario -> materia -> tarea -> subtarea
// En CADA operación verifico que la tarea "padre" pertenezca al
// usuario autenticado (siguiendo la relación tarea.materia.usuarioId).
// Sin esto, alguien podría añadir/editar/borrar subtareas en tareas
// ajenas cambiando el id de la URL (vulnerabilidad IDOR).
// ============================================================

import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';
import { CreateSubtaskDto, UpdateSubtaskDto } from './subtasks.dto';

// ============================================================
// HELPER: VERIFICAR QUE LA TAREA ES DEL USUARIO
// ============================================================
async function verificarTareaDelUsuario(
  usuarioId: number,
  tareaId: number
): Promise<void> {
  const tarea = await prisma.tarea.findFirst({
    where: { id: tareaId, materia: { usuarioId } },
    select: { id: true },
  });

  if (!tarea) {
    // 404 (no 403) para no revelar si la tarea existe, igual que en
    // el resto de módulos.
    throw new AppError('Tarea no encontrada', 404);
  }
}

// ============================================================
// HELPER: BUSCAR UNA SUBTAREA VERIFICANDO DUEÑO
// ============================================================
async function buscarSubtareaDelUsuario(
  usuarioId: number,
  tareaId: number,
  subtareaId: number
) {
  const subtarea = await prisma.subtarea.findFirst({
    where: {
      id: subtareaId,
      tareaId,
      tarea: { materia: { usuarioId } },
    },
  });

  if (!subtarea) {
    throw new AppError('Subtarea no encontrada', 404);
  }

  return subtarea;
}

// ============================================================
// CREAR SUBTAREA
// ============================================================
/**
 * Añade una casilla al checklist de una tarea. La nueva subtarea
 * queda al final (orden = cuántas hay ya).
 */
export async function create(
  usuarioId: number,
  tareaId: number,
  data: CreateSubtaskDto
) {
  await verificarTareaDelUsuario(usuarioId, tareaId);

  // La pongo al final del checklist.
  const cuantas = await prisma.subtarea.count({ where: { tareaId } });

  const subtarea = await prisma.subtarea.create({
    data: {
      titulo: data.titulo,
      tareaId,
      orden: cuantas,
    },
  });

  logger.info(
    `Subtarea creada (id: ${subtarea.id}) en tarea ${tareaId} por usuario ${usuarioId}`
  );

  return subtarea;
}

// ============================================================
// ACTUALIZAR SUBTAREA
// ============================================================
/**
 * Renombra, marca/desmarca o reordena una subtarea.
 */
export async function update(
  usuarioId: number,
  tareaId: number,
  subtareaId: number,
  data: UpdateSubtaskDto
) {
  await buscarSubtareaDelUsuario(usuarioId, tareaId, subtareaId);

  const subtarea = await prisma.subtarea.update({
    where: { id: subtareaId },
    data: {
      ...(data.titulo !== undefined && { titulo: data.titulo }),
      ...(data.completada !== undefined && { completada: data.completada }),
      ...(data.orden !== undefined && { orden: data.orden }),
    },
  });

  return subtarea;
}

// ============================================================
// ELIMINAR SUBTAREA
// ============================================================
export async function remove(
  usuarioId: number,
  tareaId: number,
  subtareaId: number
) {
  await buscarSubtareaDelUsuario(usuarioId, tareaId, subtareaId);

  await prisma.subtarea.delete({ where: { id: subtareaId } });

  logger.info(
    `Subtarea ${subtareaId} eliminada de tarea ${tareaId} por usuario ${usuarioId}`
  );
}
