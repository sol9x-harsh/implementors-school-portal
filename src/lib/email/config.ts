import nodemailer from 'nodemailer';

export interface EmailConfig {
  service: 'gmail' | 'outlook';
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export function getEmailConfig(): EmailConfig | null {
  const service = (process.env.EMAIL_SERVICE as 'gmail' | 'outlook') || 'gmail';

  const configs: Record<string, Omit<EmailConfig, 'service'>> = {
    gmail: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    outlook: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
  };

  const config = configs[service];
  if (!config) {
    console.warn(`Unsupported email service: ${service}`);
    return null;
  }

  if (!config.auth.user || !config.auth.pass) {
    console.warn(`SMTP credentials not configured for ${service}`);
    return null;
  }

  return {
    service,
    ...config,
  };
}

export function createTransporter(): nodemailer.Transporter | null {
  const config = getEmailConfig();
  if (!config) return null;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
}

export const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@sol9x.com';
export const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Sol9x Portal';
