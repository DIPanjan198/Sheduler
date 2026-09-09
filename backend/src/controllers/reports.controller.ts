import { Response } from 'express';
import { AuthRequest } from '../types';
import { ReportsService } from '../services/reports.service';

export class ReportsController {
  static async getHours(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const { start, end, userId } = req.query as { start?: string; end?: string; userId?: string };
      const report = await ReportsService.getHoursReport(req.user.businessId, { start, end, userId });
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'REPORT_FAILED', message: err.message || 'Failed to generate hours report' } });
    }
  }

  static async exportCsv(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const { start, end } = req.query as { start?: string; end?: string };
      const csv = await ReportsService.generateCsvExport(req.user.businessId, { start, end });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payroll-report-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'EXPORT_FAILED', message: err.message || 'Failed to generate CSV export' } });
    }
  }
}
