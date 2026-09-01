// ============================================================
// SERVICIO DE NOTAS
// ============================================================
// CRUD de los apuntes de una materia.
//
// CADENA DE PROPIEDAD:
//   usuario -> materia -> nota
// En CADA operación verifico que la materia "padre" sea del usuario
// autenticado (anti-IDOR), igual que en el resto de módulos.
// ============================================================

import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';
import { CreateNoteDto, UpdateNoteDto } from './notes.dto';

async function verificarMateriaDelUsuario(
  usuarioId: number,
  materiaId: number
): Promise<void> {
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId, deletedAt: null },
    select: { id: true },
  });
  if (!materia) {
    throw new AppError('Materia no encontrada', 404);
  }
}

async function buscarNotaDelUsuario(
  usuarioId: number,
  materiaId: number,
  notaId: number
) {
  const nota = await prisma.nota.findFirst({
    where: {
      id: notaId,
      materiaId,
      materia: { usuarioId, deletedAt: null },
    },
  });
  if (!nota) {
    throw new AppError('Nota no encontrada', 404);
  }
  return nota;
}

// ============================================================
// LISTAR NOTAS DE UNA MATERIA
// ============================================================
export async function findAll(usuarioId: number, materiaId: number) {
  await verificarMateriaDelUsuario(usuarioId, materiaId);
  return prisma.nota.findMany({
    where: { materiaId },
    orderBy: { createdAt: 'desc' }, // la más reciente arriba
  });
}

// ============================================================
// CREAR NOTA
// ============================================================
export async function create(
  usuarioId: number,
  materiaId: number,
  data: CreateNoteDto
) {
  await verificarMateriaDelUsuario(usuarioId, materiaId);

  const nota = await prisma.nota.create({
    data: { contenido: data.contenido, materiaId },
  });

  logger.info(
    `Nota creada (id: ${nota.id}) en materia ${materiaId} por usuario ${usuarioId}`
  );

  return nota;
}

// ============================================================
// ACTUALIZAR NOTA
// ============================================================
export async function update(
  usuarioId: number,
  materiaId: number,
  notaId: number,
  data: UpdateNoteDto
) {
  await buscarNotaDelUsuario(usuarioId, materiaId, notaId);

  return prisma.nota.update({
    where: { id: notaId },
    data: { contenido: data.contenido },
  });
}

// ============================================================
// ELIMINAR NOTA
// ============================================================
export async function remove(
  usuarioId: number,
  materiaId: number,
  notaId: number
) {
  await buscarNotaDelUsuario(usuarioId, materiaId, notaId);
  await prisma.nota.delete({ where: { id: notaId } });

  logger.info(
    `Nota ${notaId} eliminada de materia ${materiaId} por usuario ${usuarioId}`
  );
}
