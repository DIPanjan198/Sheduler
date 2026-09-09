import { Router } from 'express';
import { ShiftController } from '../controllers/shift.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', ShiftController.list);
router.post('/', requireRole('MANAGER'), ShiftController.create);
router.patch('/:id', requireRole('MANAGER'), ShiftController.update);
router.delete('/:id', requireRole('MANAGER'), ShiftController.delete);

export default router;
