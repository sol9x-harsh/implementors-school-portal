'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Activity,
  FileText,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  CalendarDays,
  Sparkles,
  TrendingUp,
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
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 300, damping: 28 },
  }),
};

export default function StudentDashboard({
  initialData,
  initialEvents,
  initialRequests,
}: StudentDashboardProps) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Scholar';

  const stats = [
    {
      label: 'Activities Joined',
      value: initialData.verifiedAchievements,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      iconBg: 'bg-emerald-500',
    },
    {
      label: 'Open Opportunities',
      value: initialData.availableEvents,
      icon: Activity,
      color: 'text-purple-primary',
      bg: 'bg-purple-secondary/30 border-purple-border/30',
      iconBg: 'bg-purple-gradient',
    },
    {
      label: 'Pending Forms',
      value: initialData.activeRequests,
      icon: FileText,
      color: 'text-amber-600',
      bg: initialData.activeRequests > 0 ? 'bg-amber-50 border-amber-200' : 'bg-purple-secondary/30 border-purple-border/30',
      iconBg: initialData.activeRequests > 0 ? 'bg-amber-500' : 'bg-purple-muted-foreground/40',
    },
  ];

  const urgentForms = initialRequests.filter((r) => {
    if (!r.deadline) return false;
    const diff = (new Date(r.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  return (
    <div className='p-6 lg:p-10 space-y-8 max-w-6xl mx-auto pb-20'>

      {/* ── Urgent Forms Banner ─────────────────────────────── */}
      {urgentForms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-4'
        >
          <div className='w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0'>
            <AlertCircle className='w-5 h-5 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-bold text-amber-800'>
              {urgentForms.length === 1 ? '1 form requires' : `${urgentForms.length} forms require`} your attention — deadline within 7 days
            </p>
            <div className='flex flex-wrap gap-2 mt-2'>
              {urgentForms.map((f) => (
                <Link
                  key={f.id}
                  href={`/forms/${f.id}`}
                  className='inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 rounded-lg px-2.5 py-1.5 transition-colors'
                >
                  {f.title}
                  <ChevronRight className='w-3 h-3' />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className='relative overflow-hidden rounded-3xl bg-purple-gradient shadow-purple-lg px-8 py-10'>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] pointer-events-none" />
          <div className='relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6'>
            <div className='space-y-2'>
              <p className='text-white/70 text-sm font-medium'>{getGreeting()},</p>
              <h1 className='text-3xl md:text-4xl font-heading font-black text-white leading-tight'>
                {firstName} 👋
              </h1>
              <p className='text-white/60 text-sm font-medium max-w-md leading-relaxed mt-1'>
                Stay on top of your activities, track deadlines, and grow your academic record.
              </p>
            </div>
            <Link
              href='/activities'
              className='self-start sm:self-center flex items-center gap-2.5 bg-white/20 hover:bg-white/30 text-white text-[12px]
                font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all duration-300 border border-white/20 backdrop-blur-sm whitespace-nowrap group'
            >
              <Activity className='w-4 h-4' />
              View Activities
              <ChevronRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform' />
            </Link>
          </div>

          {/* Mini stats in hero */}
          <div className='relative z-10 grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/15'>
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className='flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10'>
                  <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className='w-4 h-4 text-white' />
                  </div>
                  <div>
                    <p className='text-xl font-heading font-black text-white leading-tight'>{s.value}</p>
                    <p className='text-[9px] font-bold text-white/50 uppercase tracking-wider leading-tight'>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 items-start'>

        {/* ── Latest Activities ─────────────────────────────── */}
        <motion.section
          custom={0} variants={fadeUp} initial='hidden' animate='show'
          className='lg:col-span-3 space-y-4'
        >
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-heading font-black text-purple-foreground flex items-center gap-2'>
              <Sparkles className='w-5 h-5 text-purple-primary' />
              Latest Activities
            </h2>
            <Link
              href='/activities'
              className='text-[11px] text-purple-primary font-black uppercase tracking-widest flex items-center gap-1.5 hover:translate-x-0.5 transition-transform group'
            >
              View all <ArrowRight className='w-3 h-3 group-hover:translate-x-0.5 transition-transform' />
            </Link>
          </div>

          {initialEvents.length > 0 ? (
            <div className='space-y-3'>
              {initialEvents.slice(0, 5).map((ev, i) => (
                <motion.div key={ev.id} custom={i + 1} variants={fadeUp} initial='hidden' animate='show'>
                  <div className='bg-white rounded-2xl border border-purple-border/30 shadow-purple p-4 flex items-center gap-4
                    hover:border-purple-primary/40 hover:shadow-purple-lg transition-all duration-300 group'>
                    <div className='w-10 h-10 rounded-xl bg-purple-secondary/60 border border-purple-border/20 flex items-center justify-center shrink-0
                      group-hover:bg-purple-gradient group-hover:shadow-purple-sm transition-all duration-300'>
                      <Activity className='w-4 h-4 text-purple-primary group-hover:text-white' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-bold text-purple-foreground truncate group-hover:text-purple-primary transition-colors'>
                        {ev.title}
                      </p>
                      {ev.eventDate && (
                        <div className='flex items-center gap-1.5 mt-0.5'>
                          <CalendarDays className='w-3 h-3 text-purple-muted-foreground/50' />
                          <p className='text-[11px] text-purple-muted-foreground/70 font-medium'>
                            {new Date(ev.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                    {ev.externalUrl && (
                      <a href={ev.externalUrl} target='_blank' rel='noopener noreferrer' className='shrink-0'>
                        <ExternalLink className='w-4 h-4 text-purple-border/60 group-hover:text-purple-primary transition-colors' />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='bg-white rounded-2xl border border-purple-border/20 p-10 text-center space-y-3'>
              <Sparkles className='w-8 h-8 text-purple-primary/20 mx-auto' />
              <p className='text-sm font-bold text-purple-muted-foreground'>No activities yet</p>
              <p className='text-xs text-purple-muted-foreground/60'>New opportunities are published regularly. Check back soon.</p>
            </div>
          )}
        </motion.section>

        {/* ── Right column ────────────────────────────────────── */}
        <div className='lg:col-span-2 space-y-6'>

          {/* Pending Forms */}
          <motion.section custom={2} variants={fadeUp} initial='hidden' animate='show' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-base font-heading font-black text-purple-foreground flex items-center gap-2'>
                <FileText className='w-5 h-5 text-purple-primary' />
                Pending Forms
              </h2>
              {initialRequests.length > 0 && (
                <span className='text-[10px] bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest'>
                  {initialRequests.length} Due
                </span>
              )}
            </div>

            {initialRequests.length > 0 ? (
              <div className='space-y-3'>
                {initialRequests.slice(0, 4).map((req, i) => {
                  const daysLeft = req.deadline
                    ? Math.ceil((new Date(req.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isUrgent = daysLeft !== null && daysLeft <= 3;
                  return (
                    <motion.div key={req.id} custom={i + 3} variants={fadeUp} initial='hidden' animate='show'>
                      <Link href={`/forms/${req.id}`}>
                        <div className={`bg-white rounded-2xl border shadow-purple p-4 flex items-center gap-4
                          hover:shadow-purple-lg transition-all duration-300 group cursor-pointer
                          ${isUrgent ? 'border-amber-200 hover:border-amber-300' : 'border-purple-border/30 hover:border-purple-primary/40'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
                            ${isUrgent ? 'bg-amber-50' : 'bg-purple-secondary/60 border border-purple-border/20 group-hover:bg-purple-gradient group-hover:shadow-purple-sm'}`}
                          >
                            <Clock className={`w-4 h-4 ${isUrgent ? 'text-amber-500' : 'text-purple-primary group-hover:text-white'}`} />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-bold text-purple-foreground truncate group-hover:text-purple-primary transition-colors'>
                              {req.title}
                            </p>
                            {daysLeft !== null && (
                              <p className={`text-[11px] font-bold mt-0.5 ${isUrgent ? 'text-amber-600' : 'text-purple-muted-foreground/70'}`}>
                                {daysLeft <= 0 ? 'Overdue!' : `${daysLeft}d left`}
                              </p>
                            )}
                          </div>
                          <ArrowRight className='w-4 h-4 text-purple-border/50 group-hover:text-purple-primary group-hover:translate-x-0.5 transition-all' />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className='bg-white rounded-2xl border border-purple-border/20 p-8 text-center space-y-2'>
                <CheckCircle2 className='w-8 h-8 text-emerald-400 mx-auto' />
                <p className='text-sm font-bold text-purple-muted-foreground'>All clear!</p>
                <p className='text-xs text-purple-muted-foreground/60'>No pending forms right now.</p>
              </div>
            )}
          </motion.section>

          {/* Academic Grades — only shown if data exists */}
          {initialData.subjects.length > 0 && (
            <motion.section custom={4} variants={fadeUp} initial='hidden' animate='show' className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-base font-heading font-black text-purple-foreground flex items-center gap-2'>
                  <TrendingUp className='w-5 h-5 text-purple-primary' />
                  Academic Grades
                </h2>
                <span className='text-[10px] bg-purple-secondary px-2.5 py-0.5 rounded-full text-purple-primary font-black uppercase tracking-widest border border-purple-border/30'>
                  Term 1
                </span>
              </div>

              <div className='bg-white rounded-2xl border border-purple-border/30 shadow-purple p-5 space-y-4'>
                {initialData.subjects.map((s, i) => {
                  const pct = Math.round((s.score / s.max) * 100);
                  const barColor = pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-purple-primary' : 'bg-amber-400';
                  return (
                    <motion.div
                      key={s.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                      className='space-y-1.5'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-[12px] font-bold text-purple-foreground'>{s.name}</span>
                        <span className='text-[12px] font-black text-purple-primary'>
                          {s.score}<span className='text-purple-muted-foreground/40 font-bold'>/{s.max}</span>
                        </span>
                      </div>
                      <div className='h-2 bg-purple-secondary/50 rounded-full overflow-hidden'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6 + i * 0.07, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}
