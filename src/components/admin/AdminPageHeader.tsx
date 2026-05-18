'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface AdminPageHeaderProps {
  /** e.g. "Management", "Academics", "Engagement" */
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
          <span className='px-2.5 py-0.5 rounded-md bg-purple-primary/10 text-[10px] font-bold text-purple-primary uppercase tracking-[0.12em]'>
            Admin
          </span>
          <ChevronRight className='w-3 h-3 text-purple-primary/40' />
          <span className='text-[10px] font-bold text-purple-muted-foreground/60 uppercase tracking-[0.12em]'>
            {section}
          </span>
        </div>

        {/* Title row */}
        <h1 className='text-3xl font-heading font-black text-purple-foreground flex items-center gap-3'>
          {title}
          <Icon className='w-6 h-6 text-purple-primary/35' />
        </h1>

        {/* Subtitle */}
        <p className='text-sm text-purple-muted-foreground font-medium mt-1.5'>
          {subtitle}
        </p>
      </motion.div>

      {actions && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
          className='flex items-center gap-3 shrink-0'
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}
