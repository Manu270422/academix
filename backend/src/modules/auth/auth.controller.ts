// ============================================================
// CONTROLLER DE AUTENTICACIÓN
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import {
  RegisterDto,
  LoginDto,
  GoogleLoginDto,
  FacebookLoginDto,
  RefreshDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './auth.dto';
import { getAuthUser } from '../../middlewares/authenticate';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as RegisterDto;
    const result = await authService.register(data);
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as LoginDto;
    const result = await authService.login(data);
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/google
 * Login (o registro automatico) con Google.
 */
export async function loginConGoogle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { credential } = req.body as GoogleLoginDto;
    const result = await authService.loginConGoogle(credential);
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión con Google exitoso',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/facebook
 * Login (o registro automatico) con Facebook.
 */
export async function loginConFacebook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { accessToken } = req.body as FacebookLoginDto;
    const result = await authService.loginConFacebook(accessToken);
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión con Facebook exitoso',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshDto;
    const tokens = await authService.refresh(refreshToken);
    res.status(200).json({
      success: true,
      message: 'Tokens renovados correctamente',
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authUser = getAuthUser(req);
    const usuario = await authService.getProfile(authUser.id);
    res.status(200).json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/auth/me
 * Actualiza el perfil del usuario autenticado.
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authUser = getAuthUser(req);
    const data = req.body as UpdateProfileDto;
    const usuario = await authService.updateProfile(authUser.id, data);
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/change-password
 * Cambia la contraseña del usuario autenticado.
 */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authUser = getAuthUser(req);
    const data = req.body as ChangePasswordDto;
    await authService.changePassword(authUser.id, data);
    res.status(200).json({
      success: true,
      message: 'Contraseña cambiada correctamente',
    });
  } catch (error) {
    next(error);
  }
}