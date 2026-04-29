'use server';

import dbConnect from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import DataRequest from '@/lib/models/DataRequest';
import DataSubmission from '@/lib/models/DataSubmission';
import User from '@/lib/models/User';
import InternalGrade from '@/lib/models/InternalGrade';
import EventRegistration from '@/lib/models/EventRegistration';
import AcademicTest from '@/lib/models/AcademicTest';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

// --- AUTH HELPER ---
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')
  ) {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

// --- DASHBOARD ANALYTICS ---
export async function getAdminDashboardStats() {
  await requireAdmin();
  await dbConnect();

  const totalStudents = await User.countDocuments({ role: 'STUDENT' });
  const publishedEvents = await Event.countDocuments();
  const activeRequests = await DataRequest.countDocuments({
    deadline: { $gte: new Date() },
  });

  // For charts
  const genderData = [
    {
      name: 'Male',
      value: await User.countDocuments({ role: 'STUDENT' }),
      color: 'oklch(0.60 0.18 280)',
    }, // Placeholder for actual gender field if added
    { name: 'Female', value: 0, color: 'oklch(0.75 0.15 300)' },
  ];

  return {
    totalStudents,
    publishedEvents,
    activeRequests,
    genderData,
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
  const audienceType = formData.get('audienceType') as string;

  // Linked resources (JSON strings from client)
  const linkedTestsRaw = formData.get('linkedTests') as string;
  const linkedActivitiesRaw = formData.get('linkedActivities') as string;
  const linkedExternalEventsRaw = formData.get(
    'linkedExternalEvents',
  ) as string;

  const linkedTests: string[] = linkedTestsRaw
    ? JSON.parse(linkedTestsRaw)
    : [];
  const linkedActivities: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    url?: string;
  }[] = linkedActivitiesRaw ? JSON.parse(linkedActivitiesRaw) : [];
  const linkedExternalEvents: {
    title: string;
    url?: string;
    startDate?: string;
    endDate?: string;
  }[] = linkedExternalEventsRaw ? JSON.parse(linkedExternalEventsRaw) : [];

  const newEvent = await Event.create({
    title,
    description,
    externalUrl,
    eventDate: new Date(eventDate),
    targetAudience: [audienceType],
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
  return { success: true, eventId: newEvent._id.toString() };
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
  const studentType = formData.get('studentType') as string;
  const classLevel = formData.get('classLevel') as string;
  const stream = formData.get('stream') as string;
  const college = formData.get('college') as string;
  const course = formData.get('course') as string;
  const year = formData.get('year') as string;

  if (!name || !email || !mobileNo) {
    return {
      success: false,
      error: 'Name, email, and mobile number are required.',
    };
  }

  // Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    return {
      success: false,
      error: 'A student with this email already exists.',
    };
  }

  // Generate a default password
  const defaultPassword = `Sol9x@${Math.random().toString(36).slice(2, 8)}`;
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  try {
    const student = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'STUDENT',
      mobileNo,
      institution: institution || undefined,
      studentType: studentType || undefined,
      classLevel: classLevel || undefined,
      stream: stream || undefined,
      college: college || undefined,
      course: course || undefined,
      year: year || undefined,
    });

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
    studentType?: string;
    classLevel?: string;
    stream?: string;
    college?: string;
    course?: string;
    year?: string;
  }[],
) {
  await requireAdmin();
  await dbConnect();

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of students) {
    if (!row.name || !row.email || !row.mobileNo) {
      skipped++;
      errors.push(
        `Skipped: Missing required fields for "${row.name || row.email || 'unknown'}"`,
      );
      continue;
    }

    const existing = await User.findOne({ email: row.email });
    if (existing) {
      skipped++;
      errors.push(`Skipped: Duplicate email "${row.email}"`);
      continue;
    }

    const defaultPassword = `Sol9x@${Math.random().toString(36).slice(2, 8)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    try {
      await User.create({
        name: row.name,
        email: row.email,
        password: hashedPassword,
        role: 'STUDENT',
        mobileNo: row.mobileNo,
        institution: row.institution || undefined,
        studentType: row.studentType || undefined,
        classLevel: row.classLevel || undefined,
        stream: row.stream || undefined,
        college: row.college || undefined,
        course: row.course || undefined,
        year: row.year || undefined,
      });
      created++;
    } catch {
      skipped++;
      errors.push(`Skipped: Failed to create "${row.email}"`);
    }
  }

  revalidatePath('/admin/students');
  return { success: true, created, skipped, errors };
}

// --- STUDENT DIRECTORY ---
export async function getStudentsDirectory() {
  await requireAdmin();
  await dbConnect();

  const students = await User.find({ role: 'STUDENT' }).sort({ createdAt: -1 });

  return students.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    email: s.email,
    mobileNo: s.mobileNo,
    institution: s.institution,
    studentType: s.studentType,
    classLevel: s.classLevel,
    stream: s.stream,
    college: s.college,
    course: s.course,
    year: s.year,
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
    User.countDocuments({ role: 'STUDENT', classLevel: '12' }),
    User.countDocuments({
      role: 'STUDENT',
      classLevel: '12',
      stream: { $regex: /pcm|physics|science/i },
    }),
    User.countDocuments({ role: 'STUDENT', classLevel: '11' }),
    User.countDocuments({ role: 'STUDENT' }),
  ]);

  return { class12, class12pcm, class11, total };
}

export async function getStudentById(id: string) {
  await requireAdmin();
  await dbConnect();
  const student = await User.findById(id);
  if (!student) return null;

  return {
    id: student._id.toString(),
    name: student.name,
    email: student.email,
    mobileNo: student.mobileNo,
    role: student.role,
    institution: student.institution,
    studentType: student.studentType,
    classLevel: student.classLevel,
    subjects: student.subjects,
    stream: student.stream,
    college: student.college,
    course: student.course,
    year: student.year,
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
    linkedInId: student.linkedInId,
    createdAt: student.createdAt?.toISOString(),
  };
}
