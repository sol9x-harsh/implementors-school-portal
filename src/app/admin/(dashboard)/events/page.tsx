import SmartEventsClient from './SmartEventsClient';
import { getEvents } from '@/lib/actions/admin.actions';

export default async function SmartEventsPage() {
  const events = await getEvents();

  // Use only SOL9X School as the default/only option
  const schools = [{ _id: 'sol9x', name: 'SOL9X School' }];

  return <SmartEventsClient initialEvents={events} schools={schools} />;
}
