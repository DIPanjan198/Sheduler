import { prisma } from './db.service';

export class NotificationService {
  /**
   * Dispatch a notification to a user with fallback SMS -> Email
   */
  static async sendNotification(userId: string, type: string, payload: any, preferredChannel: 'SMS' | 'EMAIL' = 'SMS') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    let prefs = { smsEnabled: true, emailEnabled: true };
    try {
      if (user.notificationPrefs) {
        prefs = JSON.parse(user.notificationPrefs);
      }
    } catch (e) {}

    let chosenChannel = preferredChannel;
    if (chosenChannel === 'SMS' && !prefs.smsEnabled) {
      chosenChannel = 'EMAIL';
    }

    if (chosenChannel === 'EMAIL' && !prefs.emailEnabled) {
      // User opted out of both
      return null;
    }

    console.log(`[Notification Dispatch] Sent ${type} to User ${user.email} (${user.phone}) via ${chosenChannel}:`, payload);

    return prisma.notification.create({
      data: {
        userId,
        type: type as any,
        channel: chosenChannel as any,
        payload: JSON.stringify(payload),
        status: 'SENT',
        sentAt: new Date()
      }
    });
  }

  /**
   * Idempotent shift reminder job runner (SRS Section 5 Rule 6 & 7.2)
   */
  static async processUpcomingShiftReminders() {
    // 1. Fetch all active businesses
    const businesses = await prisma.business.findMany();

    for (const b of businesses) {
      const leadTimeMs = (b.reminderLeadTimeMinutes || 120) * 60 * 1000;
      const now = new Date();
      const targetTime = new Date(now.getTime() + leadTimeMs);

      // Find shifts starting within [now, targetTime] that have an assigned user
      const upcomingShifts = await prisma.shift.findMany({
        where: {
          businessId: b.id,
          assignedUserId: { not: null },
          status: 'SCHEDULED',
          startAt: { gte: now, lte: targetTime }
        },
        include: { assignedUser: true }
      });

      for (const shift of upcomingShifts) {
        if (!shift.assignedUserId) continue;

        // Idempotency check: verify no SHIFT_REMINDER notification exists for this shift & user
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: shift.assignedUserId,
            type: 'SHIFT_REMINDER',
            payload: { contains: shift.id }
          }
        });

        if (!existingNotif) {
          await this.sendNotification(
            shift.assignedUserId,
            'SHIFT_REMINDER',
            {
              shiftId: shift.id,
              title: shift.title,
              startAt: shift.startAt,
              endAt: shift.endAt,
              message: `Reminder: You have an upcoming shift "${shift.title}" starting at ${shift.startAt.toISOString()}`
            },
            'SMS'
          );
        }
      }
    }
  }

  static async listUserNotifications(userId: string, role: string, targetUserId?: string) {
    const queryUserId = (role === 'MANAGER' && targetUserId) ? targetUserId : userId;

    const notifs = await prisma.notification.findMany({
      where: { userId: queryUserId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return notifs.map(n => ({
      ...n,
      payload: JSON.parse(n.payload || '{}')
    }));
  }
}
