import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-key-12345',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret-key-67890',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    senderEmail: process.env.SENDER_EMAIL || 'noreply@shiftscheduler.local'
  }
};
