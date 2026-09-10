import { Response } from 'express';
import { AuthRequest } from '../types';
import { UserService } from '../services/user.service';

export class UserController {
  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const users = await UserService.listEmployees(req.user.businessId);
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'USER_LIST_FAILED', message: err.message || 'Failed to list users' } });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const user = await UserService.getUserProfile(req.user.userId);
      return res.json(user);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'USER_ME_FAILED', message: err.message || 'Failed to fetch user' } });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const targetUserId = req.params.id;
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      
      // Employees can only update their own profile
      if (req.user.role !== 'MANAGER' && req.user.userId !== targetUserId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Cannot edit another user profile' } });
      }

      const updated = await UserService.updateUser(targetUserId, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'UPDATE_FAILED', message: err.message || 'Failed to update user' } });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const targetUserId = req.params.id;
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });

      if (req.user.userId === targetUserId) {
        return res.status(400).json({ error: { code: 'CANNOT_REMOVE_SELF', message: 'You cannot remove your own manager account' } });
      }

      // Check if caller explicitly requested disable only
      const isExplicitDisable = req.query.permanent === 'false' || req.query.action === 'disable' || req.query.mode === 'disable';

      if (isExplicitDisable) {
        await UserService.disableUser(targetUserId);
        return res.json({ message: 'Employee account disabled successfully' });
      }

      // Default: permanent removal
      await UserService.removeUser(req.user.businessId, targetUserId);
      return res.json({ message: 'Employee removed permanently' });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'DELETE_FAILED', message: err.message || 'Failed to remove user' } });
    }
  }

  static async disable(req: AuthRequest, res: Response) {
    try {
      const targetUserId = req.params.id;
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });

      if (req.user.userId === targetUserId) {
        return res.status(400).json({ error: { code: 'CANNOT_DISABLE_SELF', message: 'You cannot disable your own manager account' } });
      }

      await UserService.disableUser(targetUserId);
      return res.json({ message: 'Employee account disabled successfully' });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'DISABLE_FAILED', message: err.message || 'Failed to disable user' } });
    }
  }
}
