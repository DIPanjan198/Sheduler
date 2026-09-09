import { Router } from 'express';
import { NoticeController } from '../controllers/notice.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

// All authenticated users can view notices
router.get('/', NoticeController.list);

// Managers can create, update, and delete notices
router.post('/', requireRole('MANAGER'), NoticeController.create);
router.patch('/:id', requireRole('MANAGER'), NoticeController.update);
router.delete('/:id', requireRole('MANAGER'), NoticeController.delete);

export default router;
