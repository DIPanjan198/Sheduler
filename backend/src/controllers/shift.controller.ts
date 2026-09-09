import { Response } from 'express';
import { AuthRequest } from '../types';
import { ShiftService } from '../services/shift.service';

export class ShiftController {
  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      
      const { start, end, userId } = req.query as { start?: string; end?: string; userId?: string };
      const shifts = await ShiftService.listShifts(req.user.businessId, {
        start,
        end,
        userId,
        role: req.user.role,
        requestingUserId: req.user.userId
      });

      return res.json(shifts);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'SHIFT_LIST_FAILED', message: err.message || 'Failed to list shifts' } });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const result = await ShiftService.createShift(req.user.businessId, req.user.userId, req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'SHIFT_CREATE_FAILED', message: err.message || 'Failed to create shift' } });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const shiftId = req.params.id;
      const updated = await ShiftService.updateShift(req.user.businessId, shiftId, req.body);
      return res.json(updated);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'SHIFT_UPDATE_FAILED', message: err.message || 'Failed to update shift' } });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const shiftId = req.params.id;
      const result = await ShiftService.deleteShift(req.user.businessId, shiftId);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'SHIFT_DELETE_FAILED', message: err.message || 'Failed to delete shift' } });
    }
  }
}
