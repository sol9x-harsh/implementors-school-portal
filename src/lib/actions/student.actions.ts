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

// --- STUDENT ANALYTICS ---
export async function getStudentDashboardData() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const studentId = session.user.id;
  const user = await User.findById(studentId);
  const targetCohorts = ["all"];
  if (user?.classLevel) targetCohorts.push(`class${user.classLevel}`);

  const verifiedAchievements = await DataSubmission.countDocuments({
    studentId,
    status: "VERIFIED",
  });

  const activeRequests = await DataRequest.countDocuments({
    deadline: { $gte: new Date() },
    targetAudience: { $in: targetCohorts }
  });

  const grades = await InternalGrade.findOne({ studentId }).sort({ createdAt: -1 });

  return {
    verifiedAchievements,
    activeRequests,
    portfolioIntegrity: 72, // Logic for score could be complex
    subjects: grades
      ? Object.entries(
          grades.marks instanceof Map
            ? Object.fromEntries(grades.marks)
            : (grades.marks as Record<string, number>)
        ).map(([name, score]) => ({ name, score: Number(score), max: 100 }))
      : [],
  };
}

// --- TARGETED CONTENT ---
export async function getAvailableEvents() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return [];
  const user = await User.findById(session.user.id);
  const targetCohorts = ["all"];
  if (user?.classLevel) targetCohorts.push(`class${user.classLevel}`);

  const events = await Event.find({
    $or: [
      { targetAudience: { $in: targetCohorts } },
      { targetAudience: { $size: 0 } } // Also include events with no specific audience
    ]
  }).sort({ eventDate: 1 }).limit(5);

  return events.map((e) => ({
    id: e._id.toString(),
    title: e.title,
    description: e.description,
    eventDate: e.eventDate?.toISOString(),
    externalUrl: e.externalUrl,
    targetAudience: e.targetAudience,
  }));
}

export async function getActiveDataRequests() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return [];
  const user = await User.findById(session.user.id);
  const targetCohorts = ["all"];
  if (user?.classLevel) targetCohorts.push(`class${user.classLevel}`);

  const requests = await DataRequest.find({ 
    deadline: { $gte: new Date() },
    targetAudience: { $in: targetCohorts }
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

// --- DYNAMIC FORM SUBMISSION ---
export async function submitDataRequest(requestId: string, formData: FormData) {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  // Convert FormData to a standard plain object payload
  const payload: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Basic mapping, in a real scenario we'd handle file uploads to S3/Blob here
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

// --- EVENT REGISTRATION & CLAIM LOOP ---
export async function registerForEvent(eventId: string) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  await EventRegistration.create({
    studentId: session.user.id,
    eventId,
    status: "REGISTERED",
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function claimEventResult(registrationId: string, formData: FormData) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const claimedRank = formData.get("claimedRank") as string;
  // Handle file upload for certificateUrl here
  
  await EventRegistration.findByIdAndUpdate(registrationId, {
    status: "VERIFIED",
    claimedRank,
  });

  revalidatePath("/activities");
  return { success: true };
}
