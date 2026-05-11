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