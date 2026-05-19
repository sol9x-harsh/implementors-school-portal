"use server";

import dbConnect from "@/lib/db/mongodb";
import AcademicTest from "@/lib/models/AcademicTest";
import TestGrade from "@/lib/models/TestGrade";
import Student from "@/lib/models/Student";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./admin.actions";

export async function createAcademicTest(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const name = formData.get("name") as string;
  const date = formData.get("date") as string;
  const targetClass = formData.get("targetClass") as string;
  const targetStream = formData.get("targetStream") as string;
  const targetSchool = formData.get("targetSchool") as string;

  if (!name || !date) {
    return { success: false, error: "Name and Date are required" };
  }

  try {
    await AcademicTest.create({
      name,
      date: new Date(date),
      targetClass: targetClass || undefined,
      targetStream: targetStream || undefined,
      targetSchool: targetSchool || undefined,
    });

    revalidatePath("/admin/tests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAcademicTests() {
  await requireAdmin();
  await dbConnect();
  try {
    const tests = await AcademicTest.find().sort({ date: -1 });
    return JSON.parse(JSON.stringify(tests));
  } catch (error) {
    console.error("Failed to fetch academic tests:", error);
    return [];
  }
}

// ─── TEST MARKS CSV UPLOAD ──────────────────────────────────────────────────

interface MarkRow {
  studentEmail: string;
  score: string;
  maxScore: string;
  remarks?: string;
}

export async function uploadTestMarks(testId: string, rows: MarkRow[]) {
  await requireAdmin();
  await dbConnect();

  // Verify the test exists
  const test = await AcademicTest.findById(testId);
  if (!test) {
    return { success: false, error: "Test not found", created: 0, skipped: 0, errors: [] };
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const email = row.studentEmail?.trim();
    if (!email) {
      skipped++;
      errors.push("Skipped: Row with missing studentEmail");
      continue;
    }

    const scoreNum = parseFloat(row.score);
    const maxScoreNum = parseFloat(row.maxScore);

    if (isNaN(scoreNum) || isNaN(maxScoreNum)) {
      skipped++;
      errors.push(`Skipped: Invalid score/maxScore for "${email}"`);
      continue;
    }

    const student = await Student.findOne({ email });
    if (!student) {
      skipped++;
      errors.push(`Skipped: No student found with email "${email}"`);
      continue;
    }

    try {
      // Upsert — allows re-uploading to overwrite previous marks
      await TestGrade.findOneAndUpdate(
        { testId: test._id, studentId: student._id },
        {
          testId: test._id,
          studentId: student._id,
          marks: { score: scoreNum, maxScore: maxScoreNum },
          remarks: row.remarks?.trim() || undefined,
        },
        { upsert: true, new: true },
      );
      created++;
    } catch (err: any) {
      skipped++;
      errors.push(`Skipped: Failed to save grade for "${email}" — ${err.message}`);
    }
  }

  // Mark the test as having uploads
  if (created > 0) {
    await AcademicTest.findByIdAndUpdate(testId, { marksUploaded: true });
  }

  revalidatePath("/admin/tests");
  return { success: true, created, skipped, errors };
}

