'use client';

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterDef {
  id: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  width?: string;
}

interface AdminFilterBarProps {
  searchValue: string;
  onSearch: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  resultCount?: number;
  totalCount?: number;
  /** Any additional right-side elements (e.g. extra buttons) */
  extra?: React.ReactNode;
}

export function AdminFilterBar({
  searchValue,
  onSearch,
  searchPlaceholder = 'Search...',
  filters = [],
  resultCount,
  totalCount,
  extra,
}: AdminFilterBarProps) {
  return (
    <div className='flex flex-col sm:flex-row items-center gap-3 bg-white/90 backdrop-blur-sm border border-purple-border/25 shadow-purple-xs rounded-2xl px-4 py-3'>
      {/* Search input */}
      <div className='relative w-full sm:w-80 group shrink-0'>
        <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-muted-foreground group-focus-within:text-purple-primary transition-colors duration-200' />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className='pl-10 h-9 rounded-xl border-purple-border/30 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary focus:ring-0 transition-all font-semibold text-[13px] placeholder:text-purple-muted-foreground/60'
        />
      </div>

      {/* Divider */}
      {filters.length > 0 && (
        <div className='hidden sm:flex items-center gap-1.5 shrink-0 text-purple-muted-foreground/50'>
          <SlidersHorizontal className='w-3 h-3' />
          <span className='text-[9px] font-bold uppercase tracking-[0.12em]'>
            Filter
          </span>
        </div>
      )}

      {/* Filter selects */}
      {filters.map((f) => (
        <Select
          key={f.id}
          value={f.value}
          onValueChange={(v) => v && f.onChange(v)}
        >
          <SelectTrigger
            className={`h-9 rounded-xl border-purple-border/30 bg-purple-secondary/15 text-[11px] font-bold uppercase tracking-[0.08em] shrink-0 ${f.width ?? 'w-[140px]'}`}
          >
            <SelectValue placeholder={f.placeholder} />
          </SelectTrigger>
          <SelectContent
            className='rounded-xl border-purple-border/30 shadow-purple-sm'
            style={{ width: 'auto', minWidth: 'var(--anchor-width)' }}
          >
            {f.options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className='text-[11px] font-bold'
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Spacer — only expands in row layout; hidden in column layout */}
      <div className='hidden sm:block flex-1' />

      {/* Result count pill */}
      {resultCount !== undefined && totalCount !== undefined && (
        <span className='admin-badge admin-badge-gold shrink-0 px-3 py-1.5'>
          {resultCount} of {totalCount}
        </span>
      )}

      {/* Extra content (e.g. additional buttons) */}
      {extra}
    </div>
  );
}
