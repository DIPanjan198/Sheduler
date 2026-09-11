import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { prisma } from './db.service';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { TokenPayload } from '../types';
import { sendEmail } from '../utils/mailer';

export class AuthService {
  static async registerBusiness(data: {
    businessName: string;
    timezone: string;
    address?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const cleanEmail = data.email ? data.email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      throw { status: 400, code: 'EMAIL_REQUIRED', message: 'Valid email address is required' };
    }
    if (!data.businessName?.trim()) {
      throw { status: 400, code: 'BUSINESS_NAME_REQUIRED', message: 'Business name is required' };
    }
    if (!data.password || data.password.length < 6) {
      throw { status: 400, code: 'INVALID_PASSWORD', message: 'Password must be at least 6 characters long' };
    }

    let existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!existingUser) {
      const candidates = await prisma.user.findMany({ select: { id: true, email: true } });
      existingUser = candidates.find(u => u.email.toLowerCase() === cleanEmail) as any;
    }
    if (existingUser) {
      throw { status: 400, code: 'EMAIL_EXISTS', message: 'A user account with this email address already exists. Please sign in instead.' };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const business = await prisma.business.create({
      data: {
        name: data.businessName.trim(),
        timezone: data.timezone || 'America/New_York',
        address: data.address,
        users: {
          create: {
            firstName: data.firstName?.trim() || '',
            lastName: data.lastName?.trim() || '',
            email: cleanEmail,
            phone: data.phone || '',
            passwordHash,
            role: 'MANAGER',
            status: 'ACTIVE'
          }
        }
      },
      include: { users: true }
    });

    let manager = business.users?.[0];
    if (!manager) {
      manager = await prisma.user.findFirst({ where: { businessId: business.id } }) as any;
    }
    if (!manager) {
      throw { status: 500, code: 'REGISTRATION_ERROR', message: 'Business created but manager account could not be initialized' };
    }

    const payload: TokenPayload = {
      userId: manager.id,
      businessId: business.id,
      role: 'MANAGER',
      email: manager.email
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      business: {
        id: business.id,
        name: business.name,
        timezone: business.timezone
      },
      user: {
        id: manager.id,
        firstName: manager.firstName,
        lastName: manager.lastName,
        email: manager.email,
        role: manager.role,
        businessId: business.id,
        businessName: business.name,
        timezone: business.timezone
      },
      tokens: { accessToken, refreshToken }
    };
  }

  static async login(email: string, password: string) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const rawEmail = email ? email.trim() : '';

    if (!cleanEmail || !password) {
      throw { status: 400, code: 'INVALID_CREDENTIALS', message: 'Email and password are required' };
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { business: true }
    });

    if (!user && rawEmail && rawEmail !== cleanEmail) {
      user = await prisma.user.findUnique({
        where: { email: rawEmail },
        include: { business: true }
      });
    }

    if (!user) {
      const candidates = await prisma.user.findMany({
        select: { id: true, email: true }
      });
      const match = candidates.find(u => u.email.toLowerCase() === cleanEmail);
      if (match) {
        user = await prisma.user.findUnique({
          where: { id: match.id },
          include: { business: true }
        });
      }
    }

    if (!user) {
      console.warn(`[Auth] No user found with email: "${cleanEmail}"`);
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }

    if (user.status === 'DISABLED') {
      console.warn(`[Auth] User account "${cleanEmail}" is disabled`);
      throw { status: 401, code: 'ACCOUNT_DISABLED', message: 'This account has been disabled by your administrator' };
    }

    if (user.status === 'INVITED') {
      console.warn(`[Auth] User account "${cleanEmail}" has not accepted invite`);
      throw { status: 401, code: 'ACCOUNT_INVITED', message: 'This account has been invited but not activated yet. Please check your email and click the invitation link to set your password.' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.warn(`[Auth] Password mismatch for user: "${cleanEmail}"`);
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }

    const payload: TokenPayload = {
      userId: user.id,
      businessId: user.businessId,
      role: user.role as any,
      email: user.email
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const businessObj = (user as any).business;
    const businessName = businessObj?.name || 'Business';
    const timezone = businessObj?.timezone || 'America/New_York';

    return {
      business: {
        id: businessObj?.id || user.businessId,
        name: businessName,
        timezone: timezone
      },
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessId: user.businessId,
        businessName: businessName,
        timezone: timezone
      },
      tokens: { accessToken, refreshToken }
    };
  }

  static async inviteEmployee(businessId: string, data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role?: 'EMPLOYEE' | 'MANAGER';
    hourlyRate?: number | string;
  }, origin?: string) {
    let business: any = null;
    try {
      if (businessId) {
        business = await prisma.business.findUnique({ where: { id: businessId } });
      }
    } catch (err) {}

    if (!business) {
      throw { status: 400, code: 'BUSINESS_NOT_FOUND', message: 'Your business account session is expired or invalid. Please click Log Out (top right) and Sign In again.' };
    }

    let hourlyRateVal: number | null = null;
    if (data.hourlyRate !== undefined && data.hourlyRate !== null && data.hourlyRate !== '') {
      const parsed = typeof data.hourlyRate === 'number' ? data.hourlyRate : parseFloat(data.hourlyRate);
      if (!isNaN(parsed)) {
        hourlyRateVal = parsed;
      }
    }

    const cleanEmail = data.email ? data.email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      throw { status: 400, code: 'EMAIL_REQUIRED', message: 'Valid email address is required' };
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    let user: any = null;

    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw { status: 400, code: 'USER_ACTIVE', message: `An active account already exists for email address ${cleanEmail}.` };
      }
      
      // Update existing invited/disabled user with fresh invite details & token
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          businessId,
          firstName: data.firstName || existing.firstName,
          lastName: data.lastName || existing.lastName,
          phone: data.phone || existing.phone,
          role: data.role || existing.role,
          status: 'INVITED',
          hourlyRate: hourlyRateVal !== null ? hourlyRateVal : existing.hourlyRate,
          inviteToken
        }
      });
    } else {
      const dummyHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      user = await prisma.user.create({
        data: {
          businessId,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: cleanEmail,
          phone: data.phone || '',
          passwordHash: dummyHash,
          role: data.role || 'EMPLOYEE',
          status: 'INVITED',
          hourlyRate: hourlyRateVal,
          inviteToken
        }
      });
    }

    const baseUrl = process.env.FRONTEND_URL || origin || 'http://localhost:3000';
    const inviteUrl = `${baseUrl.replace(/\/+$/, '')}/accept-invite?token=${inviteToken}`;
    
    // Create database Notification log for the user account
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'INVITATION',
          channel: 'EMAIL',
          payload: JSON.stringify({
            businessId: business.id,
            businessName: business.name,
            role: user.role,
            inviteUrl,
            message: `Invitation sent to ${user.email} to join ${business.name}`
          }),
          status: 'SENT',
          sentAt: new Date()
        }
      });
    } catch (notifErr) {
      console.warn('[Notification Log] Could not save in-app notification record:', notifErr);
    }

    // Dispatch real-time email
    const emailHtml = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; background-color: #f8fafc; border-radius: 16px; max-width: 580px; margin: 0 auto; color: #0f172a; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; width: 56px; height: 56px; border-radius: 16px; font-size: 24px; font-weight: 800; line-height: 56px; margin: 0 auto; text-align: center; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">SS</div>
          <h2 style="color: #1e1b4b; margin-top: 16px; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">You're invited to join ${business.name}</h2>
        </div>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">Your manager has invited you to join the team account for <strong>${business.name}</strong> as a <strong>${user.role}</strong> on Shift Scheduler.</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${inviteUrl}" style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35); transition: all 0.2s ease;">Accept Invitation & Activate Account</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${inviteUrl}" style="color: #4f46e5; word-break: break-all; font-weight: 500;">${inviteUrl}</a></p>
      </div>
    `;

    const recipientEmail: string = user.email;
    const currentBusinessName: string = business.name;

    // Send email synchronously before responding — this guarantees delivery.
    // setImmediate/background dispatch was causing intermittent failures because
    // the process can be suspended by the cloud host right after the HTTP response.
    // A 15-second timeout prevents the invite API from hanging if the mail provider is slow.
    let emailSent = false;
    try {
      const emailTimeout = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Email send timed out after 15s')), 15000)
      );
      const sent = await Promise.race([
        sendEmail(recipientEmail, `Invitation to join ${currentBusinessName} on Shift Scheduler`, emailHtml),
        emailTimeout
      ]);
      emailSent = Boolean(sent);
      if (!emailSent) {
        console.warn(`[Invite Email] Provider returned false for ${recipientEmail} — check mail configuration`);
      }
    } catch (emailErr: any) {
      console.error(`[Invite Email] Failed to dispatch to ${recipientEmail}:`, emailErr?.message || emailErr);
      emailSent = false;
    }

    return {
      emailSent,
      message: emailSent
        ? `Invitation email dispatched to ${user.email}!`
        : `Invitation generated! Share the activation link with ${user.firstName}.`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        inviteToken: user.inviteToken,
        inviteUrl
      }
    };
  }

  static async acceptInvite(inviteToken: string, password: string) {
    const cleanToken = inviteToken ? inviteToken.trim() : '';
    const user = await prisma.user.findFirst({
      where: { inviteToken: cleanToken, status: 'INVITED' },
      include: { business: true }
    });

    if (!user) {
      throw { status: 400, code: 'INVALID_TOKEN', message: 'Invalid or expired invitation token. It may have already been used.' };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: 'ACTIVE',
        inviteToken: null
      }
    });

    const payload: TokenPayload = {
      userId: updatedUser.id,
      businessId: updatedUser.businessId,
      role: updatedUser.role as any,
      email: updatedUser.email
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const businessObj = (user as any).business;
    const businessName = businessObj?.name || 'Business';
    const timezone = businessObj?.timezone || 'America/New_York';

    return {
      business: {
        id: businessObj?.id || user.businessId,
        name: businessName,
        timezone: timezone
      },
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        businessId: user.businessId,
        businessName: businessName,
        timezone: timezone
      },
      tokens: { accessToken, refreshToken }
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD / OTP FUNCTIONALITY
  // ─────────────────────────────────────────────────────────────────────────────

  static async requestPasswordResetOtp(email: string) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      throw { status: 400, code: 'EMAIL_REQUIRED', message: 'Email address is required' };
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      const candidates = await prisma.user.findMany({
        select: { id: true, email: true, status: true, firstName: true }
      });
      const match = candidates.find(u => u.email.toLowerCase() === cleanEmail);
      if (match) {
        user = await prisma.user.findUnique({ where: { id: match.id } });
      }
    }

    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: `No account found with email "${cleanEmail}". Please check your email address.` };
    }

    if (user.status === 'DISABLED') {
      throw { status: 403, code: 'ACCOUNT_DISABLED', message: 'This account has been disabled. Please contact your manager.' };
    }

    // Rate-limiting check: 45 seconds cooldown
    const existing = passwordResetStore.get(cleanEmail);
    if (existing && existing.requestedAt && Date.now() - existing.requestedAt < 45000) {
      const secondsLeft = Math.ceil((45000 - (Date.now() - existing.requestedAt)) / 1000);
      throw { status: 429, code: 'TOO_MANY_REQUESTS', message: `Please wait ${secondsLeft} seconds before requesting a new OTP.` };
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in-memory
    passwordResetStore.set(cleanEmail, {
      otp,
      expiresAt,
      attempts: 0,
      requestedAt: Date.now()
    });

    // Also persist in DB as fallback
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { inviteToken: `RESET_OTP:${otp}:${expiresAt}` }
      });
    } catch (dbErr) {
      console.warn('[Forgot Password] Could not write OTP token to DB:', dbErr);
    }

    // Render modern HTML email template
    const emailHtml = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; background-color: #f8fafc; border-radius: 16px; max-width: 540px; margin: 0 auto; color: #0f172a; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; width: 56px; height: 56px; border-radius: 16px; font-size: 24px; font-weight: 800; line-height: 56px; margin: 0 auto; text-align: center; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">SS</div>
          <h2 style="color: #1e1b4b; margin-top: 16px; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Password Reset Code</h2>
        </div>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">Hello <strong>${user.firstName}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">You requested to reset your password for Shift Scheduler. Use the verification code below to set a new password:</p>
        
        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background: #eef2ff; border: 2px dashed #6366f1; border-radius: 14px; padding: 16px 36px;">
            <span style="font-family: monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #4338ca;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 12px; font-weight: 500;">This verification code is valid for <strong>10 minutes</strong>.</p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Shift Scheduler &bull; Enterprise Staff Scheduling & Time Clock</p>
      </div>
    `;

    // Dispatch email
    let emailSent = false;
    try {
      const emailTimeout = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Email delivery timed out after 15s')), 15000)
      );
      const sent = await Promise.race([
        sendEmail(user.email, 'Your Password Reset Code — Shift Scheduler', emailHtml),
        emailTimeout
      ]);
      emailSent = Boolean(sent);
    } catch (sendErr: any) {
      console.error(`[Forgot Password] Failed to deliver OTP to ${cleanEmail}:`, sendErr.message || sendErr);
      emailSent = false;
    }

    return {
      success: true,
      emailSent,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox and spam folder.`
    };
  }

  static async verifyAndResetPassword(email: string, otp: string, newPassword: string) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanOtp = otp ? otp.trim().replace(/\s+/g, '') : '';

    if (!cleanEmail) {
      throw { status: 400, code: 'EMAIL_REQUIRED', message: 'Email address is required' };
    }
    if (!cleanOtp || cleanOtp.length !== 6) {
      throw { status: 400, code: 'OTP_REQUIRED', message: 'Valid 6-digit verification code is required' };
    }
    if (!newPassword || newPassword.length < 6) {
      throw { status: 400, code: 'PASSWORD_TOO_SHORT', message: 'New password must be at least 6 characters long' };
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      const candidates = await prisma.user.findMany({
        select: { id: true, email: true, status: true, inviteToken: true }
      });
      const match = candidates.find(u => u.email.toLowerCase() === cleanEmail);
      if (match) {
        user = await prisma.user.findUnique({ where: { id: match.id } });
      }
    }

    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'No account found with this email address' };
    }

    if (user.status === 'DISABLED') {
      throw { status: 403, code: 'ACCOUNT_DISABLED', message: 'This account has been disabled. Please contact your administrator.' };
    }

    // Verify OTP from memory store or DB token fallback
    const cached = passwordResetStore.get(cleanEmail);
    let matched = false;
    let isExpired = false;

    if (cached) {
      if (Date.now() > cached.expiresAt) {
        isExpired = true;
        passwordResetStore.delete(cleanEmail);
      } else if (cached.attempts >= 5) {
        passwordResetStore.delete(cleanEmail);
        throw { status: 400, code: 'MAX_ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Please request a new verification code.' };
      } else if (cached.otp === cleanOtp) {
        matched = true;
      } else {
        cached.attempts += 1;
      }
    }

    // Fallback to database stored OTP if server restarted
    if (!matched && !isExpired && user.inviteToken && user.inviteToken.startsWith('RESET_OTP:')) {
      const parts = user.inviteToken.split(':');
      if (parts.length === 3) {
        const dbOtp = parts[1];
        const dbExpiresAt = parseInt(parts[2], 10);
        if (Date.now() <= dbExpiresAt && dbOtp === cleanOtp) {
          matched = true;
        } else if (Date.now() > dbExpiresAt) {
          isExpired = true;
        }
      }
    }

    if (isExpired) {
      throw { status: 400, code: 'OTP_EXPIRED', message: 'Verification code has expired. Please request a new code.' };
    }

    if (!matched) {
      throw { status: 400, code: 'INVALID_OTP', message: 'Invalid verification code. Please check the 6-digit code in your email and try again.' };
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: user.status === 'INVITED' ? 'ACTIVE' : user.status,
        inviteToken: null
      }
    });

    // Clear reset cache
    passwordResetStore.delete(cleanEmail);

    console.log(`[Forgot Password] Password successfully reset for "${cleanEmail}"`);

    return {
      success: true,
      message: 'Password updated successfully! You can now sign in with your new password.'
    };
  }
}

// In-memory cache for OTP storage
interface PasswordResetStoreItem {
  otp: string;
  expiresAt: number;
  attempts: number;
  requestedAt: number;
}
const passwordResetStore = new Map<string, PasswordResetStoreItem>();
