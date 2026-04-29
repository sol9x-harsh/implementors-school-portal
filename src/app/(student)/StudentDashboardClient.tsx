'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Star,
  BookOpen,
  Activity,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  FileText,
} from 'lucide-react';

// Props-driven data

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;
const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
} as const;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface StudentDashboardProps {
  initialData: {
    verifiedAchievements: number;
    activeRequests: number;
    portfolioIntegrity: number;
    subjects: any[];
  };
  initialEvents: any[];
  initialRequests: any[];
}

export default function StudentDashboard({
  initialData,
  initialEvents,
  initialRequests,
}: StudentDashboardProps) {
  const { data: session } = useSession();

  const stats = [
    {
      label: 'Verified Achievements',
      value: initialData.verifiedAchievements.toString(),
      sub: 'Added to institutional portfolio',
      icon: CheckCircle2,
      gradient: 'bg-purple-gradient',
      glow: 'rgba(147,51,234,0.15)',
    },
    {
      label: 'Active Requests',
      value: initialData.activeRequests.toString(),
      sub: 'Action required on credentials',
      icon: Clock,
      gradient: 'bg-purple-primary/80',
      glow: 'rgba(147,51,234,0.1)',
    },
    {
      label: 'Portfolio Integrity',
      value: `${initialData.portfolioIntegrity}%`,
      sub: 'Institutional readiness score',
      icon: Target,
      gradient: 'bg-purple-foreground/90',
      glow: 'rgba(147,51,234,0.12)',
    },
  ];

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Scholar';

  return (
    <div className='p-8 lg:p-12 space-y-10 max-w-7xl mx-auto'>
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className='relative overflow-hidden rounded-5xl p-10 bg-purple-gradient shadow-purple-lg group'>
          {/* Decorative mesh pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

          <div className='relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <div className='px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-widest'>
                  Academic Session 2025-26
                </div>
                <div className='w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse' />
              </div>
              <div>
                <p className='text-white/80 font-medium text-sm mb-1'>
                  {getGreeting()},
                </p>
                <h1 className='text-4xl md:text-5xl font-heading font-black text-white leading-tight'>
                  {firstName} 👋
                </h1>
                <p className='text-white/70 mt-3 text-[15px] font-medium max-w-lg leading-relaxed'>
                  Your academic trajectory is being indexed. Maintain the
                  current momentum to maximize your institutional ranking.
                </p>
              </div>
            </div>

            <div className='flex flex-col gap-4'>
              <Link
                href='/activities'
                className='flex items-center justify-center gap-3 bg-white text-purple-primary hover:bg-purple-secondary text-[13px]
                  font-black uppercase tracking-widest px-8 py-4 rounded-3xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 border-none group'
              >
                <Activity className='w-4 h-4' />
                Activities Hub
                <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </Link>
              <div className='flex items-center justify-center gap-3 text-white/80 text-[11px] font-black uppercase tracking-widest'>
                <TrendingUp className='w-4 h-4 text-white' />
                Portfolio Status: {initialData.portfolioIntegrity}%
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial='hidden'
        animate='show'
        className='grid grid-cols-1 md:grid-cols-3 gap-6'
      >
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={item}>
              <div className='group relative overflow-hidden bg-white rounded-4xl p-8 border border-purple-border/30 shadow-purple transition-all duration-500 hover:shadow-purple-lg hover:-translate-y-1'>
                <div className='absolute -right-4 -top-4 w-24 h-24 bg-purple-primary/5 rounded-full blur-2xl group-hover:bg-purple-primary/10 transition-colors' />
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-purple transition-transform duration-500 group-hover:rotate-6 ${s.gradient}`}
                >
                  <Icon className='w-6 h-6 text-white' />
                </div>
                <div className='text-4xl font-heading font-black text-purple-foreground tracking-tight'>
                  {s.value}
                </div>
                <div className='text-[11px] font-black text-purple-muted-foreground uppercase tracking-[0.2em] mt-3'>
                  {s.label}
                </div>
                <p className='text-xs font-medium text-purple-muted-foreground/60 mt-1'>
                  {s.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 items-start'>
        {/* ── Academic Portfolio ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className='lg:col-span-3 space-y-6'
        >
          <div className='flex items-center justify-between px-2'>
            <h2 className='text-xl font-heading font-black text-purple-foreground flex items-center gap-3'>
              <BookOpen className='w-6 h-6 text-purple-primary' />
              Academic Indices
            </h2>
            <div className='flex items-center gap-2 px-3 py-1 rounded-full bg-purple-secondary/40 border border-purple-border/20 text-[10px] font-black text-purple-primary uppercase tracking-widest'>
              Term 1 Phase
            </div>
          </div>

          <div className='bg-white rounded-5xl border border-purple-border/30 shadow-purple p-8 space-y-6 relative overflow-hidden group'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-purple-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
            {initialData.subjects.map((s, i) => {
              const pct = Math.round((s.score / s.max) * 100);
              const colorClass =
                pct >= 90
                  ? 'bg-purple-primary'
                  : pct >= 75
                    ? 'bg-purple-primary/70'
                    : 'bg-purple-muted-foreground/50';

              return (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className='space-y-2 group/field'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-[13px] font-bold text-purple-foreground group-hover/field:text-purple-primary transition-colors'>
                      {s.name}
                    </span>
                    <span className='text-[13px] font-black text-purple-primary uppercase tracking-tighter'>
                      {s.score}
                      <span className='text-purple-muted-foreground/40 font-bold ml-0.5'>
                        / {s.max}
                      </span>
                    </span>
                  </div>
                  <div className='h-3 bg-purple-secondary/50 rounded-full overflow-hidden p-0.5 border border-purple-border/10'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        delay: 0.5 + i * 0.08,
                        duration: 1,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      className={`h-full rounded-full transition-all duration-500 ${colorClass} shadow-sm`}
                    />
                  </div>
                </motion.div>
              );
            })}
            {initialData.subjects.length === 0 && (
              <p className='text-center text-purple-muted-foreground py-8'>
                No academic data available for this term.
              </p>
            )}
            <div className='pt-4 flex items-center justify-center gap-6 border-t border-purple-border/10 mt-2'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-purple-primary' />
                <span className='text-[10px] font-black text-purple-muted-foreground/60 uppercase tracking-widest'>
                  Optimized
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-purple-primary/70' />
                <span className='text-[10px] font-black text-purple-muted-foreground/60 uppercase tracking-widest'>
                  Growth Phase
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Upcoming Events ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className='lg:col-span-2 space-y-6'
        >
          <div className='flex items-center justify-between px-2'>
            <h2 className='text-xl font-heading font-black text-purple-foreground flex items-center gap-3'>
              <Zap className='w-6 h-6 text-purple-primary' />
              Strategic Ops
            </h2>
            <Link
              href='/activities'
              className='text-[11px] text-purple-primary font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform group'
            >
              Global Hub{' '}
              <ArrowRight className='w-3.5 h-3.5 group-hover:scale-110 transition-transform' />
            </Link>
          </div>

          <div className='space-y-4'>
            {initialEvents.map((ev, i) => (
              <motion.div
                key={ev.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div
                  className='bg-white rounded-4xl border border-purple-border/30 shadow-purple p-6 flex items-center gap-5
                  hover:border-purple-primary hover:shadow-purple-lg transition-all duration-300 group cursor-pointer overflow-hidden relative'
                >
                  <div className='absolute right-0 top-0 w-24 h-24 bg-purple-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-primary/10 transition-colors' />

                  <div className='w-12 h-12 rounded-2xl bg-purple-secondary/80 border border-purple-border/20 flex items-center justify-center shrink-0 group-hover:bg-purple-primary group-hover:text-white transition-all duration-500 group-hover:rotate-12 group-hover:shadow-purple-sm'>
                    <Award className='w-5 h-5 text-purple-primary group-hover:text-white' />
                  </div>
                  <div className='flex-1 min-w-0 relative z-10'>
                    <p className='text-sm font-bold text-purple-foreground truncate group-hover:text-purple-primary transition-colors'>
                      {ev.title}
                    </p>
                    <div className='flex items-center gap-3 mt-1.5'>
                      <p className='text-[11px] font-bold text-purple-muted-foreground/60 uppercase tracking-tight'>
                        {new Date(ev.eventDate).toLocaleDateString()}
                      </p>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest bg-purple-primary/10 text-purple-primary border border-purple-primary/5 shadow-sm`}
                      >
                        Featured
                      </span>
                    </div>
                  </div>
                  <ArrowRight className='w-5 h-5 text-purple-border/60 group-hover:text-purple-primary group-hover:translate-x-1 transition-all' />
                </div>
              </motion.div>
            ))}

            {initialEvents.length === 0 && (
              <div className='p-6 rounded-4xl bg-purple-secondary/20 border border-purple-border/10 text-center space-y-3'>
                <Sparkles className='w-6 h-6 text-purple-primary/40 mx-auto' />
                <p className='text-[11px] font-bold text-purple-muted-foreground/60 leading-relaxed uppercase tracking-widest px-4'>
                  New opportunities are indexed daily based on your profile
                  specialization.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Active Data Requests ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className='mt-8 space-y-6'
      >
        <div className='flex items-center justify-between px-2'>
          <h2 className='text-xl font-heading font-black text-purple-foreground flex items-center gap-3'>
            <FileText className='w-6 h-6 text-purple-primary' />
            Pending Action Items
          </h2>
          <div className='flex items-center gap-2 px-3 py-1 rounded-full bg-purple-secondary/40 border border-purple-border/20 text-[10px] font-black text-purple-primary uppercase tracking-widest'>
            {initialRequests.length} Required
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {initialRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <Link href={`/forms/${req.id}`}>
                <div
                  className='bg-white rounded-4xl border border-purple-border/30 shadow-purple p-6 flex items-center gap-5
                  hover:border-purple-primary hover:shadow-purple-lg transition-all duration-300 group cursor-pointer overflow-hidden relative'
                >
                  <div className='absolute right-0 top-0 w-24 h-24 bg-purple-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-primary/10 transition-colors' />

                  <div className='w-12 h-12 rounded-2xl bg-purple-secondary/80 border border-purple-border/20 flex items-center justify-center shrink-0 group-hover:bg-purple-primary group-hover:text-white transition-all duration-500 group-hover:-rotate-12 group-hover:shadow-purple-sm'>
                    <FileText className='w-5 h-5 text-purple-primary group-hover:text-white' />
                  </div>
                  <div className='flex-1 min-w-0 relative z-10'>
                    <p className='text-sm font-bold text-purple-foreground truncate group-hover:text-purple-primary transition-colors'>
                      {req.title}
                    </p>
                    <div className='flex items-center gap-3 mt-1.5'>
                      <p className='text-[11px] font-bold text-red-500/80 uppercase tracking-tight'>
                        Due {new Date(req.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className='w-5 h-5 text-purple-border/60 group-hover:text-purple-primary group-hover:translate-x-1 transition-all' />
                </div>
              </Link>
            </motion.div>
          ))}

          {initialRequests.length === 0 && (
            <div className='col-span-full p-6 rounded-4xl bg-purple-secondary/20 border border-purple-border/10 text-center space-y-3'>
              <CheckCircle2 className='w-6 h-6 text-purple-primary/40 mx-auto' />
              <p className='text-[11px] font-bold text-purple-muted-foreground/60 leading-relaxed uppercase tracking-widest px-4'>
                All institutional requests have been fulfilled.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
