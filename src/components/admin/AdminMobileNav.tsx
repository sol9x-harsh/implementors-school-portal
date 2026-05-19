'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { AdminNavClient, type NavSection } from './AdminNavClient';
import { SignOutDialog } from '@/components/shared/SignOutDialog';

interface AdminMobileNavProps {
  sections: NavSection[];
  initials: string;
  name: string;
  roleLabel: string;
}

export function AdminMobileNav({
  sections,
  initials,
  name,
  roleLabel,
}: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <>
      {/* Hamburger — visible only on < lg */}
      <button
        aria-label='Open navigation menu'
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className='lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-purple-foreground/70 hover:bg-white hover:shadow-purple-xs transition-all duration-150 shrink-0'
      >
        <Menu className='w-4 h-4' />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          aria-hidden='true'
          className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden'
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer — dark ink theme */}
      <aside
        aria-label='Navigation drawer'
        className={`fixed top-0 left-0 z-50 h-screen w-[260px] flex flex-col ink-sidebar shadow-purple-xl transition-transform duration-300 ease-out lg:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand row */}
        <div
          className='px-5 pt-6 pb-5 flex items-center justify-between'
          style={{ borderBottom: '1px solid oklch(0.19 0.04 270)' }}
        >
          <Link
            href='/admin'
            onClick={() => setOpen(false)}
            className='flex items-center gap-3 group'
          >
            <div className='w-8 h-8 rounded-xl bg-purple-gradient flex items-center justify-center shadow-purple-sm shrink-0'>
              <span className='font-heading font-black text-sm' style={{ color: 'oklch(0.98 0.01 280)' }}>S</span>
            </div>
            <div>
              <p
                className='font-heading font-black text-[14px] leading-none tracking-tight'
                style={{ color: 'oklch(0.88 0.04 270)' }}
              >
                Sol9x Portal
              </p>
              <p
                className='text-[9px] font-bold uppercase tracking-[0.18em] mt-0.5'
                style={{ color: 'oklch(0.44 0.05 270)' }}
              >
                Admin Console
              </p>
            </div>
          </Link>
          <button
            aria-label='Close navigation menu'
            onClick={() => setOpen(false)}
            className='w-7 h-7 rounded-lg flex items-center justify-center transition-colors'
            style={{ color: 'oklch(0.48 0.04 270)' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                'oklch(0.20 0.05 275)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')
            }
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Nav */}
        <nav
          className='flex-1 px-2 py-3 overflow-y-auto scrollbar-dark'
          onClick={() => setOpen(false)}
        >
          <AdminNavClient sections={sections} collapsed={false} />
        </nav>

        {/* User card + sign out */}
        <div className='px-3 pt-3 pb-4 ink-user-area'>
          <div className='ink-user-card mb-2'>
            <div className='w-8 h-8 rounded-lg bg-purple-gradient flex items-center justify-center text-[11px] font-heading font-black shrink-0' style={{ color: 'oklch(0.98 0.01 280)' }}>
              {initials}
            </div>
            <div className='flex-1 min-w-0'>
              <p
                className='text-[12px] font-bold truncate leading-tight'
                style={{ color: 'oklch(0.88 0.04 270)' }}
              >
                {name}
              </p>
              <p
                className='text-[10px] truncate mt-0.5 font-medium'
                style={{ color: 'oklch(0.40 0.04 270)' }}
              >
                {roleLabel}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              setShowSignOut(true);
            }}
            className='flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-150'
            style={{
              color: 'oklch(0.62 0.18 20)',
              border: '1px solid oklch(0.55 0.18 20 / 0.20)',
              background: 'oklch(0.55 0.18 20 / 0.06)',
            }}
          >
            <LogOut className='w-3.5 h-3.5 shrink-0' />
            Sign Out
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
