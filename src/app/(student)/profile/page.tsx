import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getStudentProfile } from "@/lib/actions/student.actions";
import ProfileClient from "./ProfileClient";

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const profile = await getStudentProfile();

  return <ProfileClient profile={profile} />;
}
