import { Response } from 'express';
import { AuthRequest } from '../types';
import { SwapService } from '../services/swap.service';

export class SwapController {
  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const statusFilter = req.query.status as string;
      const swaps = await SwapService.listSwaps(req.user.businessId, statusFilter);
      return res.json(swaps);
    } catch (err: any) {
      return res.status(500).json({ error: { code: 'SWAP_LIST_FAILED', message: err.message || 'Failed to list swaps' } });
    }
  }

  static async propose(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const created = await SwapService.proposeSwap(req.user.businessId, req.user.userId, req.body);
      return res.status(201).json(created);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'SWAP_PROPOSE_FAILED', message: err.message || 'Failed to propose swap' } });
    }
  }

  static async claim(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const swapId = req.params.id;
      const result = await SwapService.claimSwap(req.user.businessId, req.user.userId, swapId);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'SWAP_CLAIM_FAILED', message: err.message || 'Failed to claim swap' } });
    }
  }

  static async approve(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const swapId = req.params.id;
      const result = await SwapService.approveSwap(req.user.businessId, req.user.userId, swapId);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'SWAP_APPROVE_FAILED', message: err.message || 'Failed to approve swap' } });
    }
  }

  static async deny(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const swapId = req.params.id;
      const result = await SwapService.denySwap(req.user.businessId, req.user.userId, swapId);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'SWAP_DENY_FAILED', message: err.message || 'Failed to deny swap' } });
    }
  }

  static async cancel(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      const swapId = req.params.id;
      const result = await SwapService.cancelSwap(req.user.businessId, req.user.userId, swapId);
      return res.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({ error: { code: err.code || 'SWAP_CANCEL_FAILED', message: err.message || 'Failed to cancel swap' } });
    }
  }
}
