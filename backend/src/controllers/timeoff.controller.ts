import { Response } from 'express';
import { AuthRequest } from '../types';
import { TimeOffService } from '../services/timeoff.service';

export class TimeOffController {
  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const statusFilter = req.query.status as string;
      const requests = await TimeOffService.listRequests(req.user.businessId, req.user.userId, req.user.role, statusFilter);
      return res.json(requests);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'TIMEOFF_LIST_FAILED', message: err.message || 'Failed to list requests' } });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const created = await TimeOffService.createRequest(req.user.businessId, req.user.userId, req.body);
      return res.status(201).json(created);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'TIMEOFF_CREATE_FAILED', message: err.message || 'Failed to create request' } });
    }
  }

  static async approve(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const requestId = req.params.id;
      const result = await TimeOffService.approveRequest(req.user.businessId, req.user.userId, requestId);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'TIMEOFF_APPROVE_FAILED', message: err.message || 'Failed to approve request' } });
    }
  }

  static async deny(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const requestId = req.params.id;
      const { managerNote } = req.body;
      const result = await TimeOffService.denyRequest(req.user.businessId, req.user.userId, requestId, managerNote);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'TIMEOFF_DENY_FAILED', message: err.message || 'Failed to deny request' } });
    }
  }

  static async cancel(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const requestId = req.params.id;
      const result = await TimeOffService.cancelRequest(req.user.businessId, req.user.userId, requestId);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'TIMEOFF_CANCEL_FAILED', message: err.message || 'Failed to cancel request' } });
    }
  }
}
