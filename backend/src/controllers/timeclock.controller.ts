import { Response } from 'express';
import { AuthRequest } from '../types';
import { TimeClockService } from '../services/timeclock.service';

export class TimeClockController {
  static async punchIn(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const entry = await TimeClockService.punchIn(req.user.businessId, req.user.userId, req.body.location);
      return res.status(201).json(entry);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'PUNCH_IN_FAILED', message: err.message || 'Failed to punch in' } });
    }
  }

  static async punchOut(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const entry = await TimeClockService.punchOut(req.user.businessId, req.user.userId);
      return res.json(entry);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'PUNCH_OUT_FAILED', message: err.message || 'Failed to punch out' } });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const { userId: targetUserId, start, end } = req.query as { userId?: string; start?: string; end?: string };
      const entries = await TimeClockService.listEntries(req.user.businessId, req.user.userId, req.user.role, { targetUserId, start, end });
      return res.json(entries);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'TIMECLOCK_LIST_FAILED', message: err.message || 'Failed to list time entries' } });
    }
  }

  static async edit(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const entryId = req.params.id;
      const updated = await TimeClockService.managerEditEntry(req.user.businessId, entryId, req.body);
      return res.json(updated);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'TIMECLOCK_EDIT_FAILED', message: err.message || 'Failed to edit time entry' } });
    }
  }
}
