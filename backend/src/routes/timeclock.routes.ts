import { Router } from 'express';
import { TimeClockController } from '../controllers/timeclock.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/punch-in', TimeClockController.punchIn);
router.post('/punch-out', TimeClockController.punchOut);
router.get('/', TimeClockController.list);
router.patch('/:id', requireRole('MANAGER'), TimeClockController.edit);

export default router;
