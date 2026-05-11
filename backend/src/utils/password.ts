// ============================================================
// UTILIDAD PARA HASH DE CONTRASEÑAS
// ============================================================
// Aquí aislo todo lo relacionado con bcrypt en un solo lugar.
// Si mañana decido cambiar de algoritmo (por ejemplo a Argon2),
// solo modifico este archivo y el resto del proyecto no se entera.
//
// IMPORTANTE: NUNCA, NUNCA guardo contrasenas en texto plano.
// Solo guardo el HASH. Y bcrypt anade automaticamente un "salt" aleatorio
// para que dos usuarios con la misma contraseña tengan hashes distintos.
// Así un atacante no puede usar tablas precomputadas (rainbow tables).
// ============================================================

import bcrypt from 'bcrypt';

// El "cost factor" o "rounds" controla que tan lento es bcrypt.
// 12 es un buen balance entre seguridad y rendimiento en 2026.
// Más alto = más seguro pero mas lento. Mas bajo = mas rápido pero más débil.
// Un atacante que robe la base de datos tendría que invertir muchisimo tiempo
// en romper cada password porque bcrypt esta diseñado para ser lento.
const SALT_ROUNDS = 12;

/**
 * Genera el hash de una contraseña en texto plano.
 * Lo uso al registrar un usuario o cuando cambia su contraseña.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano contra un hash guardado.
 * Lo uso en el login para verificar las credenciales del usuario.
 *
 * IMPORTANTE: bcrypt extrae el salt del hash automáticamente,
 * asi que no necesito guardarlo por separado.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}