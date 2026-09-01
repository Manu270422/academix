// ============================================================
// TIPOS COMPARTIDOS DEL FRONTEND
// ============================================================
// Aqui defino las "formas" de los datos que manejo en el frontend.
// Idealmente coinciden con lo que devuelve mi backend.
//
// En un proyecto mas grande podria generar estos tipos automáticamente
// a partir del schema de Prisma con herramientas como Prisma + tRPC.
// Para Academix los escribo a mano: es mas didáctico y suficiente.
// ============================================================

// ============================================================
// USUARIO
// ============================================================
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  createdAt: string; // viene como string ISO desde JSON
}

// ============================================================
// AUTENTICACIÓN
// ============================================================
export interface AuthResponse {
  usuario: Usuario;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

// ============================================================
// MATERIA
// ============================================================
export interface Materia {
  id: number;
  nombre: string;
  color: string | null;
  descripcion: string | null;
  usuarioId: number;
  createdAt: string;
  updatedAt: string;
  // Cuando el backend incluye el conteo de tareas con _count
  _count?: {
    tareas: number;
  };
  // El backend incluye las notas (apuntes) en GET /subjects/:id.
  notas?: Nota[];
  // Fecha en que se movió a la papelera (null = activa). Solo llega
  // en la respuesta de /trash.
  deletedAt?: string | null;
}

// ============================================================
// NOTA (apunte de una materia)
// ============================================================
export interface Nota {
  id: number;
  contenido: string;
  materiaId: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// TAREA
// ============================================================
// Los enums coinciden con los de Prisma en el backend.
export type EstadoTarea = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string | null;
  fechaEntrega: string;
  estado: EstadoTarea;
  prioridad: Prioridad;
  materiaId: number;
  createdAt: string;
  updatedAt: string;
  // Cuando el backend incluye los datos de la materia
  materia?: {
    id: number;
    nombre: string;
    color: string | null;
  };
  // El backend siempre incluye el checklist (puede venir vacio).
  subtareas?: Subtarea[];
  // Fecha en que se movió a la papelera (solo en la respuesta de /trash).
  deletedAt?: string | null;
}

// ============================================================
// SUBTAREA (checklist de una tarea)
// ============================================================
// Un paso concreto dentro de una tarea. Se marca hecho / no hecho.
export interface Subtarea {
  id: number;
  titulo: string;
  completada: boolean;
  orden: number;
  tareaId: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// RECORDATORIO
// ============================================================
// Cada uno representa UN umbral de aviso (72h, 24h o 6h antes de
// vencer) ya enviado para una tarea. El backend solo me devuelve
// los que ya se enviaron (enviadoEmail=true) - son las notificaciones
// que se muestran en la campanita.
export interface Recordatorio {
  id: number;
  anticipacionHoras: number;
  enviadoEmail: boolean;
  fechaEnvioEmail: string | null;
  leidoEnApp: boolean;
  createdAt: string;
  // El backend siempre incluye estos datos de la tarea y su materia,
  // para poder mostrar "Tarea X - Materia Y" sin otra petición.
  tarea: {
    id: number;
    titulo: string;
    fechaEntrega: string;
    materia: {
      id: number;
      nombre: string;
      color: string | null;
    };
  };
}

// ============================================================
// RESPUESTAS GENÉRICAS DEL BACKEND
// ============================================================
// Mi backend SIEMPRE responde con esta estructura.
// Tener un tipo genérico me ahorra escribir lo mismo cada vez.
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    // Uso esto en /reminders para saber cuantas notificaciones
    // sin leer mostrar en el contador de la campanita.
    noLeidos?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    campo: string;
    mensaje: string;
  }>;
}