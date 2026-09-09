import { prisma } from './db.service';

export class UserService {
  static async listEmployees(businessId: string) {
    return prisma.user.findMany({
      where: { businessId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        hourlyRate: true,
        notificationPrefs: true,
        createdAt: true
      },
      orderBy: { firstName: 'asc' }
    });
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true }
    });

    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'User not found' };
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      hourlyRate: user.hourlyRate,
      notificationPrefs: JSON.parse(user.notificationPrefs || '{"smsEnabled":true,"emailEnabled":true}'),
      business: {
        id: user.business.id,
        name: user.business.name,
        timezone: user.business.timezone,
        reminderLeadTimeMinutes: user.business.reminderLeadTimeMinutes
      }
    };
  }

  static async updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    hourlyRate?: number;
    notificationPrefs?: { smsEnabled?: boolean; emailEnabled?: boolean };
  }) {
    const updateData: any = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.phone) updateData.phone = data.phone;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
    if (data.notificationPrefs) {
      updateData.notificationPrefs = JSON.stringify(data.notificationPrefs);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      hourlyRate: updated.hourlyRate,
      notificationPrefs: JSON.parse(updated.notificationPrefs || '{"smsEnabled":true,"emailEnabled":true}')
    };
  }

  static async disableUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: 'DISABLED' }
    });
  }

  static async removeUser(businessId: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'Employee not found' };
    }
    if (user.businessId !== businessId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'User does not belong to your business' };
    }

    // 1. Unassign shifts assigned to this user
    await prisma.shift.updateMany({
      where: { assignedUserId: userId },
      data: { assignedUserId: null }
    });

    // 2. Delete associated time clock entries, notifications, time off requests, shift swaps
    await prisma.timeClockEntry.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.timeOffRequest.deleteMany({ where: { userId } });
    await prisma.shiftSwapRequest.deleteMany({
      where: {
        OR: [
          { requestedByUserId: userId },
          { targetUserId: userId },
          { claimedByUserId: userId }
        ]
      }
    });

    // 3. Delete user profile permanently
    await prisma.user.delete({
      where: { id: userId }
    });

    return { message: 'Employee removed permanently' };
  }
}
