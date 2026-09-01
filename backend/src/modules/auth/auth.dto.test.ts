// ============================================================
// TESTS: esquemas Zod del modulo auth
// ============================================================

import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from './auth.dto';

describe('registerSchema', () => {
  const base = {
    nombre: 'Manuel Turizo',
    email: 'Manu@Academix.DEV',
    password: 'Secreta123',
  };

  it('acepta un registro válido y normaliza el email a minúsculas', () => {
    const r = registerSchema.safeParse(base);
    expect(r.success).toBe(true);
    expect(r.success && r.data.email).toBe('manu@academix.dev');
  });

  it('rechaza un email con formato inválido', () => {
    expect(
      registerSchema.safeParse({ ...base, email: 'no-es-email' }).success
    ).toBe(false);
  });

  it('rechaza una contraseña sin mayúscula', () => {
    expect(
      registerSchema.safeParse({ ...base, password: 'secreta123' }).success
    ).toBe(false);
  });

  it('rechaza una contraseña sin número', () => {
    expect(
      registerSchema.safeParse({ ...base, password: 'SecretaAbc' }).success
    ).toBe(false);
  });

  it('rechaza una contraseña de menos de 8 caracteres', () => {
    expect(
      registerSchema.safeParse({ ...base, password: 'Ab1' }).success
    ).toBe(false);
  });

  it('rechaza un nombre demasiado corto', () => {
    expect(registerSchema.safeParse({ ...base, nombre: 'M' }).success).toBe(
      false
    );
  });
});

describe('loginSchema', () => {
  it('acepta email + password no vacío', () => {
    const r = loginSchema.safeParse({
      email: 'manu@academix.dev',
      password: 'x',
    });
    expect(r.success).toBe(true);
  });

  it('rechaza password vacío', () => {
    expect(
      loginSchema.safeParse({ email: 'manu@academix.dev', password: '' }).success
    ).toBe(false);
  });
});
