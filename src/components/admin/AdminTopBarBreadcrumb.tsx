'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarPlus,
  BarChart3,
  School,
} from 'lucide-react';

const PAGE_MAP: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  '/admin':           { label: 'Overview',            Icon: LayoutDashboard },
  '/admin/students':  { label: 'Student Directory',   Icon: Users },
  '/admin/tests':     { label: 'Assessments',         Icon: ClipboardList },
  '/admin/events':    { label: 'Activities & Events', Icon: CalendarPlus },
  '/admin/reports':   { label: 'Reports & Portfolios',Icon: BarChart3 },
  '/admin/schools':   { label: 'Schools',             Icon: School },
};

export function AdminTopBarBreadcrumb() {
  const pathname = usePathname();

  const match =
    Object.entries(PAGE_MAP)
      .filter(([key]) => key === '/admin' ? pathname === '/admin' : pathname.startsWith(key))
      .sort((a, b) => b[0].length - a[0].length)[0];

  if (!match) return null;

  const { label, Icon } = match[1];

  return (
    <div className='flex items-center gap-2 min-w-0'>
      <div className='hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-secondary/50 border border-purple-border/25'>
        <Icon className='w-3 h-3 text-purple-primary shrink-0' />
        <span className='text-[12px] font-bold text-purple-foreground truncate max-w-[140px]'>
          {label}
        </span>
      </div>
    </div>
  );
}
