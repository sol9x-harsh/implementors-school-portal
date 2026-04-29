'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarPlus,
  Users,
  Globe,
  GraduationCap,
  User,
  Send,
  Eye,
  Sparkles,
  ExternalLink,
  Calendar,
  Tag,
  Link2,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createEvent } from '@/lib/actions/admin.actions';

// ─── Types ───────────────────────────────────────────────────────────────────

type DateMode = 'range' | 'single' | 'deadline';

type LinkType = 'test' | 'hackathon' | 'activity' | 'event';

const LINK_TYPE_CONFIG: Record<
  LinkType,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  test: {
    label: 'Test / Exam',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: '📝',
  },
  hackathon: {
    label: 'Hackathon',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: '⚡',
  },
  activity: {
    label: 'Activity',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '🎯',
  },
  event: {
    label: 'Event',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: '🗓️',
  },
};

const DATE_MODE_OPTIONS: { value: DateMode; label: string; sub: string }[] = [
  { value: 'range', label: 'Date Range', sub: 'Start → End' },
  { value: 'single', label: 'Single Date', sub: 'One day' },
  { value: 'deadline', label: 'Deadline', sub: 'Last date to apply' },
];

const audienceOptions = [
  {
    value: 'global',
    label: 'All Students',
    sub: 'Every registered student',
    icon: Globe,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    value: 'cohort',
    label: 'Specific Cohort',
    sub: 'Class or stream',
    icon: GraduationCap,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    value: 'individual',
    label: 'Individual',
    sub: 'Select specific students',
    icon: User,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function SmartEventsClient() {
  // ── Form state
  const [isPublishing, setIsPublishing] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('event');
  const [audience, setAudience] = useState('global');
  const [dateMode, setDateMode] = useState<DateMode>('range');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [singleDate, setSingleDate] = useState('');
  const [deadline, setDeadline] = useState('');

  // ── Derived
  const selectedAudience = audienceOptions.find((a) => a.value === audience)!;
  const AudienceIcon = selectedAudience.icon;
  const typeConfig = LINK_TYPE_CONFIG[linkType];

  const getDisplayDate = () => {
    if (dateMode === 'range' && startDate && endDate)
      return `${fmt(startDate)} — ${fmt(endDate)}`;
    if (dateMode === 'range' && startDate) return `Starts ${fmt(startDate)}`;
    if (dateMode === 'single' && singleDate) return fmt(singleDate);
    if (dateMode === 'deadline' && deadline)
      return `Deadline: ${fmt(deadline)}`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPublishing(true);

    const formData = new FormData(e.currentTarget);

    // Normalise dates into the fields the server action reads
    if (dateMode === 'single') {
      formData.set('date', singleDate);
      formData.delete('startDate');
      formData.delete('endDate');
    } else if (dateMode === 'deadline') {
      formData.set('date', deadline);
      formData.delete('startDate');
      formData.delete('endDate');
    }
    // for 'range' startDate/endDate are already in the form

    // Pack extra meta for the action
    formData.set('linkType', linkType);
    formData.set('dateMode', dateMode);

    // We re-use createEvent but pass a single external link as a linkedExternalEvent
    formData.append(
      'linkedExternalEvents',
      JSON.stringify([{ title, url, startDate, endDate }]),
    );
    formData.set('linkedTests', JSON.stringify([]));
    formData.set('linkedActivities', JSON.stringify([]));

    try {
      await createEvent(formData);
      toast.success('Link published!', {
        description: 'Students will see this in their Activity Hub.',
      });
      // Reset
      setTitle('');
      setDesc('');
      setUrl('');
      setLinkType('event');
      setAudience('global');
      setDateMode('range');
      setStartDate('');
      setEndDate('');
      setSingleDate('');
      setDeadline('');
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error('Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className='admin-shell space-y-6'>
      <AdminPageHeader
        section='Engagement'
        title='Activity Management'
        subtitle='Post external links — tests, hackathons, activities, or events — directly to student Activity Hubs.'
        icon={Sparkles}
      />

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
        {/* ── FORM ─────────────────────────────────────────────────────── */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className='lg:col-span-3 space-y-5'
        >
          {/* ── Card: Link Details ─────────────────────────────────────── */}
          <div className='bg-white/95 backdrop-blur-sm rounded-[2.5rem] border border-purple-border/40 shadow-purple p-8 space-y-6'>
            <div className='flex items-center gap-3 pb-4 border-b border-purple-border/30'>
              <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                <Link2 className='w-5 h-5 text-purple-primary' />
              </div>
              <h2 className='font-heading font-black text-purple-foreground'>
                Link Details
              </h2>
            </div>

            {/* Type selector */}
            <div className='space-y-2'>
              <Label className='text-xs font-black text-purple-foreground uppercase tracking-widest flex items-center gap-2'>
                <Tag className='w-3.5 h-3.5 text-purple-primary' />
                Type <span className='text-red-500'>*</span>
              </Label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {(Object.keys(LINK_TYPE_CONFIG) as LinkType[]).map((t) => {
                  const cfg = LINK_TYPE_CONFIG[t];
                  const active = linkType === t;
                  return (
                    <button
                      key={t}
                      type='button'
                      onClick={() => setLinkType(t)}
                      className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-center transition-all duration-200
                        ${active ? 'border-purple-primary bg-purple-primary/[0.07] shadow-sm' : 'border-purple-border/25 bg-purple-secondary/20 hover:border-purple-primary/40'}`}
                    >
                      <span className='text-xl'>{cfg.icon}</span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-purple-primary' : 'text-purple-foreground'}`}
                      >
                        {cfg.label}
                      </span>
                      {active && (
                        <span className='absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-purple-primary' />
                      )}
                      <input
                        type='radio'
                        name='linkType'
                        value={t}
                        checked={active}
                        onChange={() => setLinkType(t)}
                        className='sr-only'
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className='space-y-2'>
              <Label
                htmlFor='title'
                className='text-xs font-black text-purple-foreground uppercase tracking-widest'
              >
                Title <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='title'
                name='title'
                placeholder='e.g. Regional Science Hackathon 2026'
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
                className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
              />
            </div>

            {/* External URL */}
            <div className='space-y-2'>
              <Label
                htmlFor='url'
                className='text-xs font-black text-purple-foreground uppercase tracking-widest flex items-center gap-2'
              >
                <ExternalLink className='w-3.5 h-3.5 text-purple-primary' />
                External Link / URL <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='url'
                name='url'
                type='url'
                placeholder='https://...'
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                required
                className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
              />
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <Label
                htmlFor='description'
                className='text-xs font-black text-purple-foreground uppercase tracking-widest'
              >
                Description{' '}
                <span className='font-medium text-purple-muted-foreground normal-case tracking-normal'>
                  (optional)
                </span>
              </Label>
              <textarea
                id='description'
                name='description'
                value={desc}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
                placeholder='Brief overview — what is it, who should apply, prizes, format, etc.'
                className='w-full min-h-[100px] rounded-2xl border border-purple-border/40 bg-purple-secondary/20 focus:bg-white px-4 py-3 text-sm font-medium
                  placeholder:text-purple-muted-foreground/70 outline-none focus:border-purple-primary transition-all resize-none font-sans'
              />
            </div>
          </div>

          {/* ── Card: Date / Deadline ──────────────────────────────────── */}
          <div className='bg-white/95 backdrop-blur-sm rounded-[2.5rem] border border-purple-border/40 shadow-purple p-8 space-y-5'>
            <div className='flex items-center gap-3 pb-4 border-b border-purple-border/30'>
              <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                <Calendar className='w-5 h-5 text-purple-primary' />
              </div>
              <h2 className='font-heading font-black text-purple-foreground'>
                Date / Deadline
              </h2>
            </div>

            {/* Date mode tabs */}
            <div className='flex gap-2 p-1.5 bg-purple-secondary/30 rounded-2xl'>
              {DATE_MODE_OPTIONS.map((opt) => {
                const active = dateMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => setDateMode(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-center transition-all duration-200
                      ${active ? 'bg-white shadow-sm text-purple-primary' : 'text-purple-muted-foreground hover:text-purple-foreground'}`}
                  >
                    <p
                      className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-purple-primary' : ''}`}
                    >
                      {opt.label}
                    </p>
                    <p className='text-[9px] font-bold text-purple-muted-foreground mt-0.5'>
                      {opt.sub}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Date inputs */}
            {dateMode === 'range' && (
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-[9px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                    Start Date
                  </Label>
                  <Input
                    type='date'
                    name='startDate'
                    value={startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                    className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-[9px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                    End Date
                  </Label>
                  <Input
                    type='date'
                    name='endDate'
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                    className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
                  />
                </div>
              </div>
            )}

            {dateMode === 'single' && (
              <div className='space-y-1.5'>
                <Label className='text-[9px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                  Date <span className='text-red-500'>*</span>
                </Label>
                <Input
                  type='date'
                  name='date'
                  value={singleDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSingleDate(e.target.value)}
                  required
                  className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
                />
              </div>
            )}

            {dateMode === 'deadline' && (
              <div className='space-y-1.5'>
                <Label className='text-[9px] font-black text-purple-muted-foreground uppercase tracking-widest flex items-center gap-1'>
                  <Clock className='w-2.5 h-2.5' /> Application Deadline{' '}
                  <span className='text-red-500'>*</span>
                </Label>
                <Input
                  type='date'
                  name='date'
                  value={deadline}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
                  required
                  className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
                />
              </div>
            )}
          </div>

          {/* ── Card: Audience ─────────────────────────────────────────── */}
          <div className='bg-white/95 backdrop-blur-sm rounded-[2.5rem] border border-purple-border/40 shadow-purple p-8 space-y-5'>
            <div className='flex items-center gap-3 pb-4 border-b border-purple-border/30'>
              <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                <Users className='w-5 h-5 text-purple-primary' />
              </div>
              <h2 className='font-heading font-black text-purple-foreground'>
                Target Audience
              </h2>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {audienceOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = audience === opt.value;
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => setAudience(opt.value)}
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-300
                      ${isActive ? 'border-purple-primary bg-purple-primary/[0.07] shadow-purple-sm' : 'border-purple-border/25 bg-purple-secondary/20 hover:border-purple-primary/40 hover:scale-[1.01]'}`}
                  >
                    {isActive && (
                      <div className='absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-primary flex items-center justify-center shadow-purple-xs'>
                        <svg
                          className='w-3 h-3 text-white'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200
                        ${isActive ? 'bg-purple-primary text-white' : opt.bg + ' ' + opt.color}`}
                    >
                      <Icon className='w-4 h-4' />
                    </div>
                    <p
                      className={`text-[13px] font-black ${isActive ? 'text-purple-primary' : 'text-purple-foreground'}`}
                    >
                      {opt.label}
                    </p>
                    <p className='text-[10px] text-purple-muted-foreground font-bold uppercase tracking-wider mt-0.5'>
                      {opt.sub}
                    </p>
                    <input
                      type='radio'
                      name='audienceType'
                      value={opt.value}
                      checked={isActive}
                      onChange={() => setAudience(opt.value)}
                      className='sr-only'
                    />
                  </button>
                );
              })}
            </div>

            {audience === 'cohort' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Select name='cohort'>
                  <SelectTrigger className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:border-purple-primary transition-all text-sm font-semibold'>
                    <SelectValue placeholder='Select target cohort / stream' />
                  </SelectTrigger>
                  <SelectContent className='rounded-2xl shadow-purple-lg border-purple-border/40'>
                    <SelectItem value='class12'>
                      Class 12 (All Streams)
                    </SelectItem>
                    <SelectItem value='class12pcm'>Class 12 (PCM)</SelectItem>
                    <SelectItem value='class11'>
                      Class 11 (All Streams)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </div>

          {/* ── Submit ─────────────────────────────────────────────────── */}
          <Button
            type='submit'
            disabled={isPublishing || !title || !url}
            className='w-full h-14 rounded-3xl bg-purple-gradient text-white font-heading font-black text-base shadow-purple-lg hover:shadow-purple-xl transition-all duration-300 disabled:opacity-60 border-none group btn-shimmer'
          >
            <span className='flex items-center justify-center gap-3'>
              {isPublishing ? (
                <>
                  <svg
                    className='animate-spin w-5 h-5'
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                    />
                  </svg>
                  Publishing…
                </>
              ) : (
                <>
                  <Send className='w-5 h-5' /> Publish Link to Students
                </>
              )}
            </span>
          </Button>
        </motion.form>

        {/* ── LIVE PREVIEW ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className='lg:col-span-2'
        >
          <div className='bg-white/95 backdrop-blur-sm rounded-[2.5rem] border border-purple-border/40 shadow-purple p-8 sticky top-28'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-purple-border/30'>
              <Eye className='w-5 h-5 text-purple-muted-foreground' />
              <p className='text-sm font-black text-purple-foreground uppercase tracking-widest'>
                Student View Preview
              </p>
            </div>

            {/* Preview card */}
            <div className='rounded-[2rem] border border-purple-border/30 overflow-hidden shadow-sm bg-purple-secondary/30'>
              {/* Header */}
              <div className='bg-purple-gradient p-6'>
                <div className='flex items-center gap-2 mb-3 flex-wrap'>
                  <div className='px-2 py-0.5 rounded bg-white/20 text-[10px] font-black text-white uppercase tracking-widest'>
                    {typeConfig.icon} {typeConfig.label}
                  </div>
                </div>
                <p className='text-white font-heading font-black text-xl leading-tight'>
                  {title || 'Event Title'}
                </p>
                {getDisplayDate() && (
                  <p className='text-white/80 text-[11px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5'>
                    <Calendar className='w-3 h-3' />
                    {getDisplayDate()}
                  </p>
                )}
              </div>

              {/* Body */}
              <div className='p-6 space-y-4'>
                <p className='text-[13px] text-purple-foreground/80 font-medium leading-relaxed italic'>
                  &ldquo;
                  {desc ||
                    'Description will be shown here for students to read before visiting the link.'}
                  &rdquo;
                </p>

                {url && (
                  <div className='flex items-center gap-2 p-3 rounded-2xl bg-purple-primary/5 border border-purple-primary/15'>
                    <ExternalLink className='w-4 h-4 text-purple-primary shrink-0' />
                    <span className='text-[11px] text-purple-primary font-bold truncate'>
                      {url}
                    </span>
                  </div>
                )}

                <div className='flex items-center gap-3 pt-2'>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAudience.bg}`}
                  >
                    <AudienceIcon
                      className={`w-3.5 h-3.5 ${selectedAudience.color}`}
                    />
                  </div>
                  <span className='text-[11px] font-bold text-purple-muted-foreground uppercase tracking-widest'>
                    Visibility:{' '}
                    <span className='text-purple-primary'>
                      {selectedAudience.label}
                    </span>
                  </span>
                </div>

                {/* CTA skeleton */}
                <div className='flex gap-3 pt-4'>
                  <div className='flex-1 h-10 rounded-xl bg-purple-primary/80 flex items-center justify-center'>
                    <span className='text-[10px] text-white font-black uppercase tracking-widest'>
                      Visit Link
                    </span>
                  </div>
                  <div className='flex-1 h-10 rounded-xl bg-white border border-purple-border/40' />
                </div>
              </div>
            </div>

            <div className='mt-6 flex items-start gap-3 p-4 rounded-2xl bg-purple-secondary/40 border border-purple-border/30'>
              <Sparkles className='w-4 h-4 text-purple-primary shrink-0 mt-0.5' />
              <p className='text-[11px] text-purple-muted-foreground/80 font-bold leading-relaxed'>
                This preview reflects how students will see this link in their
                Activity Hub.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
