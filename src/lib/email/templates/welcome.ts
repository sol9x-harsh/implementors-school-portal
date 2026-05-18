// TODO: Replace password-in-email with token-based password-set link flow (see audit issue #2)
export function getWelcomeEmailTemplate(
  studentName: string,
  studentEmail: string,
  password: string,
) {
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Sol9x Portal</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
        .content { background: #f8fafc; padding: 40px; border-radius: 0 0 10px 10px; }
        .credential-box { background: white; padding: 25px; border-radius: 8px; border: 2px solid #e2e8f0; margin: 25px 0; }
        .credential-box h3 { color: #6366f1; margin: 0 0 15px 0; font-size: 18px; }
        .credential-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .credential-item:last-child { border-bottom: none; }
        .credential-label { font-weight: 600; color: #64748b; }
        .credential-value { font-family: 'Courier New', monospace; background: #f1f5f9; padding: 8px 12px; border-radius: 4px; font-weight: 700; color: #1e293b; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #4f46e5; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
        .security-note { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .security-note h4 { color: #92400e; margin: 0 0 8px 0; font-size: 16px; }
        .security-note p { color: #92400e; margin: 0; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Sol9x Portal</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          
          <p>Welcome to the Sol9x Student Portal! We're excited to have you join our learning community. Your account has been successfully created and you can now access all the features of our portal.</p>
          
          <div class="credential-box">
            <h3>Your Login Credentials</h3>
            <div class="credential-item">
              <span class="credential-label">Email:</span>
              <span class="credential-value">${studentEmail}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Password:</span>
              <span class="credential-value">${password}</span>
            </div>
          </div>
          
          <div class="security-note">
            <h4>🔒 Security Notice</h4>
            <p>Please change your password immediately after your first login for account security.</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${portalUrl}/login" class="button">Login to Your Portal</a>
          </p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <div class="footer">
            <p>This is an automated message from Sol9x Portal. Please do not reply to this email.</p>
            <p>© 2026 Sol9x Education. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Sol9x Portal

Dear ${studentName},

Welcome to the Sol9x Student Portal! We're excited to have you join our learning community. Your account has been successfully created and you can now access all the features of our portal.

Your Login Credentials:
Email: ${studentEmail}
Password: ${password}

🔒 Security Notice: Please change your password immediately after your first login for account security.

Login to Your Portal: ${portalUrl}/login

If you have any questions or need assistance, please don't hesitate to contact our support team.

This is an automated message from Sol9x Portal. Please do not reply to this email.
© 2026 Sol9x Education. All rights reserved.
  `;

  return {
    subject: 'Welcome to Sol9x Portal - Your Account is Ready!',
    html,
    text,
  };
}
