import { Response } from 'express';
import { AuthRequest } from '../types';
import { NoticeService } from '../services/notice.service';

export class NoticeController {
  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const notices = await NoticeService.listNotices(req.user.businessId);
      return res.json(notices);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: { code: err.code || 'NOTICE_LIST_FAILED', message: err.message || 'Failed to list notices' } });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const notice = await NoticeService.createNotice(req.user.businessId, req.user.userId, req.body);
      return res.status(201).json(notice);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: { code: err.code || 'NOTICE_CREATE_FAILED', message: err.message || 'Failed to create notice' } });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const updated = await NoticeService.updateNotice(req.user.businessId, req.params.id, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: { code: err.code || 'NOTICE_UPDATE_FAILED', message: err.message || 'Failed to update notice' } });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const result = await NoticeService.deleteNotice(req.user.businessId, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: { code: err.code || 'NOTICE_DELETE_FAILED', message: err.message || 'Failed to delete notice' } });
    }
  }
}
