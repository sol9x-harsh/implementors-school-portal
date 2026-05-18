'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarPlus,
  FileText,
  BarChart3,
  LayoutDashboard,
  Users,
  ClipboardList,
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  'Student Directory': Users,
  'Test Management': ClipboardList,
  'Activity Management': CalendarPlus,
  'Dynamic Forms': FileText,
  'Annual Portfolios': BarChart3,
};

export interface NavSection {
  label: string;
  items: { name: string; href: string }[];
}

interface Props {
  sections: NavSection[];
}

export function AdminNavClient({ sections }: Props) {
  const pathname = usePathname();

  return (
    <div className='space-y-5'>
      {sections.map((section) => (
        <div key={section.label}>
          {/* Section label */}
          <p
            className='text-[9px] font-bold uppercase tracking-[0.22em] px-3 mb-2 text-purple-muted-foreground/60'
          >
            {section.label}
          </p>
          <div className='space-y-0.5'>
            {section.items.map((item) => {
              const Icon = iconMap[item.name] ?? LayoutDashboard;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link key={item.name} href={item.href} className='block'>
                  <motion.div
                    whileHover={{ x: isActive ? 0 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 group border-l-4
                      ${
                        isActive
                          ? 'text-purple-primary bg-purple-primary/8 font-bold border-purple-primary'
                          : 'text-purple-muted-foreground/75 hover:text-purple-foreground hover:bg-purple-secondary/40 font-medium border-transparent'
                      }`}
                  >
                    {/* Icon */}
                    <Icon
                      className={`w-[16px] h-[16px] shrink-0 transition-colors duration-200 relative z-10
                        ${isActive ? 'text-purple-primary' : 'text-purple-muted-foreground/50 group-hover:text-purple-primary/80'}`}
                    />
                    {/* Label */}
                    <span
                      className='tracking-wide truncate relative z-10'
                      style={{ fontSize: '13px' }}
                    >
                      {item.name}
                    </span>
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.span
                        layoutId='admin-nav-indicator'
                        className='ml-auto w-1.5 h-1.5 rounded-full bg-purple-primary shrink-0 relative z-10 shadow-purple-xs'
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
