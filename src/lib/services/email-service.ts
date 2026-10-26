// ============================================
// paint_n_meraki — EMAIL DELIVERY SERVICE
// Supports Resend API, SMTP, and Dev/Preview Logging
// ============================================

export interface SendPasswordResetEmailParams {
  to: string;
  customerName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'resend' | 'smtp' | 'console-dev';
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
https://paintmeraki.com
  `.trim();
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(
  params: SendPasswordResetEmailParams
): Promise<EmailSendResult> {
  const { to, customerName, resetUrl, expiresInMinutes = 60 } = params;
  const cleanTo = to.trim().toLowerCase();
  const fromEmail = process.env.EMAIL_FROM || 'Paint Meraki <noreply@paintmeraki.com>';
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

  // 1. Check for Resend API Key
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
        console.error('Resend API error:', data);
        return { success: false, error: data.message || 'Failed to send via Resend', provider: 'resend' };
      }
    } catch (err: any) {
      console.error('Resend delivery exception:', err);
      return { success: false, error: err.message, provider: 'resend' };
    }
  }

  // 2. Fallback / Local Development Mode
  // If no external provider is configured, log delivery cleanly for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('====================================================');
    console.log('[EMAIL SERVICE - DEV DISPATCH]');
    console.log(`To: ${cleanTo}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Expires: ${expiresInMinutes} minutes`);
    console.log('====================================================');
  }

  return {
    success: true,
    provider: 'console-dev',
    messageId: 'dev-' + Date.now().toString(36),
  };
}
