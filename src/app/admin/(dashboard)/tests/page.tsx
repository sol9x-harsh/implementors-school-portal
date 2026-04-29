import { getAcademicTests } from "@/lib/actions/test.actions";
import TestManagementClient from "./TestManagementClient";

export default async function TestManagementPage() {
  const tests = await getAcademicTests();

  return <TestManagementClient initialTests={tests} />;
}
