import { getStudentProfile } from '@/lib/actions/student.actions';
import ProfileClient from './ProfileClient';

export default async function StudentProfilePage() {
  const profile = await getStudentProfile();

  return <ProfileClient profile={profile} />;
}
