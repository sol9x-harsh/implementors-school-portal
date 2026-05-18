'use server';

import dbConnect from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import DataRequest from '@/lib/models/DataRequest';
import DataSubmission from '@/lib/models/DataSubmission';
import Admin from '@/lib/models/Admin';
import Student from '@/lib/models/Student';
import InternalGrade from '@/lib/models/InternalGrade';
import EventRegistration from '@/lib/models/EventRegistration';
import AcademicTest from '@/lib/models/AcademicTest';
import AnnualReport, { IAnnualReport } from '@/lib/models/AnnualReport';
import { COHORT_OPTIONS } from '@/lib/constants/cohorts';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { emailService } from '@/lib/email/service';

// --- AUTH HELPER ---
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

// --- DASHBOARD ANALYTICS ---
export async function getAdminDashboardStats() {
  await requireAdmin();
  await dbConnect();

  const now = new Date();

  // Month boundaries
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // ── Core KPI counts ────────────────────────────────────────
  const [
    totalStudents,
    studentsThisMonth,
    studentsLastMonth,
    publishedEvents,
    upcomingEvents,
    activeRequests,
    expiringRequests,
  ] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
    Student.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),
    Event.countDocuments(),
    Event.countDocuments({ eventDate: { $gte: now } }),
    DataRequest.countDocuments({ deadline: { $gte: now } }),
    DataRequest.countDocuments({
      deadline: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Stream-level breakdown
  const streamAgg = await Student.aggregate([
    { $match: { stream: { $exists: true, $ne: '' } } },
    { $group: { _id: '$stream', value: { $sum: 1 } } },
    { $sort: { value: -1 } },
    { $limit: 6 },
  ]);

  // Build bar chart data: top streams
  const genderData = [
    ...streamAgg.map((s: any, i: number) => ({
      name: s._id,
      value: s.value,
      color:
        i === 0
          ? 'var(--purple-primary)'
          : `oklch(${0.65 + i * 0.04} 0.14 ${270 + i * 15})`,
    })),
  ];

  // ── Delta strings (real data) ──────────────────────────────
  const studentDelta =
    studentsThisMonth > 0
      ? `+${studentsThisMonth} this month`
      : studentsLastMonth > 0
        ? `${studentsLastMonth} last month`
        : 'No new this month';

  const studentUp =
    studentsThisMonth > 0 || studentsLastMonth === 0 ? true : false;

  const eventDelta =
    upcomingEvents > 0 ? `${upcomingEvents} upcoming` : 'No upcoming events';

  const requestDelta =
    expiringRequests > 0
      ? `${expiringRequests} expiring soon`
      : activeRequests > 0
        ? `${activeRequests} active`
        : 'None open';

  return {
    totalStudents,
    publishedEvents,
    activeRequests,
    genderData,
    // Real deltas
    studentDelta,
    studentUp,
    eventDelta,
    upcomingEvents,
    requestDelta,
  };
}

// --- ACTIVITY FEED ---
export async function getRecentActivity() {
  await requireAdmin();
  await dbConnect();

  const events = await Event.find().sort({ createdAt: -1 }).limit(3);
  const forms = await DataRequest.find().sort({ createdAt: -1 }).limit(3);

  const activities = [
    ...events.map((e) => ({
      title: e.title,
      desc: e.description,
      type: 'event',
      time: 'Recent',
      icon: 'CalendarPlus',
    })),
    ...forms.map((f) => ({
      title: f.title,
      desc: `Deadline: ${f.deadline?.toLocaleDateString()}`,
      type: 'update',
      time: 'Recent',
      icon: 'FileText',
    })),
  ];

  return activities.slice(0, 5);
}

// --- SMART EVENT PUBLICATION ---
export async function createEvent(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const externalUrl = formData.get('url') as string;
  const eventDate = formData.get('date') as string;
  const audienceType = formData.get('audienceType') as string; // 'global' or 'cohort'
  const cohort = formData.get('cohort') as string;

  // Map to stored audience format: 'all' for global, or specific cohort ID
  const targetAudience =
    audienceType === 'global' || !cohort ? ['all'] : [cohort];

  // Linked resources (JSON strings from client)
  const linkedTestsRaw = formData.get('linkedTests') as string;
  const linkedActivitiesRaw = formData.get('linkedActivities') as string;
  const linkedExternalEventsRaw = formData.get(
    'linkedExternalEvents',
  ) as string;

  const linkedTests: string[] = linkedTestsRaw
    ? JSON.parse(linkedTestsRaw)
    : [];
  const linkedActivities: any[] = linkedActivitiesRaw
    ? JSON.parse(linkedActivitiesRaw)
    : [];
  const linkedExternalEvents: any[] = linkedExternalEventsRaw
    ? JSON.parse(linkedExternalEventsRaw)
    : [];

  const newEvent = await Event.create({
    title,
    description,
    externalUrl,
    eventDate: new Date(eventDate),
    targetAudience,
    linkedTests: linkedTests.length > 0 ? linkedTests : [],
    linkedActivities: linkedActivities.map((a) => ({
      ...a,
      startDate: a.startDate ? new Date(a.startDate) : undefined,
      endDate: a.endDate ? new Date(a.endDate) : undefined,
    })),
    linkedExternalEvents: linkedExternalEvents.map((e) => ({
      ...e,
      startDate: e.startDate ? new Date(e.startDate) : undefined,
      endDate: e.endDate ? new Date(e.endDate) : undefined,
    })),
  });

  revalidatePath('/admin/events');
  revalidatePath('/activities');
  return { success: true, eventId: newEvent._id.toString() };
}

export async function getEvents() {
  await requireAdmin();
  await dbConnect();

  const events = await Event.find().sort({ createdAt: -1 });
  return events.map((e) => ({
    id: e._id.toString(),
    title: e.title,
    description: e.description,
    url: e.externalUrl,
    date: e.eventDate?.toISOString(),
    targetAudience: e.targetAudience,
  }));
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const externalUrl = formData.get('url') as string;
  const eventDate = formData.get('date') as string;
  const audienceType = formData.get('audienceType') as string;
  const cohort = formData.get('cohort') as string;

  const targetAudience = audienceType === 'global' ? ['all'] : [cohort];

  await Event.findByIdAndUpdate(id, {
    title,
    description,
    externalUrl,
    eventDate: new Date(eventDate),
    targetAudience,
  });

  revalidatePath('/admin/events');
  revalidatePath('/activities');
  return { success: true };
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  await dbConnect();

  await Event.findByIdAndDelete(id);

  revalidatePath('/admin/events');
  revalidatePath('/activities');
  return { success: true };
}

// --- ACADEMIC TESTS FOR LINKING ---
export async function getAcademicTestsForLinking() {
  await requireAdmin();
  await dbConnect();

  const tests = await AcademicTest.find()
    .sort({ date: -1 })
    .select('name date targetClass targetStream');
  return tests.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    date: t.date?.toISOString(),
    targetClass: t.targetClass,
    targetStream: t.targetStream,
  }));
}

// --- DYNAMIC FORM BUILDER ---
export async function createDataRequest(
  formData: FormData,
  schemaJson: Record<string, any>,
) {
  await requireAdmin();
  await dbConnect();

  const title = formData.get('title') as string;
  const deadline = formData.get('deadline') as string;
  const targetAudience = formData.get('targetAudience') as string;

  const newRequest = await DataRequest.create({
    title,
    deadline: new Date(deadline),
    targetAudience: [targetAudience],
    formSchema: schemaJson,
  });

  revalidatePath('/admin/forms');
  return { success: true, requestId: newRequest._id.toString() };
}

// --- BULK DATA INJECTION ---
export async function processBulkUpload(type: string, csvData: any[]) {
  await requireAdmin();
  await dbConnect();

  if (type === 'admissions') {
    // Process new user creation
    // Assuming csvData = [{ admissionNumber, name, email, gradeLevel, stream }]
    // Generate secure passwords and send welcome emails here
  } else if (type === 'term1' || type === 'term2') {
    // Process internal marks mapping
    // Assuming csvData = [{ admissionNumber, Math: 90, Physics: 85 }]
  }

  revalidatePath('/admin/bulk-upload');
  return { success: true, count: csvData.length };
}

// --- CREATE SINGLE STUDENT ---
export async function createStudent(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const mobileNo = formData.get('mobileNo') as string;
  const institution = formData.get('institution') as string;
  const classLevel = formData.get('classLevel') as string;
  const stream = formData.get('stream') as string;
  const fatherName = formData.get('fatherName') as string;
  const fatherOccupation = formData.get('fatherOccupation') as string;
  const fatherMobile = formData.get('fatherMobile') as string;
  const fatherEmail = formData.get('fatherEmail') as string;
  const motherName = formData.get('motherName') as string;
  const motherOccupation = formData.get('motherOccupation') as string;
  const motherMobile = formData.get('motherMobile') as string;
  const motherEmail = formData.get('motherEmail') as string;

  if (!name || !email || !mobileNo) {
    return {
      success: false,
      error: 'Name, email, and mobile number are required.',
    };
  }

  // Check for duplicate email (in both collections for global uniqueness)
  const existingStudent = await Student.findOne({ email });
  const existingAdmin = await Admin.findOne({ email });
  if (existingStudent || existingAdmin) {
    return {
      success: false,
      error: 'A user with this email already exists.',
    };
  }

  // Generate a default password
  const defaultPassword = `Sol9x@${crypto.randomBytes(4).toString('base64url')}`;
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  try {
    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      mobileNo,
      institution: institution || undefined,
      classLevel: classLevel || undefined,
      stream: stream || undefined,
      uid: `SOL9X-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      fatherName: fatherName || undefined,
      fatherOccupation: fatherOccupation || undefined,
      fatherMobile: fatherMobile || undefined,
      fatherEmail: fatherEmail || undefined,
      motherName: motherName || undefined,
      motherOccupation: motherOccupation || undefined,
      motherMobile: motherMobile || undefined,
      motherEmail: motherEmail || undefined,
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, name, defaultPassword);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the student creation if email fails
    }

    revalidatePath('/admin/students');
    return {
      success: true,
      studentId: student._id.toString(),
      defaultPassword,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create student.',
    };
  }
}

// --- BULK CREATE STUDENTS (CSV) ---
export async function bulkCreateStudents(
  students: {
    name: string;
    email: string;
    mobileNo: string;
    institution?: string;
    classLevel?: string;
    stream?: string;
  }[],
) {
  await requireAdmin();
  await dbConnect();

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];
  const credentials: Array<{
    name: string;
    email: string;
    password: string;
    uid: string;
    mobileNo: string;
    institution?: string;
    classLevel?: string;
    stream?: string;
  }> = [];

  for (const row of students) {
    if (!row.name || !row.email || !row.mobileNo) {
      skipped++;
      errors.push(
        `Skipped: Missing required fields for "${row.name || row.email || 'unknown'}"`,
      );
      continue;
    }

    const existing = await Student.findOne({ email: row.email });
    if (existing) {
      skipped++;
      errors.push(`Skipped: Duplicate email "${row.email}"`);
      continue;
    }

    const defaultPassword = `Sol9x@${crypto.randomBytes(4).toString('base64url')}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    const uid = `SOL9X-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    try {
      const student = await Student.create({
        name: row.name,
        email: row.email,
        password: hashedPassword,
        mobileNo: row.mobileNo,
        institution: row.institution || undefined,
        classLevel: row.classLevel || undefined,
        stream: row.stream || undefined,
        uid,
      });

      credentials.push({
        name: row.name,
        email: row.email,
        password: defaultPassword,
        uid,
        mobileNo: row.mobileNo,
        institution: row.institution,
        classLevel: row.classLevel,
        stream: row.stream,
      });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(
          row.email,
          row.name,
          defaultPassword,
        );
      } catch (emailError) {
        console.error(
          `Failed to send welcome email to ${row.email}:`,
          emailError,
        );
        // Don't fail the student creation if email fails
      }

      created++;
    } catch {
      skipped++;
      errors.push(`Skipped: Failed to create "${row.email}"`);
    }
  }

  revalidatePath('/admin/students');
  return { success: true, created, skipped, errors, credentials };
}

// --- STUDENT DIRECTORY ---
export async function getStudentsDirectory() {
  await requireAdmin();
  await dbConnect();

  const students = await Student.find().sort({ createdAt: -1 });

  return students.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    email: s.email,
    mobileNo: s.mobileNo,
    institution: s.institution,
    uid: s.uid,
    classLevel: s.classLevel,
    stream: s.stream,
    createdAt: s.createdAt?.toISOString(),
  }));
}

// --- STUDENT PORTAL ACTIVITY (for admin profile view) ---
export async function getStudentPortalStats(studentId: string) {
  await requireAdmin();
  await dbConnect();

  const [eventCount, formCount, gradeRecord] = await Promise.all([
    EventRegistration.countDocuments({ studentId }),
    DataSubmission.countDocuments({ studentId }),
    InternalGrade.findOne({ studentId }).sort({ createdAt: -1 }),
  ]);

  const hasGrades = !!gradeRecord;

  return { eventCount, formCount, hasGrades };
}

// --- COHORT COUNTS for Annual Reports ---
export async function getCohortCounts() {
  await requireAdmin();
  await dbConnect();

  const [class12, class12pcm, class11, total] = await Promise.all([
    Student.countDocuments({ classLevel: '12' }),
    Student.countDocuments({
      classLevel: '12',
      stream: { $regex: /pcm|physics|science/i },
    }),
    Student.countDocuments({ classLevel: '11' }),
    Student.countDocuments(),
  ]);

  return { class12, class12pcm, class11, total };
}

export async function getStudentById(id: string) {
  await requireAdmin();
  await dbConnect();
  const student = await Student.findById(id);
  if (!student) return null;

  return {
    id: student._id.toString(),
    name: student.name,
    email: student.email,
    mobileNo: student.mobileNo,
    institution: student.institution,
    uid: student.uid,
    classLevel: student.classLevel,
    subjects: student.subjects,
    stream: student.stream,
    fatherName: student.fatherName,
    fatherOccupation: student.fatherOccupation,
    fatherMobile: student.fatherMobile,
    fatherEmail: student.fatherEmail,
    motherName: student.motherName,
    motherOccupation: student.motherOccupation,
    motherMobile: student.motherMobile,
    motherEmail: student.motherEmail,
    targetedExams: student.targetedExams,
    targetedInstitutions: student.targetedInstitutions,
    targetedCountries: student.targetedCountries,
    targetedCourses: student.targetedCourses,
    otherTargets: student.otherTargets,
    createdAt: student.createdAt?.toISOString(),
  };
}

// --- ANNUAL REPORTS ---

function buildCohortQuery(cohortValue: string): Record<string, unknown> {
  if (cohortValue === 'all') return {};

  const parts = cohortValue.split(':');
  const query: Record<string, unknown> = {};

  // parts[1] is classLevel (e.g. "12"), parts[2] is stream key
  if (parts[1]) query.classLevel = parts[1];

  if (parts[2]) {
    switch (parts[2]) {
      case 'pcm':
        query.stream = { $regex: /Science \(PCM\)/i };
        break;
      case 'pcb':
        query.stream = { $regex: /Science \(PCB\)/i };
        break;
      case 'pcmb':
        query.stream = { $regex: /Science \(PCMB\)/i };
        break;
      case 'commerce_math':
        query.stream = { $regex: /Commerce \(With Maths\)/i };
        break;
      case 'commerce_no_math':
        query.stream = { $regex: /Commerce \(Without Maths\)/i };
        break;
      case 'humanities':
        query.stream = { $regex: /Humanities/i };
        break;
    }
  }

  return query;
}

export async function getCohortOptionsWithCounts() {
  await requireAdmin();
  await dbConnect();

  const results = await Promise.all(
    COHORT_OPTIONS.map(async (opt) => {
      const count = await Student.countDocuments(buildCohortQuery(opt.value));
      return { value: opt.value, label: opt.label, count };
    })
  );

  return results;
}

export async function generateAnnualReport(cohortValue: string) {
  const session = await requireAdmin();
  await dbConnect();

  const cohortOption = COHORT_OPTIONS.find((o) => o.value === cohortValue);
  if (!cohortOption) throw new Error('Invalid cohort value');

  const studentCount = await Student.countDocuments(buildCohortQuery(cohortValue));

  const report = (await AnnualReport.create({
    cohortValue,
    cohortLabel: cohortOption.label,
    studentCount,
    generatedAt: new Date(),
    status: 'complete',
    generatedBy: session.user.email ?? undefined,
  })) as IAnnualReport;

  revalidatePath('/admin/reports');

  return {
    success: true,
    report: {
      id: (report._id as { toString(): string }).toString(),
      cohortValue: report.cohortValue,
      cohortLabel: report.cohortLabel,
      studentCount: report.studentCount,
      generatedAt: report.generatedAt.toISOString(),
      status: report.status as 'complete' | 'failed',
      generatedBy: report.generatedBy,
    },
  };
}

export async function getAnnualReports() {
  await requireAdmin();
  await dbConnect();

  const reports = await AnnualReport.find().sort({ generatedAt: -1 }).limit(100);

  return reports.map((r) => ({
    id: (r._id as { toString(): string }).toString(),
    cohortValue: r.cohortValue,
    cohortLabel: r.cohortLabel,
    studentCount: r.studentCount,
    generatedAt: r.generatedAt.toISOString(),
    status: r.status as 'complete' | 'failed',
    generatedBy: r.generatedBy,
  }));
}
