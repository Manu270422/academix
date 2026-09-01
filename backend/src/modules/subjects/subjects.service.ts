// ============================================================
// SERVICIO DE MATERIAS
// ============================================================
// Aquí vive la LÓGICA DE NEGOCIO del CRUD de materias:
//   - Crear materias asociadas al usuario autenticado.
//   - Listar SOLO las materias del usuario.
//   - Obtener, actualizar y eliminar verificando dueño.
//
// REGLA DE ORO DE SEGURIDAD:
//   En CADA operación que recibe un id, verifico que la materia
//   pertenezca al usuario autenticado. Sin esta verificación,
//   un atacante podria leer/modificar/borrar materias ajenas
//   simplemente cambiando el numero en la URL.
//   A este tipo de vulnerabilidad se le llama IDOR.
// ============================================================

import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';
import { CreateSubjectDto, UpdateSubjectDto } from './subjects.dto';

// ============================================================
// CREAR MATERIA
// ============================================================
/**
 * Crea una nueva materia asociada al usuario autenticado.
 * Cumple con la HU03 (registrar materias).
 *
 * @param usuarioId  Id del usuario duenio (sale del JWT).
 * @param data       Datos validados de la materia.
 */
export async function create(usuarioId: number, data: CreateSubjectDto) {
  const materia = await prisma.materia.create({
    data: {
      nombre: data.nombre,
      color: data.color ?? null,
      descripcion: data.descripcion ?? null,
      // Aqui asocio la materia al usuario autenticado.
      // El cliente NUNCA decide este valor: lo saco del token.
      usuarioId,
    },
  });

  logger.info(`Materia creada: "${materia.nombre}" (id: ${materia.id}) por usuario ${usuarioId}`);

  return materia;
}

// ============================================================
// LISTAR MATERIAS DEL USUARIO
// ============================================================
/**
 * Devuelve todas las materias del usuario autenticado.
 * IMPORTANTE: filtro por usuarioId para que cada usuario solo vea
 * sus propias materias. Sin este filtro, todos verian todas las materias.
 *
 * También incluyo el conteo de tareas de cada materia (útil para el
 * frontend, asi muestra "Matemáticas IV - 5 tareas pendientes").
 *
 * @param usuarioId  Id del usuario duenio.
 */
export async function findAll(usuarioId: number) {
  return prisma.materia.findMany({
    where: { usuarioId },
    orderBy: { createdAt: 'desc' }, // las más recientes primero
    include: {
      // Cuento las tareas asociadas a cada materia, sin traer las tareas completas.
      // Esto se llama "aggregate count" y es muy eficiente: una sola query.
      _count: {
        select: { tareas: true },
      },
    },
  });
}

// ============================================================
// OBTENER UNA MATERIA POR ID
// ============================================================
/**
 * Devuelve una materia especifica del usuario autenticado.
 * Si la materia no existe, lanza 404.
 * Si existe pero pertenece a OTRO usuario, lanza 404 tambien (no 403).
 *
 * NOTA DE SEGURIDAD: respondo 404 en lugar de 403 a proposito.
 * Así un atacante no puede saber si una materia con cierto id existe
 * en la base de datos. Si yo respondiera 403 cuando existe pero es de
 * otro, y 404 cuando no existe, le estaria filtrando informacion.
 */
export async function findOne(usuarioId: number, materiaId: number) {
  const materia = await prisma.materia.findFirst({
    where: {
      id: materiaId,
      usuarioId, // Esta línea es la que aplica el AISLAMIENTO POR USUARIO.
    },
    include: {
      _count: {
        select: { tareas: true },
      },
      // Traigo los apuntes de la materia, el más reciente primero.
      notas: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!materia) {
    throw new AppError('Materia no encontrada', 404);
  }

  return materia;
}

// ============================================================
// ACTUALIZAR MATERIA
// ============================================================
/**
 * Actualiza los campos enviados de una materia.
 * Solo permite editar materias que pertenecen al usuario autenticado.
 * Cumple con la HU04 (editar materias).
 */
export async function update(
  usuarioId: number,
  materiaId: number,
  data: UpdateSubjectDto
) {
  // PASO 1: Verifico que la materia exista Y sea del usuario.
  // Reuso findOne para no duplicar la logica de verificación.
  await findOne(usuarioId, materiaId);

  // PASO 2: Actualizo solo los campos que el usuario envio.
  // Como el DTO permite campos opcionales, construyo el objeto data
  // dinámicamente para no sobrescribir con undefined.
  const materia = await prisma.materia.update({
    where: { id: materiaId },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
    },
  });

  logger.info(`Materia ${materiaId} actualizada por usuario ${usuarioId}`);

  return materia;
}

// ============================================================
// ELIMINAR MATERIA
// ============================================================
/**
 * Elimina una materia del usuario autenticado.
 * Cumple con la HU05 (eliminar materias).
 *
 * IMPORTANTE: gracias al "onDelete: Cascade" en mi schema.prisma,
 * al borrar la materia se borran AUTOMÁTICAMENTE todas sus tareas
 * asociadas. No necesito borrarlas manualmente.
 */
export async function remove(usuarioId: number, materiaId: number) {
  // Verifico que la materia exista y sea del usuario.
  await findOne(usuarioId, materiaId);

  await prisma.materia.delete({
    where: { id: materiaId },
  });

  logger.info(`Materia ${materiaId} eliminada por usuario ${usuarioId}`);
}