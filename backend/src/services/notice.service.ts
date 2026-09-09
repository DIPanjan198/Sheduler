import { prisma } from './db.service';

export class NoticeService {
  static async listNotices(businessId: string) {
    try {
      const notices = await prisma.notice.findMany({
        where: { businessId },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ]
      });
      return notices;
    } catch (err: any) {
      console.error('Notice query error, fallback executing:', err);
      try {
        const noticesRaw = await prisma.notice.findMany({
          where: { businessId }
        });
        noticesRaw.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return noticesRaw;
      } catch (fallbackErr) {
        return [];
      }
    }
  }

  static async createNotice(businessId: string, authorId: string, data: {
    title: string;
    content: string;
    priority?: string;
    isPinned?: boolean;
  }) {
    if (!data.title || !data.title.trim()) {
      throw { status: 400, code: 'INVALID_TITLE', message: 'Notice title is required' };
    }
    if (!data.content || !data.content.trim()) {
      throw { status: 400, code: 'INVALID_CONTENT', message: 'Notice content is required' };
    }

    const notice = await prisma.notice.create({
      data: {
        businessId,
        authorId,
        title: data.title.trim(),
        content: data.content.trim(),
        priority: data.priority || 'NORMAL',
        isPinned: data.isPinned || false
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    return notice;
  }

  static async updateNotice(businessId: string, noticeId: string, data: {
    title?: string;
    content?: string;
    priority?: string;
    isPinned?: boolean;
  }) {
    const existing = await prisma.notice.findUnique({ where: { id: noticeId } });
    if (!existing || existing.businessId !== businessId) {
      throw { status: 404, code: 'NOTICE_NOT_FOUND', message: 'Notice not found' };
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.content !== undefined) updateData.content = data.content.trim();
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;

    const updated = await prisma.notice.update({
      where: { id: noticeId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    return updated;
  }

  static async deleteNotice(businessId: string, noticeId: string) {
    const existing = await prisma.notice.findUnique({ where: { id: noticeId } });
    if (!existing || existing.businessId !== businessId) {
      throw { status: 404, code: 'NOTICE_NOT_FOUND', message: 'Notice not found' };
    }

    await prisma.notice.delete({
      where: { id: noticeId }
    });

    return { message: 'Notice deleted successfully' };
  }
}
