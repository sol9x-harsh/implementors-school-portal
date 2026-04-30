import SmartEventsClient from './SmartEventsClient';
import { getEvents } from '@/lib/actions/admin.actions';

export default async function SmartEventsPage() {
  const events = await getEvents();
  return <SmartEventsClient initialEvents={events} />;
}
