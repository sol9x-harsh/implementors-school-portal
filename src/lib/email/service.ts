import nodemailer from 'nodemailer';
import {
  createTransporter,
  FROM_EMAIL,
  FROM_NAME,
  getEmailConfig,
} from './config';
import { getWelcomeEmailTemplate } from './templates/welcome';
import { getCredentialsEmailTemplate } from './templates/credentials';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const config = getEmailConfig();
    if (config) {
      this.transporter = createTransporter();
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  private ensureTransporter() {
    if (!this.transporter) {
      throw new Error(
        'Email service not configured. Please set up SMTP credentials.',
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      this.ensureTransporter();
      await this.transporter!.sendMail({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(
    studentEmail: string,
    studentName: string,
    password: string,
  ): Promise<boolean> {
    try {
      this.ensureTransporter();
      const template = getWelcomeEmailTemplate(
        studentName,
        studentEmail,
        password,
      );

      return this.sendEmail({
        to: studentEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      console.error('Email service not configured, skipping welcome email');
      return false;
    }
  }

  async sendCredentialsEmail(
    studentEmail: string,
    studentName: string,
    password: string,
  ): Promise<boolean> {
    try {
      this.ensureTransporter();
      const template = getCredentialsEmailTemplate(
        studentName,
        studentEmail,
        password,
      );

      return this.sendEmail({
        to: studentEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      console.error('Email service not configured, skipping credentials email');
      return false;
    }
  }

  async sendBulkCredentialsEmail(
    students: Array<{ email: string; name: string; password: string }>,
  ): Promise<{ success: number; failed: number }> {
    try {
      this.ensureTransporter();
      let successCount = 0;
      let failedCount = 0;

      for (const student of students) {
        const result = await this.sendCredentialsEmail(
          student.email,
          student.name,
          student.password,
        );

        if (result) {
          successCount++;
        } else {
          failedCount++;
        }
      }

      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('Bulk email sending failed:', error);
      return { success: 0, failed: students.length };
    }
  }
}

export const emailService = new EmailService();
