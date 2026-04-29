import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import {
  AdminNavClient,
  type NavSection,
} from '@/components/admin/AdminNavClient';
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')
  ) {
    redirect('/admin/login');
  }

  const navSections: NavSection[] = [
    {
      label: 'Core',
      items: [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Student Directory', href: '/admin/students' },
      ],
    },
    {
      label: 'Academics',
      items: [{ name: 'Test Management', href: '/admin/tests' }],
    },
    {
      label: 'Engagement',
      items: [{ name: 'Activity Management', href: '/admin/events' }],
    },
    {
      label: 'Tools',
      items: [
        { name: 'Dynamic Forms', href: '/admin/forms' },
        { name: 'Annual Portfolios', href: '/admin/reports' },
      ],
    },
  ];

  const name = session.user.name ?? 'Admin';
  const initials = name
    .split(' ')
    .map((n: string) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = (session.user.role ?? '').replace('_', ' ');

  return (
    <div className='admin-theme flex min-h-screen bg-[oklch(0.975_0.006_285)] font-sans'>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className='hidden lg:flex w-[240px] shrink-0 flex-col sticky top-0 h-screen z-30 overflow-hidden bg-white border-r border-purple-border/30'>
        {/* ── Brand ─────────────────────────────────────────────── */}
        <div className='px-5 pt-6 pb-5 border-b border-purple-border/30'>
          <Link href='/admin' className='flex items-center gap-3 group'>
            {/* Logo mark */}
            <div className='relative w-8 h-8 rounded-xl bg-purple-gradient flex items-center justify-center shadow-purple-sm shrink-0 overflow-hidden'>
              <span className='absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl' />
              <span className='text-white font-heading font-black text-sm relative z-10'>
                S
              </span>
            </div>
            <div>
              <p className='font-heading font-black text-[14px] leading-none tracking-tight text-purple-foreground'>
                Sol9x Portal
              </p>
              <p className='text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 text-purple-muted-foreground'>
                Admin Console
              </p>
            </div>
          </Link>
        </div>

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav className='flex-1 px-3 py-4 overflow-y-auto scrollbar-thin'>
          <AdminNavClient sections={navSections} />
        </nav>

        {/* ── User Card ─────────────────────────────────────────── */}
        <div className='p-3 border-t border-purple-border/30'>
          <div className='rounded-xl p-3 flex items-center gap-3 bg-purple-secondary/20 border border-purple-border/30'>
            {/* Avatar */}
            <div className='w-8 h-8 rounded-lg bg-purple-gradient flex items-center justify-center text-white text-[11px] font-heading font-black shrink-0'>
              {initials}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-[12px] font-bold truncate leading-tight text-purple-foreground'>
                {name}
              </p>
              <p className='text-[10px] truncate mt-0.5 font-medium text-purple-muted-foreground'>
                {roleLabel}
              </p>
            </div>
          </div>
          <div className='mt-2'>
            <AdminSignOutButton />
          </div>
        </div>
      </aside>

      {/* ── Content Column ─────────────────────────────────────── */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* ── Top Bar ───────────────────────────────────────────── */}
        <header className='sticky top-0 z-20 bg-[oklch(0.975_0.006_285)]/90 backdrop-blur-md border-b border-purple-border/30 h-12 flex items-center gap-3 px-6'>
          {/* Search trigger */}
          <button className='hidden md:flex items-center gap-2 h-7 px-3 rounded-lg bg-white border border-purple-border/40 text-purple-muted-foreground/60 text-[12px] font-medium hover:border-purple-border/70 transition-all duration-150'>
            <Search className='w-3 h-3' />
            <span>Quick search...</span>
            <span className='ml-3 text-[10px] font-black bg-purple-secondary/60 px-1.5 py-0.5 rounded border border-purple-border/30 text-purple-muted-foreground/70'>
              ⌘K
            </span>
          </button>

          <div className='ml-auto flex items-center gap-1.5'>
            {/* Notification bell */}
            <button className='relative w-8 h-8 rounded-lg hover:bg-white hover:shadow-purple-xs flex items-center justify-center transition-all duration-150 group'>
              <Bell className='w-4 h-4 text-purple-foreground/60 group-hover:text-purple-primary transition-colors' />
              <span className='absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-[oklch(0.975_0.006_285)] pulse-dot' />
            </button>

            {/* Separator */}
            <div className='w-px h-5 bg-purple-border/40 mx-0.5' />

            {/* User chip */}
            <div className='flex items-center gap-2 pl-1'>
              <div className='w-7 h-7 rounded-lg bg-purple-gradient flex items-center justify-center'>
                <span className='text-white text-[10px] font-heading font-black'>
                  {initials}
                </span>
              </div>
              <div className='hidden sm:block'>
                <p className='text-[11px] font-bold text-purple-foreground leading-none'>
                  {name.split(' ')[0]}
                </p>
                <p className='text-[9px] text-purple-muted-foreground font-bold mt-0.5 uppercase tracking-wider'>
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ──────────────────────────────────────── */}
        <main className='flex-1 overflow-y-auto scrollbar-thin'>
          {children}
        </main>
      </div>
    </div>
  );
}
