import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', requireRole('MANAGER'), UserController.list);
router.get('/me', UserController.me);
router.patch('/:id', UserController.update);
router.post('/:id/disable', requireRole('MANAGER'), UserController.disable);
router.delete('/:id', requireRole('MANAGER'), UserController.delete);

export default router;
