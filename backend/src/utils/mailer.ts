import nodemailer from 'nodemailer';
import https from 'https';

/**
 * Real-time Email Delivery Utility
 * Priority:
 *   1. Resend API (HTTPS - works on all cloud hosts including Render free tier)
 *   2. SendGrid REST API
 *   3. Gmail SMTP (works locally, blocked on some cloud hosts)
 *   4. Ethereal sandbox (development preview)
 *   5. Console logger fallback
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const senderName = 'Shift Scheduler';

  // ─────────────────────────────────────────────────────────────────
  // 1. RESEND API (HTTPS port 443 — works on all cloud platforms)
  // ─────────────────────────────────────────────────────────────────
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      // IMPORTANT: 'onboarding@resend.dev' only works when sending to the
      // Resend account owner's own email — it will silently fail for all other
      // recipients. Set RESEND_FROM_EMAIL to a verified domain address to fix this.
      const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim().replace(/^["']|["']$/g, '') || 'onboarding@resend.dev';
      if (fromEmail === 'onboarding@resend.dev') {
        console.warn('[Resend Mailer] WARNING: Using onboarding@resend.dev — emails will ONLY deliver to your Resend account email. Set RESEND_FROM_EMAIL=noreply@yourdomain.com (verified in Resend dashboard) to send to any recipient.');
      }

      const payload = JSON.stringify({
        from: `${senderName} <${fromEmail}>`,
        to: [to],
        subject,
        html
      });

      const result = await new Promise<{ id?: string }>((resolve, reject) => {
        const req = https.request({
          hostname: 'api.resend.com',
          port: 443,
          path: '/emails',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)); } catch { resolve({}); }
            } else {
              reject(new Error(`Resend API error HTTP ${res.statusCode}: ${body}`));
            }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      console.log(`[Resend Mailer] Email delivered to ${to} (ID: ${result?.id || 'ok'})`);
      return true;
    } catch (err: any) {
      console.error(`[Resend Error] Failed to send to ${to}:`, err.message || err);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. SENDGRID REST API (HTTPS port 443)
  // ─────────────────────────────────────────────────────────────────
  const sendgridApiKey = (process.env.SENDGRID_API_KEY || '').trim();
  const senderEmail = (process.env.SENDER_EMAIL || '').trim().replace(/^["']|["']$/g, '') || 'noreply@shiftscheduler.com';
  if (sendgridApiKey && sendgridApiKey.startsWith('SG.')) {
    try {
      const payload = JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: senderEmail, name: senderName },
        subject,
        content: [{ type: 'text/html', value: html }]
      });

      await new Promise<void>((resolve, reject) => {
        const req = https.request({
          hostname: 'api.sendgrid.com',
          port: 443,
          path: '/v3/mail/send',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          // Must consume body to prevent socket hang
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve();
            } else {
              reject(new Error(`SendGrid API error HTTP ${res.statusCode}: ${body}`));
            }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      console.log(`[SendGrid Mailer] Email sent to ${to}`);
      return true;
    } catch (err: any) {
      console.warn(`[SendGrid Error] Failed to send to ${to}:`, err.message || err);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. GMAIL SMTP - tries port 587 (STARTTLS) first, then 465 (SSL)
  //    NOTE: On Render and most cloud hosts, ALL SMTP ports are blocked.
  //    If this fails, set RESEND_API_KEY in Render env vars.
  // ─────────────────────────────────────────────────────────────────
  const gmailUser = (process.env.GMAIL_USER || process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const gmailPass = (process.env.GMAIL_PASS || process.env.SMTP_PASS || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
  const smtpHost = (process.env.SMTP_HOST || '').trim().replace(/^["']|["']$/g, '');

  if ((gmailUser && gmailPass) || smtpHost) {
    const host = smtpHost || 'smtp.gmail.com';
    const portsToTry = smtpHost
      ? [parseInt(process.env.SMTP_PORT || '587', 10)]
      : [587, 465]; // Try 587 (STARTTLS) first - more cloud-friendly

    for (const port of portsToTry) {
      try {
        const secure = port === 465;
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          requireTLS: !secure,
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000,
          auth: (gmailUser && gmailPass) ? { user: gmailUser, pass: gmailPass } : undefined,
          tls: { rejectUnauthorized: false }
        });

        const info = await transporter.sendMail({
          from: `"${senderName}" <${gmailUser || senderEmail}>`,
          to,
          subject,
          html
        });

        console.log(`[Gmail SMTP port ${port}] Email delivered to ${to} (ID: ${info.messageId})`);
        return true;
      } catch (err: any) {
        console.warn(`[Gmail SMTP port ${port}] Failed for ${to}:`, err.message || err);
      }
    }
    console.error(`[Gmail SMTP] All ports failed - SMTP is likely blocked by your cloud host. Add RESEND_API_KEY to your Render environment variables.`);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. ETHEREAL SANDBOX (development preview — not real delivery)
  // ─────────────────────────────────────────────────────────────────
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });

    const info = await testTransporter.sendMail({
      from: `"${senderName} (Sandbox)" <${testAccount.user}>`,
      to,
      subject,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`=======================================================`);
    console.log(`📧 [SANDBOX EMAIL — NOT delivered to real inbox]`);
    console.log(`   To: ${to}`);
    if (previewUrl) console.log(`   🌐 Preview: ${previewUrl}`);
    console.log(`   💡 Add RESEND_API_KEY to Render env vars for real delivery`);
    console.log(`=======================================================`);
    return true;
  } catch (etherealErr: any) {
    console.warn(`[Ethereal Fallback Warning]:`, etherealErr.message);
  }

  // 5. Console logger last resort
  console.log(`📧 [EMAIL NOT SENT — No mail provider configured] To: ${to}`);
  return false;
}
