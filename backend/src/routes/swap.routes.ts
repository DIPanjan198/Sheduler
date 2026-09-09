import { Router } from 'express';
import { SwapController } from '../controllers/swap.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', SwapController.list);
router.post('/', SwapController.propose);
router.post('/:id/claim', SwapController.claim);
router.patch('/:id/approve', requireRole('MANAGER'), SwapController.approve);
router.patch('/:id/deny', requireRole('MANAGER'), SwapController.deny);
router.patch('/:id/cancel', SwapController.cancel);

export default router;
