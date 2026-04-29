import { getStudentDashboardData, getAvailableEvents, getActiveDataRequests } from "@/lib/actions/student.actions";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function StudentDashboardPage() {
  const dashboardData = await getStudentDashboardData();
  const eventsData = await getAvailableEvents();
  const requestsData = await getActiveDataRequests();

  return (
    <StudentDashboardClient 
      initialData={dashboardData} 
      initialEvents={eventsData} 
      initialRequests={requestsData} 
    />
  );
}
