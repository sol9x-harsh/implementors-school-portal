'use server';

import dbConnect from '@/lib/db/mongodb';
import Student from '@/lib/models/Student';
import Admin from '@/lib/models/Admin';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { emailService } from '@/lib/email/service';

// --- AUTH HELPER ---
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

// --- ADMIN PASSWORD VERIFICATION ---
export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const session = await requireAdmin();
    await dbConnect();

    const admin = await Admin.findById(session.user.id).select('+password');
    if (!admin || !admin.password) {
      return false;
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    return isPasswordMatch;
  } catch (error) {
    console.error('Admin password verification failed:', error);
    return false;
  }
}

// --- GET STUDENT CREDENTIALS (WITH ADMIN VERIFICATION) ---
export async function getStudentCredentials(
  studentId: string,
  adminPassword: string,
) {
  try {
    // Verify admin password first
    const isVerified = await verifyAdminPassword(adminPassword);
    if (!isVerified) {
      return {
        success: false,
        error: 'Invalid admin password',
      };
    }

    await dbConnect();

    const student = await Student.findById(studentId);
    if (!student) {
      return {
        success: false,
        error: 'Student not found',
      };
    }

    // Log the credential access for audit
    const adminSession = await getServerSession(authOptions);
    console.log(
      `Credentials accessed for student ${student.email} by admin ${adminSession?.user?.email ?? 'unknown'}`,
    );

    return {
      success: true,
      credentials: {
        studentId: student._id.toString(),
        name: student.name,
        email: student.email,
        mobileNo: student.mobileNo,
        uid: student.uid,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to retrieve credentials',
    };
  }
}

// --- SEND CREDENTIALS EMAIL ---
export async function sendCredentialsToStudent(
  studentId: string,
  adminPassword: string,
) {
  try {
    // Verify admin password first
    const isVerified = await verifyAdminPassword(adminPassword);
    if (!isVerified) {
      return {
        success: false,
        error: 'Invalid admin password',
      };
    }

    await dbConnect();

    const student = await Student.findById(studentId);
    if (!student) {
      return {
        success: false,
        error: 'Student not found',
      };
    }

    // Intentional: generates a new temp password and emails it to the student
    const tempPassword = `Sol9x@${crypto.randomBytes(4).toString('base64url')}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Update student password
    await Student.findByIdAndUpdate(studentId, { password: hashedPassword });

    // Send email with new credentials
    const emailSent = await emailService.sendCredentialsEmail(
      student.email,
      student.name,
      tempPassword,
    );

    // Log the action
    const adminSession = await getServerSession(authOptions);
    console.log(
      `Credentials emailed to student ${student.email} by admin ${adminSession?.user?.email ?? 'unknown'}`,
    );

    return {
      success: true,
      emailSent,
      tempPassword: emailSent ? tempPassword : undefined,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to send credentials email',
    };
  }
}

// --- BULK CREDENTIALS RETRIEVAL ---
export async function getBulkCredentials(
  studentIds: string[],
  adminPassword: string,
) {
  try {
    // Verify admin password first
    const isVerified = await verifyAdminPassword(adminPassword);
    if (!isVerified) {
      return {
        success: false,
        error: 'Invalid admin password',
      };
    }

    await dbConnect();

    const credentials = [];

    for (const studentId of studentIds) {
      const student = await Student.findById(studentId);
      if (!student) continue;

      credentials.push({
        studentId: student._id.toString(),
        name: student.name,
        email: student.email,
        mobileNo: student.mobileNo,
        uid: student.uid,
        institution: student.institution,
        classLevel: student.classLevel,
        stream: student.stream,
      });
    }

    // Log the bulk action
    const adminSession = await getServerSession(authOptions);
    console.log(
      `Bulk credentials accessed for ${credentials.length} students by admin ${adminSession?.user?.email ?? 'unknown'}`,
    );

    return {
      success: true,
      credentials,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to retrieve bulk credentials',
    };
  }
}

// --- BULK EMAIL CREDENTIALS ---
export async function sendBulkCredentialsEmails(
  studentIds: string[],
  adminPassword: string,
) {
  try {
    // Verify admin password first
    const isVerified = await verifyAdminPassword(adminPassword);
    if (!isVerified) {
      return {
        success: false,
        error: 'Invalid admin password',
      };
    }

    await dbConnect();

    const students = [];

    for (const studentId of studentIds) {
      const student = await Student.findById(studentId);
      if (!student) continue;

      // Intentional: generates a new temp password and emails it to the student
      const tempPassword = `Sol9x@${crypto.randomBytes(4).toString('base64url')}`;
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Update student password
      await Student.findByIdAndUpdate(studentId, { password: hashedPassword });

      students.push({
        email: student.email,
        name: student.name,
        password: tempPassword,
      });
    }

    // Send bulk emails
    const result = await emailService.sendBulkCredentialsEmail(students);

    // Log the bulk action
    const adminSession = await getServerSession(authOptions);
    console.log(
      `Bulk credentials emailed to ${result.success} students by admin ${adminSession?.user?.email ?? 'unknown'}`,
    );

    return {
      ...result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send bulk credentials emails',
    };
  }
}
