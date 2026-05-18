'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AdminNavClient, type NavSection } from './AdminNavClient';
import { AdminSignOutButton } from './AdminSignOutButton';

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

  return (
    <>
      {/* Hamburger button — visible only on < lg */}
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
          className='fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden'
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        aria-label='Navigation drawer'
        className={`fixed top-0 left-0 z-50 h-screen w-[260px] flex flex-col bg-white border-r border-purple-border/30 shadow-purple-xl transition-transform duration-300 ease-out lg:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand row */}
        <div className='px-5 pt-6 pb-5 border-b border-purple-border/30 flex items-center justify-between'>
          <Link
            href='/admin'
            onClick={() => setOpen(false)}
            className='flex items-center gap-3 group'
          >
            <div className='w-8 h-8 rounded-xl bg-purple-gradient flex items-center justify-center shadow-purple-sm shrink-0'>
              <span className='text-white font-heading font-black text-sm'>S</span>
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
          <button
            aria-label='Close navigation menu'
            onClick={() => setOpen(false)}
            className='w-7 h-7 rounded-lg flex items-center justify-center text-purple-muted-foreground hover:bg-purple-secondary/40 transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Nav */}
        <nav
          className='flex-1 px-3 py-4 overflow-y-auto scrollbar-thin'
          onClick={() => setOpen(false)}
        >
          <AdminNavClient sections={sections} />
        </nav>

        {/* User card */}
        <div className='p-3 border-t border-purple-border/30'>
          <div className='rounded-xl p-3 flex items-center gap-3 bg-purple-secondary/20 border border-purple-border/30'>
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
    </>
  );
}
