import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { type NavSection } from '@/components/admin/AdminNavClient';
import { AdminSidebarClient } from '@/components/admin/AdminSidebarClient';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { AdminCommandPalette } from '@/components/admin/AdminCommandPalette';
import { AdminTopBarBreadcrumb } from '@/components/admin/AdminTopBarBreadcrumb';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const navSections: NavSection[] = [
    {
      label: 'Core',
      items: [
        { name: 'Overview', href: '/admin' },
        { name: 'Student Directory', href: '/admin/students' },
      ],
    },
    {
      label: 'Academics',
      items: [{ name: 'Assessments', href: '/admin/tests' }],
    },
    {
      label: 'Engagement',
      items: [{ name: 'Activities & Events', href: '/admin/events' }],
    },
    {
      label: 'Tools',
      items: [
        { name: 'Reports & Portfolios', href: '/admin/reports' },
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
    <div className='admin-theme flex h-screen overflow-hidden bg-purple-background font-sans'>
      {/* ── Dark collapsible sidebar (desktop) ───────────────── */}
      <AdminSidebarClient
        sections={navSections}
        initials={initials}
        name={name}
        roleLabel={roleLabel}
      />

      {/* ── Content Column ───────────────────────────────────── */}
      <div className='flex-1 flex flex-col min-w-0 min-h-0'>
        {/* ── Top Bar ──────────────────────────────────────────── */}
        <header className='shrink-0 z-20 bg-white border-b border-purple-border/35 h-16 flex items-center gap-3 px-4 lg:px-6 shadow-purple-xs'>
          {/* Left: mobile hamburger + breadcrumb */}
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <AdminMobileNav
              sections={navSections}
              initials={initials}
              name={name}
              roleLabel={roleLabel}
            />

            {/* Brand mark (desktop only, visible when sidebar collapsed) */}
            <div className='hidden lg:flex items-center gap-2 text-purple-muted-foreground/40 text-[11px] font-bold uppercase tracking-[0.12em] select-none'>
              <span>Sol9x</span>
              <ChevronRight className='w-3 h-3 opacity-40' />
            </div>

            {/* Current page pill */}
            <AdminTopBarBreadcrumb />
          </div>

          {/* Center: CMD+K trigger */}
          <div className='hidden md:flex items-center'>
            <AdminCommandPalette sections={navSections} />
          </div>

          {/* Right: actions */}
          <div className='flex items-center gap-2 ml-auto'>
            {/* CMD+K on mobile */}
            <div className='flex md:hidden'>
              <AdminCommandPalette sections={navSections} />
            </div>

            {/* Notification bell */}
            <button
              aria-label='Notifications'
              className='relative w-9 h-9 rounded-xl hover:bg-purple-secondary/50 flex items-center justify-center transition-all duration-150 group border border-transparent hover:border-purple-border/30'
            >
              <Bell className='w-4 h-4 text-purple-foreground/55 group-hover:text-purple-primary transition-colors' />
              <span className='absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-primary border-2 border-white pulse-dot' />
            </button>

            {/* Separator */}
            <div className='w-px h-6 bg-purple-border/35 mx-1' />

            {/* User chip */}
            <div className='flex items-center gap-2.5'>
              <div className='w-9 h-9 rounded-xl bg-purple-gradient flex items-center justify-center shadow-purple-sm shrink-0'>
                <span className='text-[11px] font-heading font-black' style={{ color: 'oklch(0.98 0.01 280)' }}>
                  {initials}
                </span>
              </div>
              <div className='hidden sm:block'>
                <p className='text-[12px] font-bold text-purple-foreground leading-tight'>
                  {name.split(' ')[0]}
                </p>
                <p className='text-[10px] text-purple-muted-foreground/60 font-semibold mt-0.5 uppercase tracking-wider'>
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────── */}
        <main className='flex-1 min-h-0 overflow-y-auto scrollbar-thin'>
          {children}
        </main>
      </div>
    </div>
  );
}
