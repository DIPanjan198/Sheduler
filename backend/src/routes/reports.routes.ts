import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT, requireRole('MANAGER'));

router.get('/hours', ReportsController.getHours);
router.get('/export.csv', ReportsController.exportCsv);

export default router;
