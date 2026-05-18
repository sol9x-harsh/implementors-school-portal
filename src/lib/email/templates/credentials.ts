// TODO: Replace password-in-email with token-based password-set link flow (see audit issue #2)
export function getCredentialsEmailTemplate(
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
      <title>Sol9x Portal - Your Login Credentials</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
        .content { background: #f8fafc; padding: 40px; border-radius: 0 0 10px 10px; }
        .credential-box { background: white; padding: 25px; border-radius: 8px; border: 2px solid #dc2626; margin: 25px 0; }
        .credential-box h3 { color: #dc2626; margin: 0 0 15px 0; font-size: 18px; }
        .credential-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .credential-item:last-child { border-bottom: none; }
        .credential-label { font-weight: 600; color: #64748b; }
        .credential-value { font-family: 'Courier New', monospace; background: #fef2f2; padding: 8px 12px; border-radius: 4px; font-weight: 700; color: #dc2626; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #b91c1c; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
        .security-note { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .security-note h4 { color: #92400e; margin: 0 0 8px 0; font-size: 16px; }
        .security-note p { color: #92400e; margin: 0; font-size: 14px; }
        .alert-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .alert-box h4 { color: #dc2626; margin: 0 0 8px 0; font-size: 16px; }
        .alert-box p { color: #dc2626; margin: 0; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Account Credentials</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          
          <p>Your login credentials for the Sol9x Student Portal have been generated. Please keep this information secure and change your password immediately after logging in.</p>
          
          <div class="alert-box">
            <h4>⚠️ Important Security Notice</h4>
            <p>This email contains sensitive account information. Please change your password immediately after first login and do not share these credentials with anyone.</p>
          </div>
          
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
            <h4>🔒 Security Recommendations</h4>
            <p>• Change your password immediately after first login<br>
               • Use a strong, unique password<br>
               • Enable two-factor authentication if available<br>
               • Never share your login credentials</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${portalUrl}/login" class="button">Login to Your Portal</a>
          </p>
          
          <p>If you did not request these credentials or have any security concerns, please contact our support team immediately.</p>
          
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
Sol9x Portal - Your Login Credentials

Dear ${studentName},

Your login credentials for the Sol9x Student Portal have been generated. Please keep this information secure and change your password immediately after logging in.

⚠️ Important Security Notice
This email contains sensitive account information. Please change your password immediately after first login and do not share these credentials with anyone.

Your Login Credentials:
Email: ${studentEmail}
Password: ${password}

🔒 Security Recommendations:
• Change your password immediately after first login
• Use a strong, unique password
• Enable two-factor authentication if available
• Never share your login credentials

Login to Your Portal: ${portalUrl}/login

If you did not request these credentials or have any security concerns, please contact our support team immediately.

This is an automated message from Sol9x Portal. Please do not reply to this email.
© 2026 Sol9x Education. All rights reserved.
  `;

  return {
    subject: 'Sol9x Portal - Your Login Credentials',
    html,
    text,
  };
}
