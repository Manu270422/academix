// ============================================================
// SERVICIO DE PAPELERA
// ============================================================
// Cuando el estudiante "elimina" una materia o una tarea, no se
// borra: se le pone deletedAt y queda aqui. Desde la Papelera puede:
//   - restaurar (ver subjects.service / tasks.service),
//   - borrar definitivamente (idem),
//   - vaciar toda la papelera de una vez.
//
// Un cron (ver utils/cron.ts) borra de verdad lo que lleve mas de
// 30 dias en la papelera.
// ============================================================

import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

// ============================================================
// LISTAR LO QUE HAY EN LA PAPELERA
// ============================================================
/**
 * Devuelve las materias en papelera y las tareas en papelera cuya
 * materia NO esta en papelera (esas ultimas se borraron sueltas).
 * Las tareas que cayeron junto con su materia no las listo aparte:
 * vuelven con la materia al restaurarla.
 */
export async function findAll(usuarioId: number) {
  const [materias, tareas] = await Promise.all([
    prisma.materia.findMany({
      where: { usuarioId, deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      include: { _count: { select: { tareas: true } } },
    }),
    prisma.tarea.findMany({
      where: {
        deletedAt: { not: null },
        materia: { usuarioId, deletedAt: null },
      },
      orderBy: { deletedAt: 'desc' },
      include: {
        materia: { select: { id: true, nombre: true, color: true } },
      },
    }),
  ]);

  return { materias, tareas };
}

// ============================================================
// VACIAR LA PAPELERA
// ============================================================
/**
 * Borra DE VERDAD (irreversible) todo lo que el usuario tenga en la
 * papelera. Las materias primero: el onDelete: Cascade se lleva sus
 * tareas, subtareas, notas y recordatorios.
 */
export async function vaciar(usuarioId: number) {
  const [materias, tareas] = await prisma.$transaction([
    prisma.materia.deleteMany({
      where: { usuarioId, deletedAt: { not: null } },
    }),
    prisma.tarea.deleteMany({
      where: { deletedAt: { not: null }, materia: { usuarioId } },
    }),
  ]);

  logger.info(
    `Papelera vaciada por usuario ${usuarioId}: ${materias.count} materias, ${tareas.count} tareas`
  );

  return { materias: materias.count, tareas: tareas.count };
}

// ============================================================
// PURGA AUTOMATICA (la llama el cron)
// ============================================================
/**
 * Borra definitivamente lo que lleve mas de "diasRetencion" dias en
 * la papelera. Es global (todos los usuarios).
 */
export async function purgarAntiguos(diasRetencion = 30): Promise<void> {
  const limite = new Date(Date.now() - diasRetencion * 24 * 60 * 60 * 1000);

  const [materias, tareas] = await prisma.$transaction([
    prisma.materia.deleteMany({ where: { deletedAt: { lt: limite } } }),
    prisma.tarea.deleteMany({ where: { deletedAt: { lt: limite } } }),
  ]);

  if (materias.count || tareas.count) {
    logger.info(
      `Purga de papelera: ${materias.count} materias y ${tareas.count} tareas ` +
        `con mas de ${diasRetencion} dias eliminadas definitivamente`
    );
  }
}
