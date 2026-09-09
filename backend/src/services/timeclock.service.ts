import { prisma } from './db.service';

export class TimeClockService {
  /**
   * Punch in logic with automatic shift matching and flagging logic (SRS 5.4)
   */
  static async punchIn(businessId: string, userId: string, locationData?: any) {
    // 1. Check if user already has an active clock-in
    const activeEntry = await prisma.timeClockEntry.findFirst({
      where: { userId, businessId, status: 'ACTIVE' }
    });

    if (activeEntry) {
      throw { status: 400, code: 'ALREADY_CLOCKED_IN', message: 'You are already clocked in. Please punch out before clocking in again.' };
    }

    const now = new Date();

    // 2. Find matching scheduled shift within grace window (default 15 minutes = 900,000 ms)
    const graceMs = 15 * 60 * 1000;
    const windowStart = new Date(now.getTime() - graceMs);
    const windowEnd = new Date(now.getTime() + graceMs);

    const matchingShift = await prisma.shift.findFirst({
      where: {
        businessId,
        assignedUserId: userId,
        status: { in: ['SCHEDULED', 'COMPLETED'] },
        startAt: { gte: windowStart, lte: windowEnd }
      }
    });

    const isFlagged = !matchingShift;
    const flagReason = isFlagged ? 'No matching scheduled shift found within ±15 minutes grace window' : undefined;

    return prisma.timeClockEntry.create({
      data: {
        businessId,
        userId,
        shiftId: matchingShift ? matchingShift.id : null,
        clockInAt: now,
        status: isFlagged ? 'FLAGGED' : 'ACTIVE',
        flagReason: flagReason,
        clockInLocation: locationData ? JSON.stringify(locationData) : null
      },
      include: {
        shift: true,
        user: { select: { id: true, firstName: true, lastName: true } }
      }
    });
  }

  static async punchOut(businessId: string, userId: string) {
    const activeEntry = await prisma.timeClockEntry.findFirst({
      where: {
        userId,
        businessId,
        status: { in: ['ACTIVE', 'FLAGGED'] },
        clockOutAt: null
      }
    });

    if (!activeEntry) {
      throw { status: 400, code: 'NOT_CLOCKED_IN', message: 'You do not have an active clock-in session to punch out from.' };
    }

    const now = new Date();
    const finalStatus = activeEntry.status === 'FLAGGED' ? 'FLAGGED' : 'COMPLETED';

    return prisma.timeClockEntry.update({
      where: { id: activeEntry.id },
      data: {
        clockOutAt: now,
        status: finalStatus
      },
      include: {
        shift: true,
        user: { select: { id: true, firstName: true, lastName: true } }
      }
    });
  }

  static async listEntries(businessId: string, userId: string, role: string, filters: { targetUserId?: string; start?: string; end?: string }) {
    const where: any = { businessId };

    if (role === 'EMPLOYEE') {
      where.userId = userId;
    } else if (filters.targetUserId) {
      where.userId = filters.targetUserId;
    }

    if (filters.start || filters.end) {
      where.AND = [];
      if (filters.start) where.AND.push({ clockInAt: { gte: new Date(filters.start) } });
      if (filters.end) where.AND.push({ clockInAt: { lte: new Date(filters.end) } });
    }

    return prisma.timeClockEntry.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        shift: { select: { id: true, title: true, startAt: true, endAt: true } }
      },
      orderBy: { clockInAt: 'desc' }
    });
  }

  /**
   * Manager edit with required reason & preservation of original values (SRS 5.5)
   */
  static async managerEditEntry(businessId: string, entryId: string, data: {
    clockInAt?: string;
    clockOutAt?: string;
    editReason: string;
    status?: any;
  }) {
    if (!data.editReason || data.editReason.trim() === '') {
      throw { status: 400, code: 'EDIT_REASON_REQUIRED', message: 'A reason for editing the time entry is required for audit history' };
    }

    const existing = await prisma.timeClockEntry.findFirst({
      where: { id: entryId, businessId }
    });

    if (!existing) {
      throw { status: 404, code: 'ENTRY_NOT_FOUND', message: 'Time clock entry not found' };
    }

    // Preserve original timestamps if not already edited before
    const originalClockIn = existing.originalClockIn || existing.clockInAt;
    const originalClockOut = existing.originalClockOut || existing.clockOutAt;

    const newClockIn = data.clockInAt ? new Date(data.clockInAt) : existing.clockInAt;
    const newClockOut = data.clockOutAt ? new Date(data.clockOutAt) : existing.clockOutAt;

    return prisma.timeClockEntry.update({
      where: { id: entryId },
      data: {
        clockInAt: newClockIn,
        clockOutAt: newClockOut,
        editedByManager: true,
        originalClockIn,
        originalClockOut,
        editReason: data.editReason,
        status: data.status || 'COMPLETED'
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        shift: true
      }
    });
  }
}
