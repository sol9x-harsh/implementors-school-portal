import { getAdminDashboardStats, getRecentActivity } from "@/lib/actions/admin.actions";
import AdminDashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  const statsData = await getAdminDashboardStats();
  const activityData = await getRecentActivity();

  return (
    <AdminDashboardClient 
      initialStats={statsData} 
      initialActivity={activityData} 
    />
  );
}
