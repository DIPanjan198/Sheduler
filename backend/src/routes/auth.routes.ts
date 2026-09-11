import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/invite', authenticateJWT, requireRole('MANAGER'), AuthController.invite);
router.post('/accept-invite', AuthController.acceptInvite);
router.get('/test-email', authenticateJWT, requireRole('MANAGER'), AuthController.testEmail);

export default router;
