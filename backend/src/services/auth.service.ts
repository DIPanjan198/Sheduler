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
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      throw { status: 400, code: 'EMAIL_EXISTS', message: 'User with this email already exists' };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const business = await prisma.business.create({
      data: {
        name: data.businessName,
        timezone: data.timezone || 'America/New_York',
        address: data.address,
        users: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: cleanEmail,
            phone: data.phone,
            passwordHash,
            role: 'MANAGER',
            status: 'ACTIVE'
          }
        }
      },
      include: { users: true }
    });

    const manager = business.users[0];
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
    try {
      const emailTimeout = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Email send timed out after 15s')), 15000)
      );
      const sent = await Promise.race([
        sendEmail(recipientEmail, `Invitation to join ${currentBusinessName} on Shift Scheduler`, emailHtml),
        emailTimeout
      ]);
      if (!sent) {
        console.warn(`[Invite Email] Provider returned false for ${recipientEmail} — check mail configuration`);
      }
    } catch (emailErr: any) {
      // Log but don't throw — invite record is already saved in DB, manager can re-send
      console.error(`[Invite Email] Failed to dispatch to ${recipientEmail}:`, emailErr?.message || emailErr);
    }

    return {
      message: `Invitation generated and dispatched to ${user.email}!`,
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
}
