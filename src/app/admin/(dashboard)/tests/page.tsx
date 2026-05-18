import { getAcademicTests } from '@/lib/actions/test.actions';
import TestManagementClient from './TestManagementClient';

export default async function TestManagementPage() {
  const tests = await getAcademicTests();

  // Use only SOL9X School as the default/only option
  const schools = [{ _id: 'sol9x', name: 'SOL9X School' }];

  return <TestManagementClient initialTests={tests} schools={schools} />;
}
