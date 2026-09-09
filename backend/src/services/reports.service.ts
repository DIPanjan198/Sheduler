import { prisma } from './db.service';
import { calculateShiftHours } from '../utils/timezone';

export class ReportsService {
  static async getHoursReport(businessId: string, options: { start?: string; end?: string; userId?: string }) {
    const where: any = { businessId };
    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.start || options.end) {
      where.AND = [];
      if (options.start) where.AND.push({ clockInAt: { gte: new Date(options.start) } });
      if (options.end) where.AND.push({ clockInAt: { lte: new Date(options.end) } });
    }

    const entries = await prisma.timeClockEntry.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, hourlyRate: true } },
        shift: { select: { title: true } }
      },
      orderBy: { clockInAt: 'asc' }
    });

    const userSummaryMap = new Map<string, {
      user: { id: string; name: string; email: string; hourlyRate: number | null };
      totalShifts: number;
      totalHours: number;
      estimatedPay: number;
      flaggedCount: number;
      entries: any[];
    }>();

    for (const entry of entries) {
      const u = entry.user;
      const key = u.id;

      if (!userSummaryMap.has(key)) {
        userSummaryMap.set(key, {
          user: {
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            hourlyRate: u.hourlyRate
          },
          totalShifts: 0,
          totalHours: 0,
          estimatedPay: 0,
          flaggedCount: 0,
          entries: []
        });
      }

      const summary = userSummaryMap.get(key)!;
      let durationHours = 0;
      if (entry.clockInAt && entry.clockOutAt) {
        durationHours = calculateShiftHours(entry.clockInAt, entry.clockOutAt, 0);
      }

      summary.totalShifts += 1;
      summary.totalHours += durationHours;
      if (entry.status === 'FLAGGED') {
        summary.flaggedCount += 1;
      }
      if (u.hourlyRate) {
        summary.estimatedPay += durationHours * u.hourlyRate;
      }

      summary.entries.push({
        id: entry.id,
        clockInAt: entry.clockInAt,
        clockOutAt: entry.clockOutAt,
        durationHours,
        status: entry.status,
        flagReason: entry.flagReason,
        editedByManager: entry.editedByManager,
        shiftTitle: entry.shift?.title || 'Unscheduled'
      });
    }

    const userSummaries = Array.from(userSummaryMap.values()).map(s => ({
      ...s,
      totalHours: Math.round(s.totalHours * 100) / 100,
      estimatedPay: Math.round(s.estimatedPay * 100) / 100
    }));

    const totalHoursWorked = Math.round(userSummaries.reduce((acc, curr) => acc + curr.totalHours, 0) * 100) / 100;
    const totalPayroll = Math.round(userSummaries.reduce((acc, curr) => acc + curr.estimatedPay, 0) * 100) / 100;
    const totalFlaggedEntries = userSummaries.reduce((acc, curr) => acc + curr.flaggedCount, 0);

    return {
      summary: {
        totalEmployees: userSummaries.length,
        totalHoursWorked,
        totalPayroll,
        totalFlaggedEntries
      },
      userSummaries
    };
  }

  static async generateCsvExport(businessId: string, options: { start?: string; end?: string }) {
    const report = await this.getHoursReport(businessId, options);
    
    let csv = 'Employee ID,Employee Name,Email,Total Shifts,Total Hours Worked,Hourly Rate ($),Estimated Payroll ($),Flagged Entries\n';
    
    for (const item of report.userSummaries) {
      const u = item.user;
      const rate = u.hourlyRate !== null ? u.hourlyRate.toFixed(2) : 'N/A';
      const pay = item.estimatedPay.toFixed(2);
      csv += `"${u.id}","${u.name}","${u.email}",${item.totalShifts},${item.totalHours.toFixed(2)},${rate},${pay},${item.flaggedCount}\n`;
    }

    return csv;
  }
}
