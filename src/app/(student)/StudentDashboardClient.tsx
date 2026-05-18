'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  FileText,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface StudentDashboardProps {
  initialData: {
    verifiedAchievements: number;
    availableEvents: number;
    activeRequests: number;
    portfolioIntegrity: number;
    subjects: { name: string; score: number; max: number }[];
  };
  initialEvents: {
    id: string;
    title: string;
    description?: string;
    eventDate?: string;
    externalUrl?: string;
  }[];
  initialRequests: {
    id: string;
    title: string;
    deadline?: string;
  }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      type: 'spring' as const,
      stiffness: 300,
      damping: 28,
    },
  }),
};

export default function StudentDashboard({
  initialData,
  initialEvents,
  initialRequests,
}: StudentDashboardProps) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Scholar';

  const urgentForms = initialRequests.filter((r) => {
    if (!r.deadline) return false;
    const diff =
      (new Date(r.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  return (
    <div className='p-4 lg:p-8 max-w-[1400px] mx-auto pb-24'>
      {/* ── Urgent Forms Banner ─────────────────────────────── */}
      {urgentForms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6 rounded-[2rem] bg-student-warning/10 border border-student-warning/30 px-6 py-5 flex items-start gap-4 backdrop-blur-md'
        >
          <div className='w-10 h-10 rounded-2xl bg-student-warning flex items-center justify-center shrink-0 shadow-sm'>
            <AlertCircle className='w-5 h-5 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-bold text-student-warning'>
              {urgentForms.length === 1
                ? '1 form requires'
                : `${urgentForms.length} forms require`}{' '}
              your attention — deadline within 7 days
            </p>
            <div className='flex flex-wrap gap-2 mt-3'>
              {urgentForms.map((f) => (
                <Link
                  key={f.id}
                  href={`/forms/${f.id}`}
                  className='inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-student-warning bg-white/50 hover:bg-white border border-student-warning/20 rounded-xl px-3 py-2 transition-colors'
                >
                  {f.title}
                  <ChevronRight className='w-3 h-3' />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className='mb-8 flex items-end justify-between'>
        <div>
          <h1 className='text-3xl font-heading font-black text-slate-900 tracking-tight'>
            Welcome back, {firstName}!
          </h1>
          <p className='text-sm text-slate-500 font-medium mt-1'>
            It is the best time to manage your activities and portfolio.
          </p>
        </div>
        <div className='hidden sm:flex items-center gap-3'>
          <Link
            href='/activities'
            className='bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold px-5 py-2.5 rounded-full transition-colors'
          >
            + Explore Activities
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6'>
        {[
          {
            icon: Zap,
            label: 'Activities Joined',
            value: initialData.verifiedAchievements,
            delay: 0.1,
          },
          {
            icon: Target,
            label: 'Open Opportunities',
            value: initialData.availableEvents,
            delay: 0.2,
          },
          {
            icon: FileText,
            label: 'Pending Forms',
            value: initialData.activeRequests,
            delay: 0.3,
          },
          {
            icon: TrendingUp,
            label: 'Avg Score',
            value:
              initialData.subjects.length > 0
                ? `${Math.round(initialData.subjects.reduce((acc, curr) => acc + (curr.score / curr.max) * 100, 0) / initialData.subjects.length)}%`
                : 'N/A',
            delay: 0.4,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay }}
            className='bento-card p-5 flex flex-col justify-between min-h-[140px]'
          >
            <div className='flex justify-between items-start mb-4'>
              <p className='text-[14px] font-bold text-slate-900'>
                {card.label}
              </p>
              <div className='w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer'>
                <ArrowRight className='w-3.5 h-3.5 -rotate-45' />
              </div>
            </div>

            <p className='text-3xl font-heading font-black text-slate-900 leading-none mb-3'>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ────────────────────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6'>
        {/* ── Latest Activities (Span 8) ────────────────────── */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial='hidden'
          animate='show'
          className='col-span-1 lg:col-span-8 bento-card p-6 lg:p-8 flex flex-col'
        >
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-student-primary/10 flex items-center justify-center border border-student-primary/20'>
                <Sparkles className='w-5 h-5 text-student-primary' />
              </div>
              <h2 className='text-lg font-heading font-black text-student-foreground'>
                Latest Activities
              </h2>
            </div>
            <Link
              href='/activities'
              className='text-[11px] text-student-primary font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-opacity group'
            >
              View all{' '}
              <ArrowRight className='w-3 h-3 group-hover:translate-x-1 transition-transform' />
            </Link>
          </div>

          <div className='flex-1 flex flex-col gap-3'>
            {initialEvents.length > 0 ? (
              initialEvents.slice(0, 4).map((ev, i) => (
                <div
                  key={ev.id}
                  className='bg-white/50 hover:bg-white rounded-[1.25rem] border border-white shadow-sm p-4 flex items-center gap-4 transition-all duration-300 group'
                >
                  <div className='w-12 h-12 rounded-xl bg-student-secondary/20 border border-white flex items-center justify-center shrink-0 group-hover:bg-student-gradient group-hover:shadow-student-sm transition-all duration-300'>
                    <Activity className='w-5 h-5 text-student-primary group-hover:text-white transition-colors' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[15px] font-bold text-student-foreground truncate group-hover:text-student-primary transition-colors'>
                      {ev.title}
                    </p>
                    {ev.eventDate && (
                      <div className='flex items-center gap-1.5 mt-1'>
                        <CalendarDays className='w-3.5 h-3.5 text-student-muted-foreground/60' />
                        <p className='text-[12px] text-student-muted-foreground/80 font-medium'>
                          {new Date(ev.eventDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  {ev.externalUrl && (
                    <a
                      href={ev.externalUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-student-primary/10 border border-student-border/20 transition-colors'
                    >
                      <ExternalLink className='w-4 h-4 text-student-muted-foreground hover:text-student-primary transition-colors' />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className='flex-1 flex flex-col items-center justify-center border-2 border-dashed border-student-border/50 rounded-[1.25rem] p-8 text-center'>
                <Sparkles className='w-8 h-8 text-student-primary/30 mb-3' />
                <p className='text-sm font-bold text-student-muted-foreground'>
                  No activities yet
                </p>
                <p className='text-[11px] text-student-muted-foreground/60 mt-1'>
                  New opportunities are published regularly.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Secondary Column (Span 4) ─────────────────────── */}
        <div className='col-span-1 lg:col-span-4 flex flex-col gap-4 lg:gap-6'>
          {/* Pending Forms */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial='hidden'
            animate='show'
            className='bento-card p-6 flex flex-col'
          >
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-[15px] font-heading font-black text-student-foreground flex items-center gap-2'>
                <FileText className='w-4 h-4 text-student-primary' />
                Pending Forms
              </h2>
              {initialRequests.length > 0 && (
                <span className='text-[9px] bg-student-warning text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm'>
                  {initialRequests.length} Due
                </span>
              )}
            </div>

            <div className='flex flex-col gap-3'>
              {initialRequests.length > 0 ? (
                initialRequests.slice(0, 3).map((req) => {
                  const daysLeft = req.deadline
                    ? Math.ceil(
                        (new Date(req.deadline).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : null;
                  const isUrgent = daysLeft !== null && daysLeft <= 3;
                  return (
                    <Link key={req.id} href={`/forms/${req.id}`}>
                      <div
                        className={`bg-white/60 hover:bg-white rounded-xl border p-3 flex items-center gap-3 transition-all duration-200 group ${isUrgent ? 'border-student-warning/30 shadow-sm' : 'border-white shadow-sm'}`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? 'bg-student-warning/15' : 'bg-student-secondary/20'}`}
                        >
                          <Clock
                            className={`w-4 h-4 ${isUrgent ? 'text-student-warning' : 'text-student-primary'}`}
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-[13px] font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors'>
                            {req.title}
                          </p>
                          {daysLeft !== null && (
                            <p
                              className={`text-[10px] font-bold mt-0.5 ${isUrgent ? 'text-amber-600' : 'text-slate-500'}`}
                            >
                              {daysLeft <= 0
                                ? 'Overdue!'
                                : `${daysLeft} days left`}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className='py-6 text-center'>
                  <CheckCircle2 className='w-6 h-6 text-student-primary/50 mx-auto mb-2' />
                  <p className='text-xs font-bold text-student-muted-foreground'>
                    All clear!
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Academic Grades */}
          {initialData.subjects.length > 0 && (
            <motion.div
              custom={3}
              variants={fadeUp}
              initial='hidden'
              animate='show'
              className='bento-card p-6 flex flex-col'
            >
              <div className='flex items-center justify-between mb-5'>
                <h2 className='text-[15px] font-heading font-black text-slate-900 flex items-center gap-2'>
                  <TrendingUp className='w-4 h-4 text-indigo-600' />
                  Academic Performance
                </h2>
                <span className='text-[9px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-indigo-600 font-black uppercase tracking-widest'>
                  This Year
                </span>
              </div>

              <div className='flex flex-col gap-4'>
                {initialData.subjects.slice(0, 3).map((s, i) => {
                  const pct = Math.round((s.score / s.max) * 100);
                  const barColor =
                    pct >= 90
                      ? 'bg-indigo-600'
                      : pct >= 75
                        ? 'bg-violet-500'
                        : 'bg-indigo-300';
                  return (
                    <div key={s.name} className='space-y-1.5'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-[12px] font-bold text-slate-900'>
                          {s.name}
                        </span>
                        <span className='text-[12px] font-black text-indigo-600'>
                          {s.score}/{s.max}
                        </span>
                      </div>
                      <div className='h-5 bg-indigo-50 rounded-full overflow-hidden relative'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            delay: 0.5 + i * 0.1,
                            duration: 0.8,
                            ease: [0.34, 1.56, 0.64, 1],
                          }}
                          className={`h-full rounded-full ${barColor} flex items-center px-3`}
                        >
                          <span className='text-[10px] font-black text-white'>
                            {pct}%
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
