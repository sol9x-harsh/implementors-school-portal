import { getStudentsDirectory } from "@/lib/actions/admin.actions";
import StudentDirectoryClient from "./StudentDirectoryClient";

export default async function StudentDirectoryPage() {
  const students = await getStudentsDirectory();

  return <StudentDirectoryClient initialStudents={students} />;
}
