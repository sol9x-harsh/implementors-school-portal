import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAvailableEvents } from "@/lib/actions/student.actions";
import ActivitiesClient from "./ActivitiesClient";

export default async function StudentActivities() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const events = await getAvailableEvents();

  return <ActivitiesClient events={events} />;
}
