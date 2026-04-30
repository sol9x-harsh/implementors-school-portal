'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  Activities: Compass,
  Profile: UserCircle,
};

export interface NavSection {
  label: string;
  items: { name: string; href: string }[];
}

interface Props {
  sections: NavSection[];
}

export function StudentNavClient({ sections }: Props) {
  const pathname = usePathname();

  return (
    <div className='space-y-6'>
      {sections.map((section) => (
        <div key={section.label}>
          {/* Section label */}
          <p className='text-[9px] font-black uppercase tracking-[0.22em] px-3 mb-2 text-slate-500/60'>
            {section.label}
          </p>

          <div className='space-y-1'>
            {section.items.map((item) => {
              const Icon = iconMap[item.name] ?? LayoutDashboard;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link key={item.name} href={item.href} className='block'>
                  <motion.div
                    whileHover={{ x: isActive ? 0 : 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 group
                      ${
                        isActive
                          ? 'text-indigo-700 bg-indigo-50 font-bold border-l-4 border-indigo-600 rounded-l-sm'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium'
                      }`}
                  >
                    {/* Icon */}
                    <Icon
                      className={`w-[16px] h-[16px] shrink-0 transition-colors duration-200 relative z-10
                        ${isActive ? 'text-indigo-700' : 'text-slate-400 group-hover:text-indigo-600'}`}
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
                        layoutId='student-nav-indicator'
                        className='ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 relative z-10'
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
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
