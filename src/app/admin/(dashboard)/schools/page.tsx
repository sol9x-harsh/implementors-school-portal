import { getSchools } from '@/lib/actions/school.actions';
import SchoolsClient from './SchoolsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'School Management | SOL9X Admin',
  description: 'Manage schools and academic institutions.',
};

export default async function SchoolsPage() {
  const schools = await getSchools();

  return <SchoolsClient initialSchools={schools} />;
}
