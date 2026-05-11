// ============================================================
// RUTAS DEL MÓDULO DE MATERIAS
// ============================================================
// Convencion REST que sigo:
//   POST   /subjects       -> crear materia
//   GET    /subjects       -> listar mis materias
//   GET    /subjects/:id   -> ver una materia
//   PATCH  /subjects/:id   -> actualizar una materia
//   DELETE /subjects/:id   -> eliminar una materia
//
// TODAS las rutas están protegidas con el middleware "authenticate".
// Sin un JWT valido, ninguna de estas rutas responde 200.
// ============================================================

import { Router } from 'express';
import * as subjectsController from './subjects.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdParamSchema,
} from './subjects.dto';

const router = Router();

// ============================================================
// PROTECCION GLOBAL DEL ROUTER
// ============================================================
// router.use(authenticate) aplica el middleware a TODAS las rutas
// definidas debajo. Es más limpio que ponerlo en cada ruta una por una.
// Si mañana añado una ruta nueva en este archivo, queda protegida
// automáticamente.
router.use(authenticate);

// ============================================================
// POST /api/v1/subjects - Crear materia
// ============================================================
router.post('/', validate(createSubjectSchema), subjectsController.create);

// ============================================================
// GET /api/v1/subjects - Listar todas mis materias
// ============================================================
router.get('/', subjectsController.findAll);

// ============================================================
// GET /api/v1/subjects/:id - Ver una materia
// ============================================================
router.get(
  '/:id',
  validate(subjectIdParamSchema, 'params'),
  subjectsController.findOne
);

// ============================================================
// PATCH /api/v1/subjects/:id - Actualizar materia
// ============================================================
// Aplico DOS validaciones: una para el :id y otra para el body.
router.patch(
  '/:id',
  validate(subjectIdParamSchema, 'params'),
  validate(updateSubjectSchema),
  subjectsController.update
);

// ============================================================
// DELETE /api/v1/subjects/:id - Eliminar materia
// ============================================================
router.delete(
  '/:id',
  validate(subjectIdParamSchema, 'params'),
  subjectsController.remove
);

export default router;