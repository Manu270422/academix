// ============================================================
// TESTS: utils/password
// ============================================================
// Verifico que NUNCA se guarde texto plano y que la comparacion
// funcione en ambos sentidos (correcta / incorrecta).
// ============================================================

import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './password';

describe('password', () => {
  it('el hash no es la contraseña en texto plano', async () => {
    const hash = await hashPassword('Secreta123');
    expect(hash).not.toBe('Secreta123');
    expect(hash.length).toBeGreaterThan(30);
  });

  it('comparePassword acepta la contraseña correcta', async () => {
    const hash = await hashPassword('Secreta123');
    expect(await comparePassword('Secreta123', hash)).toBe(true);
  });

  it('comparePassword rechaza una contraseña incorrecta', async () => {
    const hash = await hashPassword('Secreta123');
    expect(await comparePassword('Secreta124', hash)).toBe(false);
  });

  it('dos hashes de la misma contraseña son distintos (salt aleatorio)', async () => {
    const a = await hashPassword('Secreta123');
    const b = await hashPassword('Secreta123');
    expect(a).not.toBe(b);
  });
});
