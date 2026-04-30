import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAvailableEvents, getPastEvents, getStudentRegistrations } from "@/lib/actions/student.actions";
import ActivitiesClient from "./ActivitiesClient";
import { Sparkles } from "lucide-react";

async function ActivitiesContent() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [events, pastEvents, registrations] = await Promise.all([
    getAvailableEvents(),
    getPastEvents(),
    getStudentRegistrations(),
  ]);

  return (
    <ActivitiesClient
      events={events}
      pastEvents={pastEvents}
      registrations={registrations}
    />
  );
}

function ActivitiesFallback() {
  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Sparkles className="w-8 h-8 text-purple-primary/30 animate-pulse" />
      <p className="text-sm font-bold text-purple-muted-foreground uppercase tracking-widest">Loading activities...</p>
    </div>
  );
}

export default function StudentActivities() {
  return (
    <Suspense fallback={<ActivitiesFallback />}>
      <ActivitiesContent />
    </Suspense>
  );
}
