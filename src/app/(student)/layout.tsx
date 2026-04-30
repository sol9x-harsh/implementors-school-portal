import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Bell, MessageCircle, GraduationCap } from 'lucide-react';
import { StudentNavClient } from '@/components/student/StudentNavClient';
import { StudentSignOutButton } from '@/components/student/StudentSignOutButton';
import { StudentSearchBar } from '@/components/student/StudentSearchBar';
import { OnboardingTour } from '@/components/student/OnboardingTour';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const navSections = [
    {
      label: 'Academics',
      items: [
        { name: 'Dashboard', href: '/' },
        { name: 'Activities', href: '/activities' },
      ],
    },
    {
      label: 'Account',
      items: [{ name: 'Profile', href: '/profile' }],
    },
  ];

  const initials = (session.user.name ?? 'Student')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className='flex min-h-screen bg-slate-50 font-sans'>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className='hidden lg:flex w-[280px] shrink-0 flex-col h-screen sticky top-0 bg-slate-50 z-30 border-r border-slate-200'>
        {/* Brand */}
        <div className='px-6 py-6 flex items-center gap-3.5'>
          <div className='w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0'>
            <span className='text-white font-heading font-black text-lg'>
              S
            </span>
          </div>
          <div>
            <p className='font-heading font-black text-[20px] text-slate-900 leading-tight tracking-tight'>
              Sol9x
            </p>
          </div>
        </div>

        <nav className='flex-1 px-4 py-6 overflow-y-auto scrollbar-thin'>
          <StudentNavClient sections={navSections} />
        </nav>

        {/* Sign out */}
        <div className='p-5 border-t border-slate-200 mt-auto'>
          <StudentSignOutButton />
        </div>
      </aside>

      {/* ── Content area ────────────────────────────────────── */}
      <div className='flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white'>
        {/* Top Bar */}
        <header className='sticky top-0 z-20 bg-white border-b border-slate-100 px-8 py-5 flex items-center gap-4'>
          {/* Search */}
          <StudentSearchBar />

          <div className='flex items-center gap-3 ml-auto'>
            {/* Notification bell */}
            <button
              title='Notifications'
              className='relative w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center transition-all text-slate-600 hover:text-indigo-600'
            >
              <Bell className='w-[18px] h-[18px]' />
              <span className='absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white pulse-dot' />
            </button>

            {/* Message icon */}
            <button
              title='Messages'
              className='hidden sm:flex w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-sm items-center justify-center transition-all text-slate-600 hover:text-indigo-600'
            >
              <MessageCircle className='w-[18px] h-[18px]' />
            </button>

            {/* Divider */}
            <div className='w-px h-8 bg-slate-200 mx-2 hidden sm:block' />

            {/* User chip (Visible everywhere) */}
            <div className='flex items-center gap-3 cursor-pointer group pl-1 bg-white border border-slate-200 rounded-full pr-4 p-1 shadow-sm'>
              <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0'>
                <span className='text-indigo-600 text-[11px] font-heading font-black'>
                  {initials}
                </span>
              </div>
              <div className='hidden sm:block min-w-0'>
                <p className='text-[12px] font-bold truncate leading-tight text-slate-900'>
                  {session.user.name}
                </p>
                <p className='text-[9px] truncate mt-0.5 font-black text-slate-400 uppercase tracking-widest'>
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-y-auto scrollbar-thin relative'>
          {children}
        </main>
        <OnboardingTour />
      </div>
    </div>
  );
}
