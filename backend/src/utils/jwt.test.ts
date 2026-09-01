// ============================================================
// TESTS: utils/jwt
// ============================================================
// El JWT es la pieza central de la seguridad: si genero o verifico
// mal un token, cualquiera podria entrar como otro usuario.
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  generateToken,
  verifyToken,
  generateTokenPair,
  type JwtPayload,
} from './jwt';
import { AppError } from '../middlewares/errorHandler';

const payload: JwtPayload = { userId: 7, email: 'manu@academix.dev' };

describe('generateToken / verifyToken', () => {
  it('un token de acceso se puede volver a leer con los mismos datos', () => {
    const token = generateToken(payload, 'access');
    const leido = verifyToken(token, 'access');
    expect(leido.userId).toBe(7);
    expect(leido.email).toBe('manu@academix.dev');
  });

  it('un token de acceso NO vale como refresh (secretos distintos)', () => {
    const access = generateToken(payload, 'access');
    expect(() => verifyToken(access, 'refresh')).toThrow(AppError);
  });

  it('rechaza un token manipulado', () => {
    const token = generateToken(payload, 'access');
    const manipulado = token.slice(0, -3) + 'abc';
    expect(() => verifyToken(manipulado, 'access')).toThrow(AppError);
  });

  it('rechaza basura con un error 401', () => {
    try {
      verifyToken('esto-no-es-un-jwt', 'access');
      expect.unreachable('deberia haber lanzado');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).statusCode).toBe(401);
    }
  });
});

describe('generateTokenPair', () => {
  it('devuelve access y refresh, ambos válidos y distintos', () => {
    const { accessToken, refreshToken } = generateTokenPair(payload);
    expect(accessToken).not.toBe(refreshToken);
    expect(verifyToken(accessToken, 'access').userId).toBe(7);
    expect(verifyToken(refreshToken, 'refresh').userId).toBe(7);
  });
});
