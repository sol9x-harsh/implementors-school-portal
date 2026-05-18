import { Suspense } from 'react';
import { getStudentsDirectory } from '@/lib/actions/admin.actions';
import StudentDirectoryClient from './StudentDirectoryClient';
import { Loader2 } from 'lucide-react';

async function DirectoryContent() {
  const students = await getStudentsDirectory();

  // Use only SOL9X School as the default/only option
  const schools = [{ _id: 'sol9x', name: 'SOL9X School' }];

  return (
    <StudentDirectoryClient initialStudents={students} schools={schools} />
  );
}

function DirectoryFallback() {
  return (
    <div className='admin-shell flex items-center justify-center min-h-[50vh]'>
      <div className='flex items-center gap-3 text-purple-muted-foreground'>
        <Loader2 className='w-5 h-5 animate-spin text-purple-primary' />
        <span className='text-sm font-bold uppercase tracking-widest'>
          Loading directory...
        </span>
      </div>
    </div>
  );
}

export default function StudentDirectoryPage() {
  return (
    <Suspense fallback={<DirectoryFallback />}>
      <DirectoryContent />
    </Suspense>
  );
}
