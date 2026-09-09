import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.registerBusiness(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'REGISTER_FAILED', message: err.message || 'Registration failed' } });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log(`[Auth] Login attempt for: "${email?.trim()?.toLowerCase()}"`);
      const result = await AuthService.login(email, password);
      console.log(`[Auth] Login successful for: "${email?.trim()?.toLowerCase()}" (Role: ${result.user?.role})`);
      return res.json(result);
    } catch (err: any) {
      console.error(`[Auth] Login failed for "${req.body?.email}":`, err.message || err);
      const status = err.status || 401;
      return res.status(status).json({ error: { code: err.code || 'LOGIN_FAILED', message: err.message || 'Invalid email or password' } });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: { code: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token is required' } });
      }

      const payload = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err: any) {
      return res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired' } });
    }
  }

  static async invite(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer as string).origin : undefined);
      const result = await AuthService.inviteEmployee(req.user.businessId, req.body, origin);
      return res.status(201).json(result);
    } catch (err: any) {
      const status = err.status || 400;
      return res.status(status).json({ error: { code: err.code || 'INVITE_FAILED', message: err.message || 'Failed to invite employee' } });
    }
  }

  static async acceptInvite(req: Request, res: Response) {
    try {
      const { inviteToken, password } = req.body;
      const result = await AuthService.acceptInvite(inviteToken, password);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 400;
      return res.status(status).json({ error: { code: err.code || 'ACCEPT_INVITE_FAILED', message: err.message || 'Failed to accept invitation' } });
    }
  }
}
