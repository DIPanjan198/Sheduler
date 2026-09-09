import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { initDb } from './services/db.service';
import { NotificationService } from './services/notification.service';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import shiftRoutes from './routes/shift.routes';
import timeoffRoutes from './routes/timeoff.routes';
import swapRoutes from './routes/swap.routes';
import timeclockRoutes from './routes/timeclock.routes';
import reportsRoutes from './routes/reports.routes';
import notificationRoutes from './routes/notification.routes';
import noticeRoutes from './routes/notice.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Shift Scheduler API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/time-off', timeoffRoutes);
app.use('/api/v1/swaps', swapRoutes);
app.use('/api/v1/time-clock', timeclockRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/notices', noticeRoutes);

// Global 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} not found` } });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred'
    }
  });
});

// Start Server & Background Cron Jobs
async function startServer() {
  await initDb();

  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Shift Scheduler API running on http://localhost:${config.port}`);
    console.log(`   API Base Path: http://localhost:${config.port}/api/v1 (Real-Time Gmail Active + LAN URL Support)`);
    console.log(`=======================================================`);
  });

  // Background job: Run shift reminder scan every 5 minutes (SRS Section 7.2)
  setInterval(() => {
    NotificationService.processUpcomingShiftReminders().catch(err => {
      console.error('[Cron Job Error] Failed processing shift reminders:', err);
    });
  }, 5 * 60 * 1000);
}

startServer();
