"use server";

import dbConnect from "@/lib/db/mongodb";
import AcademicTest from "@/lib/models/AcademicTest";
import { revalidatePath } from "next/cache";

export async function createAcademicTest(formData: FormData) {
  await dbConnect();

  const name = formData.get("name") as string;
  const date = formData.get("date") as string;
  const targetClass = formData.get("targetClass") as string;
  const targetStream = formData.get("targetStream") as string;

  if (!name || !date) {
    return { success: false, error: "Name and Date are required" };
  }

  try {
    await AcademicTest.create({
      name,
      date: new Date(date),
      targetClass: targetClass || undefined,
      targetStream: targetStream || undefined,
    });

    revalidatePath("/admin/tests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAcademicTests() {
  await dbConnect();
  try {
    const tests = await AcademicTest.find().sort({ date: -1 });
    return JSON.parse(JSON.stringify(tests));
  } catch (error) {
    console.error("Failed to fetch academic tests:", error);
    return [];
  }
}
