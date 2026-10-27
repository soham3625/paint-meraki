// ============================================
// paint_n_meraki — EMAIL DELIVERY SERVICE
// Supports Resend API, Branded HTML Templates, and Strict Failure Handling
// ============================================

export interface SendPasswordResetEmailParams {
  to: string;
  customerName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface SendOtpEmailParams {
  to: string;
  otp: string;
  customerName?: string;
  expiresInMinutes?: number;
  action?: 'login' | 'register' | 'verify';
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'resend' | 'console-dev';
}

/**
 * Render Paint Meraki Brand HTML for One-Time Password (OTP) Email
 */
export function renderOtpEmailHtml(params: {
  customerName?: string;
  otp: string;
  expiresInMinutes: number;
  action?: string;
}): string {
  const { customerName, otp, expiresInMinutes, action = 'sign in to your Paint Meraki account' } = params;
  const safeName = customerName || 'Valued Customer';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Paint Meraki Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2c2523; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #faf7f2; width: 100%; margin: 0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" max-width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(44, 37, 35, 0.07); border: 1px solid #f0e6dc;">

          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #2c2523 0%, #3d3431 100%); padding: 34px 30px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; letter-spacing: 0.08em; color: #fdfaf6; font-weight: 600;">
                PAINT MERAKI
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #d4a373;">
                Handcrafted Resin & Art Decor
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 38px 34px 28px; text-align: center;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #2c2523;">
                Your Verification Code
              </h2>

              <p style="margin: 0 0 20px; font-size: 14px; color: #5c534e;">
                Hello <strong>${safeName}</strong>, use the 6-digit code below to ${action}:
              </p>

              <!-- OTP Display Box -->
              <div style="margin: 22px 0 26px; text-align: center;">
                <div style="display: inline-block; background: #faf6ee; border: 2px dashed #d4af37; border-radius: 14px; padding: 16px 28px; font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2c2523;">
                  ${otp}
                </div>
              </div>

              <p style="margin: 0 0 8px; font-size: 13px; color: #8c827a;">
                ⏳ <strong>Valid for ${expiresInMinutes} minutes.</strong>
              </p>

              <p style="margin: 0 0 22px; font-size: 12px; color: #a89f97;">
                For your security, never share this code with anyone. Paint Meraki team members will never ask for your verification code.
              </p>

              <hr style="border: 0; border-top: 1px solid #f0e6dc; margin: 24px 0 18px;" />

              <p style="margin: 0; font-size: 12px; color: #9c928a;">
                If you did not request this verification code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #fcf9f5; padding: 20px 30px; border-top: 1px solid #f0e6dc; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #2c2523;">
                Paint Meraki • Handcrafted with ♡ in Gujarat, India
              </p>
              <p style="margin: 0; font-size: 11px; color: #a89f97;">
                https://paintnmeraki.vercel.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Render Plain Text Fallback for OTP Email
 */
export function renderOtpEmailText(params: {
  customerName?: string;
  otp: string;
  expiresInMinutes: number;
  action?: string;
}): string {
  const { customerName, otp, expiresInMinutes, action = 'sign in to your Paint Meraki account' } = params;
  return `
Hello ${customerName || 'Valued Customer'},

Your Paint Meraki verification code is: ${otp}

Use this 6-digit code to ${action}.
This code will expire in ${expiresInMinutes} minutes. Never share this code with anyone.

If you did not request this code, you can safely ignore this email.

Thank you,
The Paint Meraki Team
https://paintnmeraki.vercel.app
  `.trim();
}

/**
 * Render Paint Meraki Brand HTML for Password Reset Email
 */
export function renderPasswordResetEmailHtml(params: {
  customerName: string;
  resetUrl: string;
  expiresInMinutes: number;
}): string {
  const { customerName, resetUrl, expiresInMinutes } = params;
  const safeName = customerName || 'Valued Customer';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Paint Meraki password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2c2523; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #faf7f2; width: 100%; margin: 0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(44, 37, 35, 0.06); border: 1px solid #f0e6dc;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #2c2523 0%, #3d3431 100%); padding: 36px 30px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 0.05em; color: #fdfaf6; font-weight: 600;">
                PAINT MERAKI
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #d4a373;">
                Handcrafted Resin & Art Decor
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 35px 30px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #2c2523;">
                Reset Your Password
              </h2>
              
              <p style="margin: 0 0 16px; font-size: 15px; color: #5c534e;">
                Hello <strong>${safeName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; font-size: 15px; color: #5c534e;">
                We received a request to reset your Paint Meraki account password. Click the button below to create a new, secure password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 32px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #d4a373;">
                    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; background: linear-gradient(135deg, #c58f5e 0%, #b27a49 100%); letter-spacing: 0.02em;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 12px; font-size: 13px; color: #8c827a;">
                ⏳ <strong>Note:</strong> This password reset link will expire in <strong>${expiresInMinutes} minutes</strong> and can only be used once.
              </p>

              <p style="margin: 0 0 20px; font-size: 13px; color: #8c827a;">
                If you did not request a password reset, you can safely ignore this email. Your current password will remain unchanged.
              </p>

              <hr style="border: 0; border-top: 1px solid #f0e6dc; margin: 28px 0 20px;" />

              <p style="margin: 0 0 6px; font-size: 12px; color: #9c928a;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 12px; color: #b27a49; word-break: break-all;">
                <a href="${resetUrl}" style="color: #b27a49; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #fcf9f5; padding: 24px 30px; border-top: 1px solid #f0e6dc; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #2c2523;">
                Thank you,<br/>The Paint Meraki Team
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #a89f97;">
                Handcrafted with ♡ in Gujarat, India
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Render Plain Text Fallback for Password Reset Email
 */
export function renderPasswordResetEmailText(params: {
  customerName: string;
  resetUrl: string;
  expiresInMinutes: number;
}): string {
  const { customerName, resetUrl, expiresInMinutes } = params;
  return `
Hello ${customerName || 'Valued Customer'},

We received a request to reset your Paint Meraki account password.

Click or copy the link below to create a new password:
${resetUrl}

This link will expire in ${expiresInMinutes} minutes and can only be used once.

If you did not request a password reset, you can safely ignore this email.

Thank you,
The Paint Meraki Team
${process.env.NEXT_PUBLIC_SITE_URL || 'https://paintnmeraki.vercel.app'}
  `.trim();
}

/**
 * Send Free Email OTP via Resend API
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<EmailSendResult> {
  const { to, otp, customerName, expiresInMinutes = 10, action = 'login' } = params;
  const cleanTo = to.trim().toLowerCase();
  const fromEmail = process.env.EMAIL_FROM || 'Paint Meraki <onboarding@resend.dev>';
  const actionLabel =
    action === 'register'
      ? 'complete your Paint Meraki registration'
      : action === 'verify'
      ? 'verify your Paint Meraki email address'
      : 'sign in to your Paint Meraki account';

  const subject = `${otp} is your Paint Meraki verification code`;

  const html = renderOtpEmailHtml({
    customerName,
    otp,
    expiresInMinutes,
    action: actionLabel,
  });

  const text = renderOtpEmailText({
    customerName,
    otp,
    expiresInMinutes,
    action: actionLabel,
  });

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanTo],
          subject,
          html,
          text,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        return { success: true, messageId: data.id, provider: 'resend' };
      } else {
        const errorMsg = data.message || (typeof data === 'string' ? data : 'Failed to send verification email');
        console.error('[sendOtpEmail] Resend API error response:', errorMsg);
        return {
          success: false,
          error: errorMsg,
          provider: 'resend',
        };
      }
    } catch (err: any) {
      console.error('[sendOtpEmail] Resend network error:', err?.message);
      return { success: false, error: err?.message || 'Network error reaching email service', provider: 'resend' };
    }
  }

  // If RESEND_API_KEY is not configured in production, do NOT report false success
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'Email service is not configured (RESEND_API_KEY is missing on server).',
    };
  }

  // Development / Preview mode dispatch: NEVER log raw OTP in production
  console.log(`[EMAIL SERVICE - DEV DISPATCH] Sent OTP to ${cleanTo} (Expires in ${expiresInMinutes} mins)`);

  return {
    success: true,
    provider: 'console-dev',
    messageId: 'dev-otp-' + Date.now().toString(36),
  };
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(
  params: SendPasswordResetEmailParams
): Promise<EmailSendResult> {
  const { to, customerName, resetUrl, expiresInMinutes = 60 } = params;
  const cleanTo = to.trim().toLowerCase();
  const fromEmail = process.env.EMAIL_FROM || 'Paint Meraki <onboarding@resend.dev>';
  const subject = 'Reset your Paint Meraki password';

  const html = renderPasswordResetEmailHtml({
    customerName,
    resetUrl,
    expiresInMinutes,
  });

  const text = renderPasswordResetEmailText({
    customerName,
    resetUrl,
    expiresInMinutes,
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanTo],
          subject,
          html,
          text,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        return { success: true, messageId: data.id, provider: 'resend' };
      } else {
        const errorMsg = data.message || 'Failed to send via Resend';
        console.error('[sendPasswordResetEmail] Resend API error:', errorMsg);
        return { success: false, error: errorMsg, provider: 'resend' };
      }
    } catch (err: any) {
      console.error('[sendPasswordResetEmail] Resend delivery exception:', err);
      return { success: false, error: err.message, provider: 'resend' };
    }
  }

  // In production, do not falsely report success if API key is missing
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'Email service is not configured (RESEND_API_KEY is missing on server).',
    };
  }

  console.log(`[EMAIL SERVICE - DEV DISPATCH] Password reset link generated for ${cleanTo}`);

  return {
    success: true,
    provider: 'console-dev',
    messageId: 'dev-' + Date.now().toString(36),
  };
}
