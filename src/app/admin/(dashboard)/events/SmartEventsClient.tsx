'use client';

import { useState, useEffect } from 'react';
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
  Users,
  Globe,
  GraduationCap,
  Send,
  Eye,
  Sparkles,
  ExternalLink,
  Calendar,
  Tag,
  Link2,
  Clock,
  Edit,
  Trash2,
  ExternalLink as LinkIcon,
  ChevronRight,
  School as SchoolIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from '@/lib/actions/admin.actions';
import { COHORT_OPTIONS } from '@/lib/constants/cohorts';

// ─── Types ───────────────────────────────────────────────────────────────────

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
    color: 'text-purple-primary',
    bg: 'bg-purple-secondary/15',
    border: 'border-purple-border/30',
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
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

interface EventItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  date?: string;
  targetAudience: string[];
}

export default function SmartEventsClient({
  initialEvents,
  schools,
}: {
  initialEvents: EventItem[];
  schools: { _id: string; name: string }[];
}) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('event');
  const [audience, setAudience] = useState('global');
  const [cohort, setCohort] = useState('');
  const [deadline, setDeadline] = useState('');

  // ── Derived
  const selectedAudience = audienceOptions.find((a) => a.value === audience)!;
  const AudienceIcon = selectedAudience.icon;
  const typeConfig = LINK_TYPE_CONFIG[linkType];

  const getDisplayDate = () => {
    if (deadline) return `Deadline: ${fmt(deadline)}`;
    return null;
  };

  const handleEdit = (event: EventItem) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDesc(event.description || '');
    setUrl(event.url || '');
    setDeadline(event.date ? event.date.split('T')[0] : '');

    if (event.targetAudience[0] === 'all') {
      setAudience('global');
      setCohort('');
    } else {
      setAudience('cohort');
      setCohort(event.targetAudience[0]);
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setUrl('');
    setLinkType('event');
    setAudience('global');
    setCohort('');
    setDeadline('');
  };

  const refreshEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?'))
      return;

    try {
      await deleteEvent(id);
      toast.success('Activity deleted');
      refreshEvents();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPublishing(true);

    const formData = new FormData();
    formData.set('title', title);
    formData.set('description', desc);
    formData.set('url', url);
    formData.set('date', deadline);
    formData.set('audienceType', audience);
    formData.set('cohort', cohort);
    formData.set('linkType', linkType);

    // Default empty arrays for legacy event structure compatibility
    formData.set('linkedTests', JSON.stringify([]));
    formData.set('linkedActivities', JSON.stringify([]));
    formData.set(
      'linkedExternalEvents',
      JSON.stringify([{ title, url, startDate: '', endDate: '' }]),
    );

    try {
      if (editingId) {
        await updateEvent(editingId, formData);
        toast.success('Activity updated!');
        setEditingId(null);
      } else {
        await createEvent(formData);
        toast.success('Link published!');
      }

      resetForm();
      refreshEvents();
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className='admin-shell space-y-10 pb-20'>
      <AdminPageHeader
        section='Engagement'
        title='Activity Management'
        subtitle='Post external links — tests, hackathons, activities, or events — directly to student Activity Hubs.'
        icon={Sparkles}
      />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* ── FORM ─────────────────────────────────────────────────────── */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className='lg:col-span-3 space-y-5'
        >
          {/* ── UNIFIED PREMIUM FORM CARD ─────────────────────────────────────── */}
          <div className='bg-white/95 backdrop-blur-sm rounded-[3rem] border border-purple-border/40 shadow-purple-lg p-10 space-y-10'>
            {/* Section 1: Link Details */}
            <div className='space-y-6'>
              <div className='flex items-center gap-3 pb-4 border-b border-purple-border/30'>
                <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                  <Link2 className='w-5 h-5 text-purple-primary' />
                </div>
                <div>
                  <h2 className='font-heading font-black text-purple-foreground leading-none'>
                    {editingId ? 'Edit Activity' : 'Link Configuration'}
                  </h2>
                  <p className='text-[10px] text-purple-muted-foreground font-bold uppercase tracking-wider mt-1.5'>
                    {editingId
                      ? `Modifying: ${editingId}`
                      : 'Define the external resource for students'}
                  </p>
                </div>
              </div>

              {/* Type selector */}
              {!editingId && (
                <div className='space-y-3'>
                  <Label className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em] flex items-center gap-2 ml-1'>
                    <Tag className='w-3.5 h-3.5 text-purple-primary' />
                    Resource Type <span className='text-red-500'>*</span>
                  </Label>
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
                    {(Object.keys(LINK_TYPE_CONFIG) as LinkType[]).map((t) => {
                      const cfg = LINK_TYPE_CONFIG[t];
                      const active = linkType === t;
                      return (
                        <button
                          key={t}
                          type='button'
                          onClick={() => setLinkType(t)}
                          className={`relative flex flex-col items-center gap-2 py-4 px-2 rounded-[20px] border-2 text-center transition-all duration-300
                            ${active ? 'border-purple-primary bg-purple-primary/[0.07] shadow-purple-sm scale-[1.02]' : 'border-purple-border/25 bg-purple-secondary/20 hover:border-purple-primary/30'}`}
                        >
                          <span className='text-2xl'>{cfg.icon}</span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-purple-primary' : 'text-purple-foreground/70'}`}
                          >
                            {cfg.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                {/* Title */}
                <div className='space-y-2.5'>
                  <Label
                    htmlFor='title'
                    className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em] ml-1'
                  >
                    Display Title <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='title'
                    name='title'
                    placeholder='e.g. National Science Olympiad 2026, JEE Advanced Test, Coding Competition'
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTitle(e.target.value)
                    }
                    required
                    className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold placeholder:text-purple-muted-foreground/35'
                  />
                </div>

                {/* External URL */}
                <div className='space-y-2.5'>
                  <Label
                    htmlFor='url'
                    className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em] flex items-center gap-2 ml-1'
                  >
                    Resource URL <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='url'
                    name='url'
                    type='url'
                    placeholder='https://example.com/registration or https://forms.gle/competition'
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUrl(e.target.value)
                    }
                    required
                    className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold placeholder:text-purple-muted-foreground/35'
                  />
                </div>
              </div>

              {/* Description */}
              <div className='space-y-2.5'>
                <Label
                  htmlFor='description'
                  className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em] ml-1'
                >
                  Brief Description{' '}
                  <span className='font-medium text-purple-muted-foreground normal-case tracking-normal'>
                    (optional)
                  </span>
                </Label>
                <textarea
                  id='description'
                  name='description'
                  value={desc}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDesc(e.target.value)
                  }
                  placeholder='Provide important details: registration requirements, preparation tips, eligibility criteria, or any special instructions for students'
                  className='w-full min-h-[80px] rounded-2xl border border-purple-border/40 bg-purple-secondary/20 focus:bg-white px-4 py-3 text-sm font-medium
                    placeholder:text-purple-muted-foreground/35 outline-none focus:border-purple-primary transition-all resize-none font-sans'
                />
              </div>
            </div>

            {/* Section 2: Deadline & Audience */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4 border-t border-purple-border/30'>
              {/* Deadline */}
              <div className='space-y-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-purple-primary/10 flex items-center justify-center'>
                    <Clock className='w-4.5 h-4.5 text-purple-primary' />
                  </div>
                  <h3 className='font-heading font-black text-purple-foreground text-sm uppercase tracking-wider'>
                    Timeline
                  </h3>
                </div>

                <div className='space-y-2.5'>
                  <Label className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em] flex items-center gap-2 ml-1'>
                    <Calendar className='w-3.5 h-3.5 text-purple-primary' />
                    Submission Deadline <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    type='date'
                    name='date'
                    value={deadline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDeadline(e.target.value)
                    }
                    required
                    className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold placeholder:text-purple-muted-foreground/35'
                  />
                </div>
              </div>

              {/* Audience */}
              <div className='space-y-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-purple-primary/10 flex items-center justify-center'>
                    <Users className='w-4.5 h-4.5 text-purple-primary' />
                  </div>
                  <h3 className='font-heading font-black text-purple-foreground text-sm uppercase tracking-wider'>
                    Target Audience
                  </h3>
                </div>

                <div className='space-y-3'>
                  <div className='flex gap-2 p-1.5 bg-purple-secondary/30 rounded-[1.25rem]'>
                    {audienceOptions.map((opt) => {
                      const isActive = audience === opt.value;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={() => setAudience(opt.value)}
                          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 min-w-[160px]
                            ${isActive ? 'bg-white shadow-purple-sm text-purple-primary scale-[1.02]' : 'text-purple-muted-foreground hover:text-purple-foreground'}`}
                        >
                          <Icon
                            className={`w-4 h-4 ${isActive ? 'text-purple-primary' : 'text-purple-muted-foreground'} shrink-0`}
                          />
                          <span
                            className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-purple-primary' : ''} text-center`}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {audience === 'cohort' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='pt-1'
                    >
                      <Select
                        value={cohort}
                        onValueChange={(v) => setCohort(v || '')}
                      >
                        <SelectTrigger className='h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/20 focus:border-purple-primary transition-all text-sm font-semibold'>
                          <SelectValue placeholder='Select target cohort' />
                        </SelectTrigger>
                        <SelectContent className='rounded-2xl shadow-purple-lg border-purple-border/40'>
                          {COHORT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <div className='pt-6 flex gap-4'>
              {editingId && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCancelEdit}
                  className='flex-1 h-16 rounded-[2rem] border-purple-border/40 text-purple-foreground font-heading font-black text-lg'
                >
                  Cancel
                </Button>
              )}
              <Button
                type='submit'
                disabled={
                  isPublishing ||
                  !title ||
                  !url ||
                  !deadline ||
                  (audience === 'cohort' && !cohort)
                }
                className='flex-2 h-16 rounded-[2rem] bg-purple-gradient text-white font-heading font-black text-lg shadow-purple-lg hover:shadow-purple-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 border-none group btn-shimmer'
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
                      Saving…
                    </>
                  ) : (
                    <>
                      <Send className='w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' />
                      {editingId
                        ? 'Update Activity'
                        : 'Publish to Student Activity Hubs'}
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </motion.form>

        {/* ── MANAGEMENT TABLE ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='lg:col-span-3 bg-white/95 backdrop-blur-sm rounded-[2.5rem] border border-purple-border/40 shadow-purple-lg p-10'
        >
          <div className='flex items-center justify-between mb-8 pb-4 border-b border-purple-border/30'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                <Sparkles className='w-5 h-5 text-purple-primary' />
              </div>
              <div>
                <h2 className='font-heading font-black text-purple-foreground leading-none'>
                  Manage Posted Activities
                </h2>
                <p className='text-[10px] text-purple-muted-foreground font-bold uppercase tracking-wider mt-1.5'>
                  Total {events.length} activities published
                </p>
              </div>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='text-left border-b border-purple-border/20'>
                  <th className='pb-4 text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest px-4 min-w-[200px]'>
                    Activity
                  </th>
                  <th className='pb-4 text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest px-4 min-w-[120px]'>
                    Audience
                  </th>
                  <th className='pb-4 text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest px-4 min-w-[100px]'>
                    Deadline
                  </th>
                  <th className='pb-4 text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest px-4 text-right min-w-[100px]'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-purple-border/10'>
                <AnimatePresence mode='popLayout'>
                  {events.map((event) => (
                    <motion.tr
                      key={event.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='group hover:bg-purple-secondary/20 transition-colors'
                    >
                      <td className='py-5 px-4 min-w-[200px]'>
                        <div className='flex items-center gap-3 min-w-0'>
                          <div className='w-10 h-10 rounded-xl bg-purple-primary/5 flex items-center justify-center group-hover:bg-white transition-colors shrink-0'>
                            <LinkIcon className='w-4 h-4 text-purple-primary/40' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='font-bold text-purple-foreground text-sm leading-tight wrap-break-word'>
                              {event.title}
                            </p>
                            <p className='text-[10px] text-purple-muted-foreground font-medium truncate mt-1'>
                              {event.url}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='py-5 px-4 min-w-[120px]'>
                        <div className='flex items-center gap-2 min-w-0'>
                          {event.targetAudience?.[0] === 'all' ? (
                            <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-primary/10 text-[9px] font-black text-purple-primary uppercase tracking-widest'>
                              <Globe className='w-3 h-3 shrink-0' /> Global
                            </div>
                          ) : (
                            <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-[9px] font-black text-indigo-600 uppercase tracking-widest'>
                              <GraduationCap className='w-3 h-3 shrink-0' />{' '}
                              <span className='truncate'>
                                {event.targetAudience?.[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='py-5 px-4'>
                        <div className='flex items-center gap-2 text-purple-muted-foreground'>
                          <Clock className='w-3.5 h-3.5' />
                          <span className='text-[11px] font-bold uppercase tracking-wider'>
                            {event.date ? fmt(event.date) : 'No date'}
                          </span>
                        </div>
                      </td>
                      <td className='py-5 px-4 text-right min-w-[100px]'>
                        <div className='flex items-center justify-end gap-2 shrink-0'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEdit(event)}
                            className='w-9 h-9 rounded-xl hover:bg-purple-primary hover:text-white transition-all'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(event.id)}
                            className='w-9 h-9 rounded-xl hover:bg-rose-500 hover:text-white transition-all text-rose-500'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {events.length === 0 && (
                  <tr>
                    <td colSpan={4} className='py-20 text-center'>
                      <div className='flex flex-col items-center gap-3'>
                        <div className='w-16 h-16 rounded-3xl bg-purple-secondary/40 flex items-center justify-center'>
                          <Clock className='w-8 h-8 text-purple-muted-foreground/30' />
                        </div>
                        <p className='text-sm font-bold text-purple-muted-foreground uppercase tracking-widest'>
                          No activities published yet
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
