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
      // User is already deleted or not found — return success idempotently
      return { message: 'Employee removed permanently' };
    }
    if (user.businessId !== businessId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'User does not belong to your business' };
    }

    // Run all relational cleanups in parallel for maximum speed
    await Promise.all([
      // 1. Unassign user from any scheduled/completed shifts
      prisma.shift.updateMany({
        where: { assignedUserId: userId },
        data: { assignedUserId: null }
      }),
      // 2. Remove shifts created by this user (if any)
      prisma.shift.deleteMany({
        where: { createdBy: userId }
      }),
      // 3. Delete time clock entries
      prisma.timeClockEntry.deleteMany({ where: { userId } }),
      // 4. Delete notifications
      prisma.notification.deleteMany({ where: { userId } }),
      // 5. Delete notices authored by this user
      prisma.notice.deleteMany({ where: { authorId: userId } }),
      // 6. Delete time off requests requested by this user
      prisma.timeOffRequest.deleteMany({ where: { userId } }),
      // 7. Clear reviewer references on time off requests
      prisma.timeOffRequest.updateMany({
        where: { reviewedBy: userId },
        data: { reviewedBy: null }
      }),
      // 8. Delete shift swap requests requested, targeted, claimed, or reviewed
      prisma.shiftSwapRequest.deleteMany({
        where: {
          OR: [
            { requestedByUserId: userId },
            { targetUserId: userId },
            { claimedByUserId: userId },
            { reviewedBy: userId }
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
