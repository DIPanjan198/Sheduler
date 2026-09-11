import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendEmail } from '../utils/mailer';
import nodemailer from 'nodemailer';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.registerBusiness(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      if (err?.code === 'P2002' || err?.message?.includes('Unique constraint')) {
        return res.status(400).json({ error: { code: 'EMAIL_EXISTS', message: 'A user account with this email address already exists. Please sign in instead.' } });
      }
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

  static async testEmail(req: AuthRequest, res: Response) {
    const to = req.user?.email || (process.env.GMAIL_USER || '').trim();
    if (!to) {
      return res.status(400).json({ error: 'Could not determine recipient email from auth token' });
    }

    // Show which providers are configured
    const resendKey = (process.env.RESEND_API_KEY || '').trim();
    const sgKey = (process.env.SENDGRID_API_KEY || '').trim();
    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const gmailPass = (process.env.GMAIL_PASS || '').trim();

    const envDiagnostics = {
      RESEND_API_KEY: resendKey ? (resendKey.startsWith('re_') ? `✅ Set (${resendKey.substring(0, 8)}...)` : `⚠️ Set but doesn't start with re_`) : '❌ NOT SET',
      SENDGRID_API_KEY: sgKey ? (sgKey.startsWith('SG.') ? `✅ Set` : `⚠️ Set but doesn't start with SG.`) : '❌ NOT SET',
      GMAIL_USER: gmailUser ? `✅ Set (${gmailUser.substring(0, 5)}...)` : '❌ NOT SET',
      GMAIL_PASS: gmailPass ? `✅ Set (length: ${gmailPass.replace(/\s+/g,'').length} chars)` : '❌ NOT SET',
      FRONTEND_URL: process.env.FRONTEND_URL || '❌ NOT SET',
      SENDER_EMAIL: process.env.SENDER_EMAIL || '❌ NOT SET',
      willUseFallbackSandbox: !resendKey && !sgKey && !(gmailUser && gmailPass)
    };

    console.log('[Test Email] Environment diagnostics:', JSON.stringify(envDiagnostics, null, 2));

    try {
      const result = await sendEmail(
        to,
        'Shift Scheduler — SMTP Test',
        `<p>This is a test email sent at <strong>${new Date().toISOString()}</strong>.<br/>If you received this, email delivery is working correctly for <em>${to}</em>.</p>`
      );
      return res.json({
        success: result,
        sentTo: to,
        env: envDiagnostics,
        note: envDiagnostics.willUseFallbackSandbox
          ? 'WARNING: Using Ethereal sandbox — email NOT delivered to real inbox. Add RESEND_API_KEY to Render environment variables.'
          : 'Real email provider used. Check recipient inbox (and spam folder).'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message, env: envDiagnostics });
    }
  }
}
