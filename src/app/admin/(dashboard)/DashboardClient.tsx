'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  CalendarPlus,
  Users,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ClipboardList,
  Layers,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/* ── Animation variants ───────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
} as const;

/* ── Helpers ──────────────────────────────────────────── */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Quick actions ────────────────────────────────────── */
const quickActions = [
  {
    label: 'New Activity',
    desc: 'Publish to feed',
    icon: CalendarPlus,
    href: '/admin/events',
    iconColor: 'text-purple-primary',
    iconBg: 'bg-purple-secondary/40 border-purple-border/30',
  },
  {
    label: 'Data Request',
    desc: 'Create a form',
    icon: Layers,
    href: '/admin/forms',
    iconColor: 'text-purple-primary',
    iconBg: 'bg-purple-secondary/30 border-purple-border/30',
  },
  {
    label: 'Student Dir.',
    desc: 'Manage records',
    icon: Users,
    href: '/admin/students',
    iconColor: 'text-purple-primary',
    iconBg: 'bg-purple-accent/40 border-purple-border/30',
  },
  {
    label: 'New Assessment',
    desc: 'Academic exams',
    icon: ClipboardList,
    href: '/admin/tests',
    iconColor: 'text-purple-primary',
    iconBg: 'bg-purple-muted/60 border-purple-border/30',
  },
];

/* ── Types ────────────────────────────────────────────── */
interface AdminDashboardProps {
  initialStats: {
    totalStudents: number;
    publishedEvents: number;
    activeRequests: number;
    genderData: any[];
    // Real deltas from server
    studentDelta: string;
    studentUp: boolean;
    eventDelta: string;
    upcomingEvents: number;
    requestDelta: string;
  };
  initialActivity: any[];
}

/* ── Component ────────────────────────────────────────── */
export default function AdminDashboard({
  initialStats,
  initialActivity,
}: AdminDashboardProps) {
  const { data: session } = useSession();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // All values and deltas are real — sourced from DB via server action
  const stats = [
    {
      label: 'Total Students',
      value: initialStats.totalStudents,
      delta: initialStats.studentDelta,
      up: initialStats.studentUp,
      icon: Users,
      accentColor: 'oklch(0.52 0.22 278)',
      iconBg: 'color-mix(in oklch, var(--purple-primary) 12%, transparent)',
      iconBorder: 'color-mix(in oklch, var(--purple-primary) 22%, transparent)',
    },
    {
      label: 'Published Events',
      value: initialStats.publishedEvents,
      delta: initialStats.eventDelta,
      up: initialStats.upcomingEvents > 0,
      icon: CalendarPlus,
      accentColor: 'oklch(0.52 0.22 278)',
      iconBg: 'color-mix(in oklch, var(--purple-primary) 12%, transparent)',
      iconBorder: 'color-mix(in oklch, var(--purple-primary) 22%, transparent)',
    },
    {
      label: 'Active Requests',
      value: initialStats.activeRequests,
      delta: initialStats.requestDelta,
      up: initialStats.activeRequests > 0 ? null : false,
      icon: FileText,
      accentColor: 'oklch(0.52 0.22 278)',
      iconBg: 'color-mix(in oklch, var(--purple-primary) 12%, transparent)',
      iconBorder: 'color-mix(in oklch, var(--purple-primary) 22%, transparent)',
    },
    {
      label: 'Reports Ready',
      value: '—',
      delta: 'Available',
      up: null,
      icon: BarChart3,
      accentColor: 'oklch(0.52 0.22 278)',
      iconBg: 'color-mix(in oklch, var(--purple-primary) 12%, transparent)',
      iconBorder: 'color-mix(in oklch, var(--purple-primary) 22%, transparent)',
    },
  ];

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='admin-shell space-y-7'>
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col md:flex-row md:items-end justify-between gap-3 pb-5 border-b border-purple-border/40'
      >
        <div>
          <p className='text-admin-label text-purple-muted-foreground/50 mb-1 flex items-center gap-1.5'>
            <Activity className='w-3 h-3' />
            Admin Console
          </p>
          <h1 className='text-2xl font-heading font-black text-purple-foreground flex items-center gap-2 flex-wrap'>
            {getGreeting()},{' '}
            <span className='text-purple-primary'>
              {session?.user?.name?.split(' ')[0] ?? 'Admin'}
            </span>{' '}
            👋
          </h1>
          <p className='text-admin-caption text-purple-muted-foreground mt-1 flex items-center gap-1.5'>
            <Sparkles className='w-3 h-3 text-purple-primary/60' />
            Here&apos;s what&apos;s happening at Sol9x today.
          </p>
        </div>

        <div className='flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg shadow-purple-xs border border-purple-border/30 text-[12px] font-semibold text-purple-muted-foreground shrink-0'>
          {isMounted ? todayStr : 'Loading...'}
        </div>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial='hidden'
        animate='show'
        className='grid grid-cols-2 lg:grid-cols-4 gap-4'
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={item}
              className='relative overflow-hidden group cursor-default bg-white rounded-2xl border border-purple-border/25 shadow-purple-xs hover:shadow-purple-sm transition-all duration-200 hover:-translate-y-0.5'
            >
              {/* Left accent stripe */}
              <div
                className='absolute top-0 left-0 bottom-0 w-[3px] rounded-l-2xl'
                style={{ background: s.accentColor }}
              />

              <div className='pl-6 pr-5 pt-5 pb-5'>
                {/* Label + Icon row */}
                <div className='flex items-center justify-between mb-4'>
                  <p className='text-[10px] font-black uppercase tracking-[0.14em] text-purple-muted-foreground/50'>
                    {s.label}
                  </p>
                  <div
                    className='w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform duration-200'
                    style={{ background: s.iconBg, borderColor: s.iconBorder }}
                  >
                    <Icon className='w-3.5 h-3.5' style={{ color: s.accentColor }} />
                  </div>
                </div>

                {/* Value — always dark for readability */}
                <div className='text-[34px] font-heading font-black leading-none tracking-tight text-purple-foreground'>
                  {s.value}
                </div>

                {/* Delta pill */}
                <div
                  className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-3'
                  style={{
                    background: s.up === true
                      ? 'oklch(0.50 0.15 145 / 0.10)'
                      : 'oklch(0.94 0.04 285 / 0.7)',
                    color: s.up === true
                      ? 'oklch(0.38 0.17 145)'
                      : 'oklch(0.50 0.06 285)',
                  }}
                >
                  {s.up === true && <TrendingUp className='w-2.5 h-2.5' />}
                  {s.up === false && <TrendingDown className='w-2.5 h-2.5' />}
                  <span>{s.delta}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Quick Actions ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <p className='text-admin-label text-purple-muted-foreground/45 mb-3'>
          Quick Actions
        </p>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href}>
                <div className='admin-card p-4 flex items-center gap-3 hover:shadow-purple-sm cursor-pointer group transition-all duration-150 border border-purple-border/30'>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${a.iconBg} ${a.iconColor} group-hover:scale-105 transition-transform duration-150`}
                  >
                    <Icon className='w-4 h-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[13px] font-bold text-purple-foreground truncate leading-tight'>
                      {a.label}
                    </p>
                    <p className='text-[10px] text-purple-muted-foreground/60 font-medium truncate mt-0.5'>
                      {a.desc}
                    </p>
                  </div>
                  <ArrowRight className='w-3.5 h-3.5 text-purple-border shrink-0 group-hover:text-purple-primary group-hover:translate-x-0.5 transition-all duration-150' />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ── Charts ─────────────────────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {/* Demographics Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className='admin-card p-5'
        >
          <div className='flex items-start justify-between mb-5'>
            <div>
              <h2 className='text-[14px] font-heading font-black text-purple-foreground'>
                Student Demographics
              </h2>
              <p className='text-[11px] text-purple-muted-foreground font-semibold mt-0.5'>
                Breakdown by academic stream
              </p>
            </div>
          </div>
          <div className='h-[240px]'>
            {isMounted && (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={initialStats.genderData}
                  margin={{ top: 2, right: 4, left: -28, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='2 3'
                    horizontal
                    vertical={false}
                    stroke='oklch(0.92 0.02 285 / 0.5)'
                  />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: 'oklch(0.44 0.07 282)',
                    }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: 'oklch(0.44 0.07 282)',
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: 'oklch(0.60 0.18 280 / 0.04)' }}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid oklch(0.92 0.02 285)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      fontWeight: 600,
                      fontSize: '12px',
                      padding: '8px 12px',
                    }}
                  />
                  <Bar
                    dataKey='value'
                    fill='var(--purple-primary)'
                    radius={[5, 5, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Student Distribution Donut */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='admin-card p-5 flex flex-col'
        >
          <div className='flex items-start justify-between mb-5'>
            <div>
              <h2 className='text-[14px] font-heading font-black text-purple-foreground'>
                Student Distribution
              </h2>
              <p className='text-[11px] text-purple-muted-foreground font-medium mt-0.5'>
                By academic stream
              </p>
            </div>
          </div>
          <div className='relative h-[240px]'>
            {isMounted && (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={initialStats.genderData}
                    cx='50%'
                    cy='44%'
                    innerRadius={65}
                    outerRadius={96}
                    paddingAngle={5}
                    dataKey='value'
                    stroke='none'
                  >
                    {initialStats.genderData.map(
                      (entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ),
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid oklch(0.92 0.02 285)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      fontWeight: 600,
                      fontSize: '12px',
                      padding: '8px 12px',
                    }}
                  />
                  <Legend
                    verticalAlign='bottom'
                    align='center'
                    iconType='circle'
                    iconSize={7}
                    formatter={(value) => (
                      <span className='text-[11px] font-semibold text-purple-muted-foreground ml-1'>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Centre label */}
            <div className='absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none'>
              <div className='text-[9px] font-bold text-purple-muted-foreground/40 uppercase tracking-[0.15em]'>
                Total
              </div>
              <div className='text-2xl font-heading font-black text-purple-foreground mt-0.5'>
                {initialStats.totalStudents}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Activity + Action Required ──────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 pb-6'>
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className='lg:col-span-2 admin-card p-5'
        >
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-[14px] font-heading font-black text-purple-foreground'>
              Recent Platform Activity
            </h2>
            <button className='text-[11px] font-bold text-purple-primary hover:underline underline-offset-2'>
              View all
            </button>
          </div>
          <div className='space-y-2'>
            {initialActivity.slice(0, 5).map((act: any, idx: number) => {
              const actIcons = [CalendarPlus, Users, ClipboardList, FileText, BarChart3];
              const ActIcon = actIcons[idx % actIcons.length];
              return (
                <div
                  key={idx}
                  className='flex items-center gap-3 p-3 rounded-lg bg-purple-secondary/15 border border-purple-border/20 hover:bg-purple-secondary/30 hover:border-purple-border/35 transition-all duration-150'
                >
                  <div
                    className='w-8 h-8 rounded-lg flex items-center justify-center shrink-0'
                    style={{ background: 'color-mix(in oklch, var(--purple-primary) 12%, transparent)' }}
                  >
                    <ActIcon className='w-3.5 h-3.5 text-purple-primary' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[12px] font-semibold text-purple-foreground truncate'>
                      {act.title}
                    </p>
                    <p className='text-[11px] text-purple-muted-foreground font-medium mt-0.5 truncate'>
                      {act.desc}
                    </p>
                  </div>
                  {act.time && (
                    <span className='text-[10px] font-medium text-purple-muted-foreground/45 shrink-0 tabular-nums'>
                      {act.time}
                    </span>
                  )}
                </div>
              );
            })}
            {initialActivity.length === 0 && (
              <div className='text-center py-10 text-purple-muted-foreground/40'>
                <Sparkles className='w-7 h-7 mx-auto mb-2 opacity-25' />
                <p className='text-[11px] font-bold uppercase tracking-widest'>
                  No activity yet
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Required */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className='admin-card p-5 flex flex-col'
        >
          <div className='flex items-center gap-2 mb-4'>
            <div
              className='w-5 h-5 rounded-md flex items-center justify-center'
              style={{ background: 'oklch(0.72 0.18 70 / 0.15)' }}
            >
              <Activity className='w-3 h-3' style={{ color: 'oklch(0.60 0.18 70)' }} />
            </div>
            <h2 className='text-[14px] font-heading font-black text-purple-foreground'>
              Action Required
            </h2>
          </div>
          <div className='space-y-2 flex-1'>
            {[
              {
                label: 'Upcoming Events',
                value: initialStats.upcomingEvents,
                href: '/admin/events',
                urgent: initialStats.upcomingEvents > 0,
                desc: initialStats.upcomingEvents > 0 ? 'Deadline approaching' : 'All clear',
                icon: CalendarPlus,
                dotColor: initialStats.upcomingEvents > 0 ? 'oklch(0.72 0.18 68)' : 'oklch(0.55 0.14 145)',
              },
              {
                label: 'Open Requests',
                value: initialStats.activeRequests,
                href: '/admin/forms',
                urgent: initialStats.activeRequests > 0,
                desc: initialStats.activeRequests > 0 ? 'Needs response' : 'All handled',
                icon: FileText,
                dotColor: initialStats.activeRequests > 0 ? 'oklch(0.72 0.18 68)' : 'oklch(0.55 0.14 145)',
              },
              {
                label: 'Student Directory',
                value: initialStats.totalStudents,
                href: '/admin/students',
                urgent: false,
                desc: 'View all records',
                icon: Users,
                dotColor: 'oklch(0.60 0.18 280)',
              },
              {
                label: 'Reports & Portfolios',
                value: null,
                href: '/admin/reports',
                urgent: false,
                desc: 'Generate reports',
                icon: BarChart3,
                dotColor: 'oklch(0.60 0.18 280)',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.label} href={s.href}>
                  <div className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-purple-secondary/30 transition-colors duration-100 group cursor-pointer'>
                    <div
                      className='w-1.5 h-1.5 rounded-full shrink-0 pulse-dot'
                      style={{ background: s.dotColor }}
                    />
                    <Icon className='w-3.5 h-3.5 text-purple-muted-foreground/60 shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-[12px] font-semibold text-purple-foreground truncate leading-tight'>
                        {s.label}
                      </p>
                      <p className='text-[10px] text-purple-muted-foreground/55 font-medium mt-0.5'>
                        {s.desc}
                      </p>
                    </div>
                    {s.value !== null && (
                      <span
                        className='text-[12px] font-black tabular-nums shrink-0'
                        style={{ color: s.dotColor }}
                      >
                        {s.value}
                      </span>
                    )}
                    <ArrowRight className='w-3 h-3 text-purple-border/50 group-hover:text-purple-primary group-hover:translate-x-0.5 transition-all duration-150 shrink-0' />
                  </div>
                </Link>
              );
            })}
          </div>
          <div className='mt-3 pt-3 border-t border-purple-border/25'>
            <p className='text-[10px] text-purple-muted-foreground/40 font-medium uppercase tracking-widest'>
              Live · Just now
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
