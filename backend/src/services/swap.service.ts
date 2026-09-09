import { prisma } from './db.service';

export class SwapService {
  static async listSwaps(businessId: string, statusFilter?: string) {
    const where: any = { originalShift: { businessId } };
    if (statusFilter) {
      where.status = statusFilter;
    }

    return prisma.shiftSwapRequest.findMany({
      where,
      include: {
        originalShift: {
          include: { assignedUser: { select: { id: true, firstName: true, lastName: true } } }
        },
        requestedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        targetUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        claimedByUser: { select: { id: true, firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async proposeSwap(businessId: string, userId: string, data: { shiftId: string; targetUserId?: string }) {
    // 1. Verify shift exists and belongs to user
    const shift = await prisma.shift.findFirst({
      where: { id: data.shiftId, businessId, assignedUserId: userId }
    });

    if (!shift) {
      throw { status: 404, code: 'SHIFT_NOT_FOUND', message: 'Shift not found or you are not assigned to this shift' };
    }

    // 2. Check for active swap request on this shift (Checklist 5.9: No double-swapped)
    const existingActiveSwap = await prisma.shiftSwapRequest.findFirst({
      where: { originalShiftId: data.shiftId, status: { in: ['OPEN', 'CLAIMED'] } }
    });

    if (existingActiveSwap) {
      throw { status: 400, code: 'SWAP_ALREADY_EXISTS', message: 'There is already an active swap request for this shift' };
    }

    // Update shift status to SWAP_PENDING
    await prisma.shift.update({
      where: { id: data.shiftId },
      data: { status: 'SWAP_PENDING' }
    });

    return prisma.shiftSwapRequest.create({
      data: {
        originalShiftId: data.shiftId,
        requestedByUserId: userId,
        targetUserId: data.targetUserId || null,
        status: 'OPEN'
      },
      include: {
        originalShift: true,
        requestedByUser: { select: { id: true, firstName: true, lastName: true } }
      }
    });
  }

  static async claimSwap(businessId: string, claimingUserId: string, swapId: string) {
    const swap = await prisma.shiftSwapRequest.findUnique({
      where: { id: swapId },
      include: { originalShift: true }
    });

    if (!swap || swap.originalShift.businessId !== businessId) {
      throw { status: 404, code: 'SWAP_NOT_FOUND', message: 'Swap request not found' };
    }

    if (swap.status !== 'OPEN') {
      throw { status: 400, code: 'SWAP_NOT_OPEN', message: 'This swap offer is no longer open' };
    }

    if (swap.requestedByUserId === claimingUserId) {
      throw { status: 400, code: 'CANNOT_CLAIM_OWN', message: 'You cannot claim your own shift swap request' };
    }

    if (swap.targetUserId && swap.targetUserId !== claimingUserId) {
      throw { status: 403, code: 'TARGETED_SWAP_RESTRICTED', message: 'This swap offer was targeted to another specific co-worker' };
    }

    return prisma.shiftSwapRequest.update({
      where: { id: swapId },
      data: {
        claimedByUserId: claimingUserId,
        status: 'CLAIMED'
      },
      include: {
        originalShift: true,
        claimedByUser: { select: { id: true, firstName: true, lastName: true } }
      }
    });
  }

  static async approveSwap(businessId: string, managerUserId: string, swapId: string) {
    const swap = await prisma.shiftSwapRequest.findUnique({
      where: { id: swapId },
      include: { originalShift: true }
    });

    if (!swap || swap.originalShift.businessId !== businessId) {
      throw { status: 404, code: 'SWAP_NOT_FOUND', message: 'Swap request not found' };
    }

    if (swap.status !== 'CLAIMED' || !swap.claimedByUserId) {
      throw { status: 400, code: 'SWAP_NOT_CLAIMED', message: 'Swap must be claimed by a coworker before manager approval' };
    }

    const newAssignedUserId = swap.claimedByUserId;

    // ATOMIC TRANSACTION: Reassign shift to claiming user & mark swap APPROVED
    const [updatedShift, updatedSwap] = await prisma.$transaction([
      prisma.shift.update({
        where: { id: swap.originalShiftId },
        data: {
          assignedUserId: newAssignedUserId,
          status: 'SCHEDULED'
        }
      }),
      prisma.shiftSwapRequest.update({
        where: { id: swapId },
        data: {
          status: 'APPROVED',
          reviewedBy: managerUserId,
          reviewedAt: new Date()
        },
        include: {
          originalShift: true,
          requestedByUser: { select: { id: true, firstName: true, lastName: true } },
          claimedByUser: { select: { id: true, firstName: true, lastName: true } }
        }
      })
    ]);

    return { shift: updatedShift, swap: updatedSwap };
  }

  static async denySwap(businessId: string, managerUserId: string, swapId: string) {
    const swap = await prisma.shiftSwapRequest.findUnique({
      where: { id: swapId },
      include: { originalShift: true }
    });

    if (!swap || swap.originalShift.businessId !== businessId) {
      throw { status: 404, code: 'SWAP_NOT_FOUND', message: 'Swap request not found' };
    }

    // Revert shift status back to SCHEDULED
    await prisma.shift.update({
      where: { id: swap.originalShiftId },
      data: { status: 'SCHEDULED' }
    });

    return prisma.shiftSwapRequest.update({
      where: { id: swapId },
      data: {
        status: 'DENIED',
        reviewedBy: managerUserId,
        reviewedAt: new Date()
      }
    });
  }

  static async cancelSwap(businessId: string, userId: string, swapId: string) {
    const swap = await prisma.shiftSwapRequest.findUnique({
      where: { id: swapId },
      include: { originalShift: true }
    });

    if (!swap || swap.originalShift.businessId !== businessId || swap.requestedByUserId !== userId) {
      throw { status: 404, code: 'SWAP_NOT_FOUND', message: 'Swap request not found or unauthorized' };
    }

    if (!['OPEN', 'CLAIMED'].includes(swap.status)) {
      throw { status: 400, code: 'CANNOT_CANCEL', message: 'Swap request cannot be cancelled in its current state' };
    }

    // Revert shift status to SCHEDULED
    await prisma.shift.update({
      where: { id: swap.originalShiftId },
      data: { status: 'SCHEDULED' }
    });

    return prisma.shiftSwapRequest.update({
      where: { id: swapId },
      data: { status: 'CANCELLED' }
    });
  }
}
