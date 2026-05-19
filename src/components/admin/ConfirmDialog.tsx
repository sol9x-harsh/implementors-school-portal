'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className='max-w-sm rounded-3xl border-purple-border/30 shadow-purple-lg p-0 overflow-hidden'>
        <div className='h-1 bg-purple-gradient' />
        <div className='p-6'>
          <DialogHeader>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0'>
                <AlertTriangle className='w-4 h-4 text-rose-500' />
              </div>
              <DialogTitle className='text-base font-black text-purple-foreground'>
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className='text-sm text-purple-muted-foreground font-medium pl-12'>
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='mt-6 flex gap-2 justify-end'>
            <Button
              variant='ghost'
              onClick={onCancel}
              className='h-9 rounded-xl border border-purple-border/30 text-purple-muted-foreground hover:text-purple-foreground hover:bg-purple-secondary/30 font-bold text-sm'
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              className={
                destructive
                  ? 'h-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-sm'
                  : 'h-9 rounded-xl admin-button admin-button-primary font-bold text-sm'
              }
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
