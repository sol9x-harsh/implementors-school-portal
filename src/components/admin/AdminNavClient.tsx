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
  Overview: LayoutDashboard,
  'Student Directory': Users,
  Assessments: ClipboardList,
  'Activities & Events': CalendarPlus,
  'Smart Forms': FileText,
  'Reports & Portfolios': BarChart3,
  /* legacy names kept for backwards compat */
  Dashboard: LayoutDashboard,
  'Test Management': ClipboardList,
  'Activity Management': CalendarPlus,
  'Annual Portfolios': BarChart3,
};

export interface NavSection {
  label: string;
  items: { name: string; href: string }[];
}

interface Props {
  sections: NavSection[];
  collapsed?: boolean;
}

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

export function AdminNavClient({ sections, collapsed = false }: Props) {
  const pathname = usePathname();

  return (
    <div className={collapsed ? 'space-y-3' : 'space-y-4'}>
      {sections.map((section, si) => (
        <div key={section.label}>
          {/* Section divider / label */}
          {si > 0 && (
            <div
              className={collapsed ? 'mx-3 mb-1.5 mt-0.5' : 'mx-2 mb-2'}
              style={{ borderTop: '1px solid oklch(0.88 0.04 282 / 0.5)' }}
            />
          )}
          {!collapsed && (
            <p className='ink-section-label'>{section.label}</p>
          )}

          <div className={collapsed ? 'space-y-1 flex flex-col items-center' : 'space-y-0.5'}>
            {section.items.map((item) => {
              const Icon = (iconMap[item.name] ?? LayoutDashboard) as IconComponent;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              if (collapsed) {
                return (
                  <Link key={item.name} href={item.href} title={item.name} className='block w-full'>
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className={`ink-nav-item ink-nav-item-collapsed ${isActive ? 'ink-nav-item-active' : ''}`}
                      style={{ width: '40px', margin: '0 auto' }}
                    >
                      <Icon
                        className='w-[18px] h-[18px]'
                        style={{
                          color: isActive
                            ? 'oklch(0.52 0.22 278)'
                            : 'oklch(0.55 0.08 282)',
                        }}
                      />
                    </motion.div>
                  </Link>
                );
              }

              return (
                <Link key={item.name} href={item.href} className='block'>
                  <motion.div
                    whileHover={{ x: isActive ? 0 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`ink-nav-item ${isActive ? 'ink-nav-item-active' : ''}`}
                  >
                    <Icon
                      className='w-[16px] h-[16px] shrink-0 transition-colors duration-200'
                      style={{
                        color: isActive
                          ? 'oklch(0.52 0.22 278)'
                          : 'oklch(0.55 0.08 282)',
                      }}
                    />
                    <span className='tracking-wide truncate' style={{ fontSize: '13px' }}>
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId='admin-nav-indicator'
                        className='ml-auto w-1.5 h-1.5 rounded-full shrink-0'
                        style={{ background: 'oklch(0.78 0.16 68)' }}
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
