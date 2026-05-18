'use server';

import dbConnect from '@/lib/db/mongodb';
import InternalGrade from '@/lib/models/InternalGrade';
import Event from '@/lib/models/Event';
import DataRequest from '@/lib/models/DataRequest';
import DataSubmission from '@/lib/models/DataSubmission';
import EventRegistration from '@/lib/models/EventRegistration';
import Student from '@/lib/models/Student';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { buildStudentCohortIds } from '@/lib/constants/cohorts';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function requireStudent() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Unauthorized');
  }
  return session;
}

/** Build the list of cohort tags the student belongs to */
async function buildStudentCohorts(userId: string) {
  const user = await Student.findById(userId);
  if (!user) return { user: null, cohorts: ['all'] };

  const cohorts = buildStudentCohortIds(
    user.classLevel,
    user.stream,
    user.institution,
  );
  return { user, cohorts };
}

// ─── STUDENT DASHBOARD DATA ─────────────────────────────────────────────────

export async function getStudentDashboardData() {
  await dbConnect();
  const session = await requireStudent();

  const studentId = session.user.id;
  const { user, cohorts } = await buildStudentCohorts(studentId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    verifiedAchievements,
    availableEvents,
    activeRequests,
    totalRegistrations,
    totalSubmissions,
    grades,
  ] = await Promise.all([
    DataSubmission.countDocuments({ studentId, status: 'VERIFIED' }),
    Event.countDocuments({
      eventDate: { $gte: today },
      $or: [
        { targetAudience: { $in: [...cohorts, null] } },
        { targetAudience: { $size: 0 } },
        { targetAudience: { $exists: false } },
      ],
    }),
    DataRequest.countDocuments({
      deadline: { $gte: today },
      targetAudience: { $in: [...cohorts, null] },
    }),
    EventRegistration.countDocuments({ studentId }),
    DataSubmission.countDocuments({ studentId }),
    InternalGrade.findOne({ studentId }).sort({ createdAt: -1 }),
  ]);

  // Portfolio Integrity = (events registered + forms submitted) / (total events + total forms) × 100
  const totalOpportunities = availableEvents + activeRequests;
  const totalEngagement = totalRegistrations + totalSubmissions;
  const portfolioIntegrity =
    totalOpportunities > 0
      ? Math.min(100, Math.round((totalEngagement / totalOpportunities) * 100))
      : 0;

  return {
    verifiedAchievements,
    availableEvents,
    activeRequests,
    portfolioIntegrity,
    subjects: grades
      ? Object.entries(
          grades.marks instanceof Map
            ? Object.fromEntries(grades.marks)
            : (grades.marks as Record<string, number>),
        ).map(([name, score]) => ({ name, score: Number(score), max: 100 }))
      : [],
  };
}

// ─── AVAILABLE EVENTS (current, non-expired) ────────────────────────────────

export async function getAvailableEvents() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { cohorts } = await buildStudentCohorts(session.user.id);

  const events = await Event.find({
    eventDate: { $gte: today },
    $or: [
      { targetAudience: { $in: [...cohorts, null] } },
      { targetAudience: { $size: 0 } },
      { targetAudience: { $exists: false } },
    ],
  }).sort({ createdAt: -1 });

  return events.map((e) => ({
    id: e._id.toString(),
    title: e.title,
    description: e.description,
    eventDate: e.eventDate?.toISOString(),
    externalUrl: e.externalUrl,
    targetAudience: e.targetAudience,
  }));
}

// ─── PAST EVENTS (expired deadline) ─────────────────────────────────────────

export async function getPastEvents() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { cohorts } = await buildStudentCohorts(session.user.id);

  const events = await Event.find({
    eventDate: { $lt: today },
    $or: [
      { targetAudience: { $in: [...cohorts, null] } },
      { targetAudience: { $size: 0 } },
      { targetAudience: { $exists: false } },
    ],
  }).sort({ eventDate: -1 });

  return events.map((e) => ({
    id: e._id.toString(),
    title: e.title,
    description: e.description,
    eventDate: e.eventDate?.toISOString(),
    externalUrl: e.externalUrl,
    targetAudience: e.targetAudience,
  }));
}

// ─── ACTIVE DATA REQUESTS ───────────────────────────────────────────────────

export async function getActiveDataRequests() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { cohorts } = await buildStudentCohorts(session.user.id);

  const requests = await DataRequest.find({
    deadline: { $gte: today },
    targetAudience: { $in: [...cohorts, null] },
  }).sort({ deadline: 1 });

  return requests.map((r) => ({
    id: r._id.toString(),
    title: r.title,
    deadline: r.deadline?.toISOString(),
    targetAudience: r.targetAudience,
    formSchema: r.formSchema,
  }));
}

export async function getDataRequestById(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  const request = await DataRequest.findById(requestId);
  return request ? JSON.parse(JSON.stringify(request)) : null;
}

// ─── STUDENT REGISTRATIONS MAP ──────────────────────────────────────────────

export async function getStudentRegistrations(): Promise<
  Record<string, string>
> {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return {};

  const regs = await EventRegistration.find({ studentId: session.user.id });
  const map: Record<string, string> = {};
  for (const r of regs) {
    map[r.eventId.toString()] = r.status;
  }
  return map;
}

// ─── STUDENT PROFILE ────────────────────────────────────────────────────────

export async function getStudentProfile() {
  await dbConnect();
  const session = await requireStudent();
  const user = await Student.findById(session.user.id);
  if (!user) throw new Error('Student not found');

  const [eventCount, formCount, gradeRecord] = await Promise.all([
    EventRegistration.countDocuments({ studentId: session.user.id }),
    DataSubmission.countDocuments({ studentId: session.user.id }),
    InternalGrade.findOne({ studentId: session.user.id }).sort({
      createdAt: -1,
    }),
  ]);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    mobileNo: user.mobileNo,
    institution: user.institution,
    uid: user.uid,
    classLevel: user.classLevel,
    stream: user.stream,
    subjects: user.subjects,
    fatherName: user.fatherName,
    fatherOccupation: user.fatherOccupation,
    fatherMobile: user.fatherMobile,
    fatherEmail: user.fatherEmail,
    motherName: user.motherName,
    motherOccupation: user.motherOccupation,
    motherMobile: user.motherMobile,
    motherEmail: user.motherEmail,
    targetedExams: user.targetedExams,
    targetedInstitutions: user.targetedInstitutions,
    targetedCountries: user.targetedCountries,
    targetedCourses: user.targetedCourses,
    otherTargets: user.otherTargets,
    createdAt: user.createdAt?.toISOString(),
    // Stats
    eventsRegistered: eventCount,
    formsSubmitted: formCount,
    hasGrades: !!gradeRecord,
  };
}

// ─── DYNAMIC FORM SUBMISSION ────────────────────────────────────────────────

export async function submitDataRequest(requestId: string, formData: FormData) {
  await dbConnect();
  const session = await requireStudent();

  const payload: Record<string, any> = {};
  formData.forEach((value, key) => {
    payload[key] = value;
  });

  await DataSubmission.create({
    requestId,
    studentId: session.user.id,
    payload,
    status: 'SUBMITTED',
  });

  revalidatePath('/');
  return { success: true };
}

// ─── EVENT REGISTRATION & CLAIM LOOP ────────────────────────────────────────

export async function registerForEvent(eventId: string) {
  await dbConnect();
  const session = await requireStudent();

  // Prevent duplicate registration
  const existing = await EventRegistration.findOne({
    studentId: session.user.id,
    eventId,
  });
  if (existing) {
    return { success: true, alreadyRegistered: true };
  }

  await EventRegistration.create({
    studentId: session.user.id,
    eventId,
    status: 'REGISTERED',
  });

  revalidatePath('/activities');
  return { success: true };
}

export async function claimEventResult(
  registrationId: string,
  formData: FormData,
) {
  await dbConnect();
  const session = await requireStudent();

  const claimedRank = formData.get('claimedRank') as string;

  await EventRegistration.findByIdAndUpdate(registrationId, {
    status: 'VERIFIED',
    claimedRank,
  });

  revalidatePath('/activities');
  return { success: true };
}

// --- STUDENT PROFILE UPDATE ---
export async function updateStudentProfile(formData: FormData) {
  await dbConnect();
  const session = await requireStudent();

  const studentId = session.user.id;

  // Extract form data for optional fields only
  const institution = formData.get('institution') as string;
  const classLevel = formData.get('classLevel') as string;
  const stream = formData.get('stream') as string;
  const subjects = formData.get('subjects') as string;
  const linkedInId = formData.get('linkedInId') as string;
  const fatherName = formData.get('fatherName') as string;
  const fatherOccupation = formData.get('fatherOccupation') as string;
  const fatherMobile = formData.get('fatherMobile') as string;
  const fatherEmail = formData.get('fatherEmail') as string;
  const motherName = formData.get('motherName') as string;
  const motherOccupation = formData.get('motherOccupation') as string;
  const motherMobile = formData.get('motherMobile') as string;
  const motherEmail = formData.get('motherEmail') as string;
  const targetedExams = formData.get('targetedExams') as string;
  const targetedInstitutions = formData.get('targetedInstitutions') as string;
  const targetedCountries = formData.get('targetedCountries') as string;
  const targetedCourses = formData.get('targetedCourses') as string;
  const otherTargets = formData.get('otherTargets') as string;

  try {
    // Parse array fields
    const subjectsArray = subjects
      ? subjects
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s)
      : [];
    const targetedExamsArray = targetedExams
      ? targetedExams
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e)
      : [];
    const targetedInstitutionsArray = targetedInstitutions
      ? targetedInstitutions
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i)
      : [];
    const targetedCountriesArray = targetedCountries
      ? targetedCountries
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c)
      : [];
    const targetedCoursesArray = targetedCourses
      ? targetedCourses
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c)
      : [];
    const otherTargetsArray = otherTargets
      ? otherTargets
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t)
      : [];

    // Update only optional fields
    const updateData: any = {};

    if (institution !== undefined)
      updateData.institution = institution || undefined;
    if (classLevel !== undefined)
      updateData.classLevel = classLevel || undefined;
    if (stream !== undefined) updateData.stream = stream || undefined;
    if (subjectsArray.length > 0) updateData.subjects = subjectsArray;
    if (linkedInId !== undefined)
      updateData.linkedInId = linkedInId || undefined;
    if (fatherName !== undefined)
      updateData.fatherName = fatherName || undefined;
    if (fatherOccupation !== undefined)
      updateData.fatherOccupation = fatherOccupation || undefined;
    if (fatherMobile !== undefined)
      updateData.fatherMobile = fatherMobile || undefined;
    if (fatherEmail !== undefined)
      updateData.fatherEmail = fatherEmail || undefined;
    if (motherName !== undefined)
      updateData.motherName = motherName || undefined;
    if (motherOccupation !== undefined)
      updateData.motherOccupation = motherOccupation || undefined;
    if (motherMobile !== undefined)
      updateData.motherMobile = motherMobile || undefined;
    if (motherEmail !== undefined)
      updateData.motherEmail = motherEmail || undefined;
    if (targetedExamsArray.length > 0)
      updateData.targetedExams = targetedExamsArray;
    if (targetedInstitutionsArray.length > 0)
      updateData.targetedInstitutions = targetedInstitutionsArray;
    if (targetedCountriesArray.length > 0)
      updateData.targetedCountries = targetedCountriesArray;
    if (targetedCoursesArray.length > 0)
      updateData.targetedCourses = targetedCoursesArray;
    if (otherTargetsArray.length > 0)
      updateData.otherTargets = otherTargetsArray;

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No changes to update' };
    }

    await Student.findByIdAndUpdate(studentId, updateData);

    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
}
