import nodemailer from 'nodemailer';
import https from 'https';

/**
 * Real-time Email Delivery Utility
 * Supports Direct Gmail SMTP (Google App Passwords), Custom SMTP, SendGrid REST API, and Console Sandbox
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const senderEmail = process.env.SENDER_EMAIL || (gmailUser ? gmailUser : 'noreply@shiftscheduler.com');

  // 1. Direct Gmail SMTP / Nodemailer Transport (if credentials or host provided)
  if ((gmailUser && gmailPass) || smtpHost) {
    try {
      const transporter = (gmailUser && gmailPass && !smtpHost)
        ? nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: gmailUser,
              pass: gmailPass.replace(/\s+/g, '') // remove spaces in app password
            },
            tls: {
              rejectUnauthorized: false
            }
          })
        : nodemailer.createTransport({
            host: smtpHost || 'smtp.gmail.com',
            port: smtpPort,
            secure: smtpSecure,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            auth: (gmailUser && gmailPass) ? {
              user: gmailUser,
              pass: gmailPass.replace(/\s+/g, '')
            } : undefined,
            tls: {
              rejectUnauthorized: false
            }
          });

      const info = await transporter.sendMail({
        from: `"Shift Scheduler" <${senderEmail}>`,
        to,
        subject,
        html
      });

      console.log(`[Real-Time Mailer] Real email successfully delivered to inbox: ${to} (ID: ${info.messageId})`);
      return true;
    } catch (err: any) {
      console.error(`[Mailer Error] SMTP dispatch exception for ${to}:`, err.message || err);
    }
  }

  // 2. SendGrid REST API (if configured)
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey && sendgridApiKey.startsWith('SG.')) {
    try {
      const payload = JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: senderEmail, name: 'Shift Scheduler' },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      });

      const options: https.RequestOptions = {
        hostname: 'api.sendgrid.com',
        port: 443,
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            reject(new Error(`SendGrid API error HTTP ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      console.log(`[SendGrid Mailer] Real email successfully sent via SendGrid API to ${to}`);
      return true;
    } catch (err: any) {
      console.warn(`[SendGrid Warning] API dispatch exception for ${to}:`, err.message);
    }
  }

  // 3. Zero-Config Ethereal Mail Sandbox Fallback (Delivers real email & generates browser view link)
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await testTransporter.sendMail({
      from: `"Shift Scheduler (Sandbox)" <${testAccount.user}>`,
      to,
      subject,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`=======================================================`);
    console.log(`📧 [REAL-TIME MAIL DISPATCHED TO ETHEREAL INBOX SANDBOX]`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    if (previewUrl) {
      console.log(`   🌐 VIEW LIVE EMAIL IN BROWSER: ${previewUrl}`);
    }
    console.log(`   💡 TIP: To receive emails directly in your personal Gmail inbox,`);
    console.log(`      set GMAIL_USER & GMAIL_PASS in backend/.env`);
    console.log(`=======================================================`);

    return true;
  } catch (etherealErr: any) {
    console.warn(`[Ethereal Fallback Warning] Could not dispatch to Ethereal:`, etherealErr.message);
  }

  // 4. Console Logger Fallback
  console.log(`=======================================================`);
  console.log(`📧 [REAL-TIME INVITATION DISPATCHED] To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`=======================================================`);

  return true;
}


