'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarPlus,
  BarChart3,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { type NavSection } from './AdminNavClient';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Overview: LayoutDashboard,
  'Student Directory': Users,
  Assessments: ClipboardList,
  'Activities & Events': CalendarPlus,
  'Smart Forms': FileText,
  'Reports & Portfolios': BarChart3,
  /* legacy names */
  Dashboard: LayoutDashboard,
  'Test Management': ClipboardList,
  'Activity Management': CalendarPlus,
  'Annual Portfolios': BarChart3,
};

interface FlatItem {
  name: string;
  href: string;
  section: string;
}

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

interface Props {
  sections: NavSection[];
}

export function AdminCommandPalette({ sections }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems: FlatItem[] = sections.flatMap((s) =>
    s.items.map((item) => ({ ...item, section: s.label }))
  );

  const filtered =
    query.trim() === ''
      ? allItems
      : allItems.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase())
        );

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      setActiveIdx(0);
      router.push(href);
    },
    [router]
  );

  /* Global keyboard shortcut */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  /* Arrow key nav inside palette */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        if (filtered[activeIdx]) navigate(filtered[activeIdx].href);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, activeIdx, navigate]);

  /* Reset activeIdx when query changes */
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  /* Focus input when opened */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
      setActiveIdx(0);
    }
  }, [open]);

  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

  return (
    <>
      {/* Trigger button in top bar */}
      <button
        onClick={() => setOpen(true)}
        aria-label='Open command palette'
        className='flex items-center gap-2 h-8 px-3 rounded-lg border bg-purple-secondary/30 hover:bg-white hover:shadow-purple-xs border-purple-border/30 hover:border-purple-primary/30 transition-all duration-150 group'
      >
        <Search className='w-3.5 h-3.5 text-purple-muted-foreground/50 group-hover:text-purple-primary transition-colors' />
        <span className='text-[12px] font-medium text-purple-muted-foreground/60 hidden sm:block'>
          Search…
        </span>
        <span className='hidden sm:flex items-center gap-0.5 ml-1'>
          <span className='cmd-kbd'>{isMac ? '⌘' : 'Ctrl'}</span>
          <span className='cmd-kbd'>K</span>
        </span>
      </button>

      {/* Overlay + panel */}
      {open && (
        <div className='cmd-overlay' onClick={() => setOpen(false)}>
          <div className='cmd-panel mx-4' onClick={(e) => e.stopPropagation()}>
            {/* Input */}
            <div className='cmd-input-wrap'>
              <Search className='w-4 h-4 shrink-0' style={{ color: 'oklch(0.62 0.04 270)' }} />
              <input
                ref={inputRef}
                className='cmd-input'
                placeholder='Go to…'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete='off'
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className='text-xs px-1.5 py-0.5 rounded'
                  style={{
                    color: 'oklch(0.55 0.04 270)',
                    background: 'oklch(0.94 0.02 285)',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results */}
            <div className='py-1.5 max-h-72 overflow-y-auto'>
              {filtered.length === 0 ? (
                <p
                  className='text-center py-8 text-[13px]'
                  style={{ color: 'oklch(0.62 0.04 270)' }}
                >
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = (iconMap[item.name] ?? LayoutDashboard) as IconComponent;
                  return (
                    <button
                      key={item.href}
                      data-active={idx === activeIdx ? 'true' : undefined}
                      className='cmd-result-item w-full text-left'
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => navigate(item.href)}
                    >
                      <span className='cmd-result-icon'>
                        <Icon
                          className='w-3.5 h-3.5'
                          style={{ color: 'oklch(0.55 0.16 65)' }}
                        />
                      </span>
                      <span className='flex-1'>{item.name}</span>
                      <span
                        className='text-[10px] font-medium px-1.5 py-0.5 rounded'
                        style={{
                          color: 'oklch(0.62 0.04 270)',
                          background: 'oklch(0.94 0.02 285)',
                        }}
                      >
                        {item.section}
                      </span>
                      <ArrowRight
                        className='w-3 h-3 opacity-40 shrink-0'
                        style={{ color: 'oklch(0.55 0.18 280)' }}
                      />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className='cmd-footer'>
              <span className='cmd-hint'>
                <span className='cmd-kbd'>↑</span>
                <span className='cmd-kbd'>↓</span>
                navigate
              </span>
              <span className='cmd-hint'>
                <span className='cmd-kbd'>↵</span>
                open
              </span>
              <span className='cmd-hint'>
                <span className='cmd-kbd'>Esc</span>
                close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
