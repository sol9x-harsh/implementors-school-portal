'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { AdminNavClient, type NavSection } from './AdminNavClient';
import { SignOutDialog } from '@/components/shared/SignOutDialog';

interface Props {
  sections: NavSection[];
  initials: string;
  name: string;
  roleLabel: string;
}

export function AdminSidebarClient({ sections, initials, name, roleLabel }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen z-30 overflow-hidden transition-[width] duration-300 ease-in-out ink-sidebar ${
          collapsed ? 'w-[64px]' : 'w-[260px]'
        }`}
      >
        {/* Brand */}
        <div
          className='flex items-center shrink-0'
          style={{ borderBottom: '1px solid oklch(0.88 0.04 282 / 0.55)' }}
        >
          <Link
            href='/admin'
            className={`flex items-center gap-3 group w-full transition-colors duration-150 ${
              collapsed ? 'justify-center px-4 py-[18px]' : 'px-5 pt-6 pb-5'
            }`}
          >
            <div className='relative w-8 h-8 rounded-xl bg-purple-gradient flex items-center justify-center shadow-purple-sm shrink-0 overflow-hidden'>
              <span className='absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl' />
              <span className='font-heading font-black text-sm relative z-10' style={{ color: 'oklch(0.98 0.01 280)' }}>S</span>
            </div>
            {!collapsed && (
              <div>
                <p
                  className='font-heading font-black text-[14px] leading-none tracking-tight'
                  style={{ color: 'oklch(0.18 0.07 282)' }}
                >
                  Sol9x Portal
                </p>
                <p
                  className='text-admin-label mt-0.5'
                  style={{ color: 'oklch(0.52 0.08 282)' }}
                >
                  Admin Console
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className='flex-1 px-2 py-3 overflow-y-auto scrollbar-dark'>
          <AdminNavClient sections={sections} collapsed={collapsed} />
        </nav>

        {/* User + Sign out */}
        <div className='shrink-0 ink-user-area'>
          {collapsed ? (
            <div className='flex flex-col items-center gap-2 py-3'>
              <div
                className='w-8 h-8 rounded-lg bg-purple-gradient flex items-center justify-center text-[11px] font-heading font-black'
                style={{ color: 'oklch(0.98 0.01 280)' }}
                title={name}
              >
                {initials}
              </div>
              <button
                onClick={() => setShowSignOut(true)}
                title='Sign Out'
                className='w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150'
                style={{ color: 'oklch(0.50 0.10 285)' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    'oklch(0.91 0.08 282 / 0.6)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')
                }
              >
                <LogOut className='w-4 h-4' />
              </button>
            </div>
          ) : (
            <div className='px-3 pt-3 pb-3'>
              <div className='ink-user-card mb-2'>
                <div className='w-8 h-8 rounded-lg bg-purple-gradient flex items-center justify-center text-[11px] font-heading font-black shrink-0' style={{ color: 'oklch(0.98 0.01 280)' }}>
                  {initials}
                </div>
                <div className='flex-1 min-w-0'>
                  <p
                    className='text-[12px] font-bold truncate leading-tight'
                    style={{ color: 'oklch(0.18 0.07 282)' }}
                  >
                    {name}
                  </p>
                  <p
                    className='text-[10px] truncate mt-0.5 font-medium'
                    style={{ color: 'oklch(0.50 0.08 282)' }}
                  >
                    {roleLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSignOut(true)}
                className='flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-150'
                style={{
                  color: 'oklch(0.45 0.10 285)',
                  border: '1px solid oklch(0.84 0.06 282 / 0.5)',
                  background: 'oklch(0.96 0.03 282 / 0.5)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = 'oklch(0.91 0.06 282 / 0.6)';
                  el.style.color = 'oklch(0.32 0.18 278)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = 'oklch(0.96 0.03 282 / 0.5)';
                  el.style.color = 'oklch(0.45 0.10 285)';
                }}
              >
                <LogOut className='w-3.5 h-3.5 shrink-0' />
                Sign Out
              </button>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className='w-full flex items-center justify-center h-8 transition-colors duration-150'
            style={{
              borderTop: '1px solid oklch(0.88 0.04 282 / 0.5)',
              color: 'oklch(0.60 0.06 285)',
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = 'oklch(0.32 0.18 278)';
              el.style.background = 'oklch(0.93 0.05 282 / 0.6)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = 'oklch(0.60 0.06 285)';
              el.style.background = 'transparent';
            }}
          >
            {collapsed ? (
              <ChevronRight className='w-3.5 h-3.5' />
            ) : (
              <ChevronLeft className='w-3.5 h-3.5' />
            )}
          </button>
        </div>
      </aside>

      <SignOutDialog
        open={showSignOut}
        onOpenChange={setShowSignOut}
        callbackUrl='/admin/login'
      />
    </>
  );
}
