import { prisma } from './db.service';

export class TimeOffService {
  static async listRequests(businessId: string, userId: string, role: string, statusFilter?: string) {
    const where: any = { businessId };
    if (role === 'EMPLOYEE') {
      where.userId = userId;
    }
    if (statusFilter) {
      where.status = statusFilter;
    }

    return prisma.timeOffRequest.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createRequest(businessId: string, userId: string, data: { startDate: string; endDate: string; reason?: string }) {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      throw { status: 400, code: 'INVALID_DATE_RANGE', message: 'End date must be on or after start date' };
    }

    return prisma.timeOffRequest.create({
      data: {
        businessId,
        userId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: 'PENDING'
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });
  }

  static async approveRequest(businessId: string, managerUserId: string, requestId: string) {
    const req = await prisma.timeOffRequest.findFirst({
      where: { id: requestId, businessId }
    });

    if (!req) {
      throw { status: 404, code: 'REQUEST_NOT_FOUND', message: 'Time off request not found' };
    }

    return prisma.timeOffRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        reviewedBy: managerUserId,
        reviewedAt: new Date()
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });
  }

  static async denyRequest(businessId: string, managerUserId: string, requestId: string, managerNote?: string) {
    const req = await prisma.timeOffRequest.findFirst({
      where: { id: requestId, businessId }
    });

    if (!req) {
      throw { status: 404, code: 'REQUEST_NOT_FOUND', message: 'Time off request not found' };
    }

    return prisma.timeOffRequest.update({
      where: { id: requestId },
      data: {
        status: 'DENIED',
        reviewedBy: managerUserId,
        reviewedAt: new Date(),
        managerNote: managerNote || null
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });
  }

  static async cancelRequest(businessId: string, userId: string, requestId: string) {
    const req = await prisma.timeOffRequest.findFirst({
      where: { id: requestId, businessId, userId }
    });

    if (!req) {
      throw { status: 404, code: 'REQUEST_NOT_FOUND', message: 'Time off request not found' };
    }

    if (req.status !== 'PENDING') {
      throw { status: 400, code: 'CANNOT_CANCEL', message: 'Only pending time off requests can be cancelled' };
    }

    return prisma.timeOffRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' }
    });
  }
}
