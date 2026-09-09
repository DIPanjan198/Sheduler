import { Router } from 'express';
import { TimeOffController } from '../controllers/timeoff.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', TimeOffController.list);
router.post('/', TimeOffController.create);
router.patch('/:id/approve', requireRole('MANAGER'), TimeOffController.approve);
router.patch('/:id/deny', requireRole('MANAGER'), TimeOffController.deny);
router.patch('/:id/cancel', TimeOffController.cancel);

export default router;
