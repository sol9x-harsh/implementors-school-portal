"use server";

import dbConnect from "@/lib/db/mongodb";
import InternalGrade from "@/lib/models/InternalGrade";
import Event from "@/lib/models/Event";
import DataRequest from "@/lib/models/DataRequest";
import DataSubmission from "@/lib/models/DataSubmission";
import EventRegistration from "@/lib/models/EventRegistration";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function requireStudent() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }
  return session;
}

/** Build the list of cohort tags the student belongs to */
async function buildStudentCohorts(userId: string) {
  const user = await User.findById(userId);
  // Very inclusive list for maximum visibility of both legacy and new data
  const cohorts = ["all", "global", "ALL", "GLOBAL"];
  
  if (user) {
    if (user.classLevel) {
      const cl = user.classLevel.toString();
      cohorts.push(cl.toLowerCase());
      cohorts.push(cl.toUpperCase());
      cohorts.push(`class${cl.toLowerCase()}`);
      cohorts.push(`CLASS${cl.toUpperCase()}`);
      cohorts.push(`Class ${cl}`);
      cohorts.push(`class ${cl.toLowerCase()}`);
    }
    
    if (user.stream) {
      const st = user.stream.toString();
      cohorts.push(st.toLowerCase());
      cohorts.push(st.toUpperCase());
      
      // Handle "PCM" / "Science" overlap if possible
      if (st.toLowerCase().includes('pcm') || st.toLowerCase().includes('physics')) {
        cohorts.push('Science');
        cohorts.push('SCIENCE');
        cohorts.push('science');
      }

      if (user.classLevel) {
        const combined = `class${user.classLevel}${st}`.toLowerCase();
        cohorts.push(combined);
        cohorts.push(combined.toUpperCase());
      }
    }
  }
  return { user, cohorts };
}

// ─── STUDENT DASHBOARD DATA ─────────────────────────────────────────────────

export async function getStudentDashboardData() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const studentId = session.user.id;
  const { user, cohorts } = await buildStudentCohorts(studentId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [verifiedAchievements, availableEvents, activeRequests, totalRegistrations, totalSubmissions, grades] =
    await Promise.all([
      DataSubmission.countDocuments({ studentId, status: "VERIFIED" }),
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
            : (grades.marks as Record<string, number>)
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
  const user = await User.findById(session.user.id);
  if (!user) throw new Error("User not found");

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
    studentType: user.studentType,
    classLevel: user.classLevel,
    stream: user.stream,
    college: user.college,
    course: user.course,
    year: user.year,
    subjects: user.subjects,
    fatherName: user.fatherName,
    fatherOccupation: user.fatherOccupation,
    fatherMobile: user.fatherMobile,
    fatherEmail: user.fatherEmail,
    motherName: user.motherName,
    motherOccupation: user.motherOccupation,
    motherMobile: user.motherMobile,
    motherEmail: user.motherEmail,
    linkedInId: user.linkedInId,
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

export async function submitDataRequest(
  requestId: string,
  formData: FormData
) {
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
    status: "VERIFIED",
  });

  revalidatePath("/");
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
    status: "REGISTERED",
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function claimEventResult(
  registrationId: string,
  formData: FormData
) {
  await dbConnect();
  const session = await requireStudent();

  const claimedRank = formData.get("claimedRank") as string;

  await EventRegistration.findByIdAndUpdate(registrationId, {
    status: "VERIFIED",
    claimedRank,
  });

  revalidatePath("/activities");
  return { success: true };
}
