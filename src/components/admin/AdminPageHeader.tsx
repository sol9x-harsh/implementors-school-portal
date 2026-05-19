'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface AdminPageHeaderProps {
  /** e.g. "Academics", "Engagement", "Tools" */
  section: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** Right-aligned action buttons / elements */
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  section,
  title,
  subtitle,
  icon: Icon,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 mb-4'>
          <span className='px-2.5 py-0.5 rounded-md text-admin-label' style={{ background: 'oklch(0.91 0.08 280 / 0.55)', color: 'oklch(0.38 0.18 278)' }}>
            Admin Console
          </span>
          <ChevronRight className='w-3 h-3' style={{ color: 'oklch(0.68 0.12 282 / 0.45)' }} />
          <span className='text-admin-label' style={{ color: 'oklch(0.44 0.07 282 / 0.65)' }}>
            {section}
          </span>
        </div>

        {/* Title row */}
        <h1 className='text-admin-hero text-purple-foreground flex items-center gap-3'>
          {title}
          <span className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0' style={{ background: 'color-mix(in oklch, var(--purple-primary) 12%, transparent)', color: 'var(--purple-primary)', border: '1px solid color-mix(in oklch, var(--purple-primary) 20%, transparent)' }}>
            <Icon className='w-5 h-5' aria-hidden='true' />
          </span>
        </h1>

        {/* Subtitle */}
        <p className='text-admin-caption text-purple-muted-foreground mt-2'>
          {subtitle}
        </p>
      </motion.div>

      {actions && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
          className='flex flex-wrap items-center gap-3'
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}
