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

    // Run all relational cleanups in parallel for maximum speed
    await Promise.all([
      prisma.shift.updateMany({
        where: { assignedUserId: userId },
        data: { assignedUserId: null }
      }),
      prisma.timeClockEntry.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.timeOffRequest.deleteMany({ where: { userId } }),
      prisma.shiftSwapRequest.deleteMany({
        where: {
          OR: [
            { requestedByUserId: userId },
            { targetUserId: userId },
            { claimedByUserId: userId }
          ]
        }
      })
    ]);

    // Finally delete user profile permanently
    await prisma.user.delete({
      where: { id: userId }
    });

    return { message: 'Employee removed permanently' };
  }
}
