'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

export function StudentSearchBar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/activities?q=${encodeURIComponent(query.trim())}`);
    });
  };

  const handleClear = () => {
    setQuery('');
    startTransition(() => {
      router.push('/activities');
    });
  };

  return (
    <form onSubmit={handleSubmit} className='flex-1 max-w-md relative group'>
      <div className='relative'>
        {isPending ? (
          <Loader2 className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-student-primary animate-spin' />
        ) : (
          <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-student-muted-foreground/60 group-focus-within:text-student-primary transition-colors pointer-events-none' />
        )}
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search activities...'
          className='w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-11 pr-9 text-[13px] font-medium
            focus:outline-none focus:ring-2 focus:ring-indigo-600/5 focus:border-indigo-600/30 focus:bg-white
            placeholder:text-slate-400 transition-all duration-200'
        />
        {query && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-student-muted-foreground/50 hover:text-student-primary transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
    </form>
  );
}
