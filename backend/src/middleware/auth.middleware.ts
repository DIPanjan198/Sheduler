import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../services/db.service';

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication token missing or invalid' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);

    // Verify the user still exists in the database (catches deleted employees)
    const userExists = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true }
    });

    if (!userExists) {
      return res.status(401).json({ error: { code: 'ACCOUNT_DELETED', message: 'Your account no longer exists. Please contact your manager.' } });
    }

    if (userExists.status === 'DISABLED') {
      return res.status(401).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Your account has been disabled. Please contact your manager.' } });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Token is invalid or expired' } });
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permission for this action' } });
    }

    next();
  };
};
