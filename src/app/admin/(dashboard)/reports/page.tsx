import { getCohortOptionsWithCounts, getAnnualReports } from '@/lib/actions/admin.actions';
import AnnualReportsClient from './AnnualReportsClient';

export default async function AnnualReportsPage() {
  const [cohortOptions, initialReports] = await Promise.all([
    getCohortOptionsWithCounts(),
    getAnnualReports(),
  ]);

  return (
    <AnnualReportsClient
      cohortOptions={cohortOptions}
      initialReports={initialReports}
    />
  );
}
