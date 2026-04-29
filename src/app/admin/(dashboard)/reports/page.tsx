import { getCohortCounts } from "@/lib/actions/admin.actions";
import AnnualReportsClient from "./AnnualReportsClient";

export default async function AnnualReportsPage() {
  const counts = await getCohortCounts();
  return <AnnualReportsClient initialCounts={counts} />;
}
