import { prisma } from './db.service';

export class ShiftService {
  /**
   * Check for overlapping shifts for the same assigned user.
   * Returns conflicting shift if found, null otherwise.
   */
  static async findOverlappingShift(businessId: string, assignedUserId: string, startAt: Date, endAt: Date, excludeShiftId?: string) {
    if (!assignedUserId) return null;

    const where: any = {
      businessId,
      assignedUserId,
      status: { not: 'CANCELLED' },
      AND: [
        { startAt: { lt: endAt } },
        { endAt: { gt: startAt } }
      ]
    };

    if (excludeShiftId) {
      where.id = { not: excludeShiftId };
    }

    return prisma.shift.findFirst({
      where,
      include: {
        assignedUser: { select: { firstName: true, lastName: true } }
      }
    });
  }

  /**
   * Check if assigned employee has approved time off during shift period
   */
  static async checkTimeOffConflict(businessId: string, assignedUserId: string, startAt: Date, endAt: Date) {
    if (!assignedUserId) return null;

    const shiftStartIso = startAt.toISOString().split('T')[0];
    const shiftEndIso = endAt.toISOString().split('T')[0];

    return prisma.timeOffRequest.findFirst({
      where: {
        businessId,
        userId: assignedUserId,
        status: 'APPROVED',
        AND: [
          { startDate: { lte: shiftEndIso } },
          { endDate: { gte: shiftStartIso } }
        ]
      }
    });
  }

  static async listShifts(businessId: string, options: { start?: string; end?: string; userId?: string; role: string; requestingUserId: string }) {
    const where: any = { businessId };

    // Employee role can only see their own shifts unless browsing open shifts
    if (options.role === 'EMPLOYEE') {
      where.OR = [
        { assignedUserId: options.requestingUserId },
        { assignedUserId: null }
      ];
    } else if (options.userId) {
      where.assignedUserId = options.userId;
    }

    if (options.start || options.end) {
      where.AND = [];
      if (options.start) {
        where.AND.push({ startAt: { gte: new Date(options.start) } });
      }
      if (options.end) {
        where.AND.push({ endAt: { lte: new Date(options.end) } });
      }
    }

    return prisma.shift.findMany({
      where,
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        creator: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { startAt: 'asc' }
    });
  }

  static async createShift(businessId: string, managerUserId: string, data: {
    title: string;
    assignedUserId?: string | null;
    startAt: string | Date;
    endAt: string | Date;
    breakMinutes?: number;
    notes?: string;
  }) {
    const startAt = new Date(data.startAt);
    const endAt = new Date(data.endAt);

    if (endAt <= startAt) {
      throw { status: 400, code: 'INVALID_TIME_RANGE', message: 'Shift end time must be after start time' };
    }

    // 1. Overlap conflict check
    if (data.assignedUserId) {
      const conflict = await this.findOverlappingShift(businessId, data.assignedUserId, startAt, endAt);
      if (conflict) {
        throw {
          status: 409,
          code: 'SHIFT_OVERLAP_CONFLICT',
          message: `Double-booking conflict: User already has shift "${conflict.title}" from ${conflict.startAt.toISOString()} to ${conflict.endAt.toISOString()}`
        };
      }
    }

    // 2. Check time off warning flag
    let timeOffWarning = false;
    let timeOffWarningMessage = '';
    if (data.assignedUserId) {
      const timeOff = await this.checkTimeOffConflict(businessId, data.assignedUserId, startAt, endAt);
      if (timeOff) {
        timeOffWarning = true;
        timeOffWarningMessage = `Employee has approved time off from ${timeOff.startDate} to ${timeOff.endDate}`;
      }
    }

    const shift = await prisma.shift.create({
      data: {
        businessId,
        title: data.title,
        assignedUserId: data.assignedUserId || null,
        startAt,
        endAt,
        breakMinutes: data.breakMinutes || 0,
        notes: data.notes,
        createdBy: managerUserId,
        status: 'SCHEDULED'
      },
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    return { shift, timeOffWarning, timeOffWarningMessage };
  }

  static async updateShift(businessId: string, shiftId: string, data: {
    title?: string;
    assignedUserId?: string | null;
    startAt?: string | Date;
    endAt?: string | Date;
    breakMinutes?: number;
    notes?: string;
    status?: any;
  }) {
    const existingShift = await prisma.shift.findFirst({
      where: { id: shiftId, businessId }
    });

    if (!existingShift) {
      throw { status: 404, code: 'SHIFT_NOT_FOUND', message: 'Shift not found' };
    }

    const startAt = data.startAt ? new Date(data.startAt) : existingShift.startAt;
    const endAt = data.endAt ? new Date(data.endAt) : existingShift.endAt;

    if (endAt <= startAt) {
      throw { status: 400, code: 'INVALID_TIME_RANGE', message: 'Shift end time must be after start time' };
    }

    const assignedUserId = data.assignedUserId !== undefined ? data.assignedUserId : existingShift.assignedUserId;

    // Overlap conflict check on re-assignment or time change
    if (assignedUserId) {
      const conflict = await this.findOverlappingShift(businessId, assignedUserId, startAt, endAt, shiftId);
      if (conflict) {
        throw {
          status: 409,
          code: 'SHIFT_OVERLAP_CONFLICT',
          message: `Double-booking conflict: User already has shift "${conflict.title}" from ${conflict.startAt.toISOString()} to ${conflict.endAt.toISOString()}`
        };
      }
    }

    const updated = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        title: data.title || existingShift.title,
        assignedUserId,
        startAt,
        endAt,
        breakMinutes: data.breakMinutes !== undefined ? data.breakMinutes : existingShift.breakMinutes,
        notes: data.notes !== undefined ? data.notes : existingShift.notes,
        status: data.status || existingShift.status
      },
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    return updated;
  }

  static async deleteShift(businessId: string, shiftId: string) {
    const existing = await prisma.shift.findFirst({ where: { id: shiftId, businessId } });
    if (!existing) {
      throw { status: 404, code: 'SHIFT_NOT_FOUND', message: 'Shift not found' };
    }

    // Auto-cancel any pending swap requests tied to this shift (SRS Section 5.7)
    await prisma.shiftSwapRequest.updateMany({
      where: { originalShiftId: shiftId, status: { in: ['OPEN', 'CLAIMED'] } },
      data: { status: 'CANCELLED' }
    });

    await prisma.shift.delete({ where: { id: shiftId } });
    return { message: 'Shift deleted successfully and pending swaps auto-cancelled' };
  }
}
