import { Response } from 'express';
import { AuthRequest } from '../types';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const targetUserId = req.query.userId as string;
      const notifications = await NotificationService.listUserNotifications(req.user.userId, req.user.role, targetUserId);
      return res.json(notifications);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'NOTIF_LIST_FAILED', message: err.message || 'Failed to list notifications' } });
    }
  }

  static async triggerReminderJob(req: AuthRequest, res: Response) {
    try {
      await NotificationService.processUpcomingShiftReminders();
      return res.json({ message: 'Shift reminder background job completed successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'JOB_FAILED', message: err.message || 'Reminder job failed' } });
    }
  }
}
