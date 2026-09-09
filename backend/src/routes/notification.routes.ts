import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', NotificationController.list);
router.post('/trigger-reminders', NotificationController.triggerReminderJob);

export default router;
