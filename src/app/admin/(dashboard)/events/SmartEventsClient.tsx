'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Sparkles,
  Calendar,
  Tag,
  Link2,
  Clock,
  Edit,
  Trash2,
  X,
  ExternalLink as LinkIcon,
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
  const formRef = useRef<HTMLFormElement>(null);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) => e.title.toLowerCase().includes(q) || e.url?.toLowerCase().includes(q),
    );
  }, [events, searchQuery]);

  const getDisplayDate = () => {
    if (deadline) return `Deadline: ${fmt(deadline)}`;
    return null;
  };

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setEditingId(null);
      resetForm();
    }, 300);
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
    setDrawerOpen(true);
  };

  const handleCancelEdit = () => {
    closeDrawer();
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

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
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
    <div className='admin-shell space-y-5 pb-20'>
      <AdminPageHeader
        section='Engagement'
        title='Activities &amp; Events'
        subtitle='Publish external links — assessments, hackathons, activities, and events — directly to student Activity Hubs.'
        icon={Sparkles}
        actions={
          <Button
            onClick={openDrawer}
            className='h-8 px-3.5 rounded-lg admin-button admin-button-primary text-[11px] font-bold gap-1.5 btn-shimmer'
          >
            <Send className='w-3.5 h-3.5' />
            New Activity
          </Button>
        }
      />

      {/* Filter Bar */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        searchPlaceholder='Search by title or URL...'
        resultCount={filteredEvents.length}
        totalCount={events.length}
      />

      {/* ── MANAGEMENT TABLE ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className='admin-card overflow-hidden'
      >

        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent border-b border-purple-border/40 bg-purple-secondary/25'>
              <TableHead className='h-11 px-5 text-[10px] font-black uppercase tracking-[0.13em] text-purple-muted-foreground/55 text-left'>
                Activity
              </TableHead>
              <TableHead className='h-11 px-5 text-[10px] font-black uppercase tracking-[0.13em] text-purple-muted-foreground/55 text-left'>
                Audience
              </TableHead>
              <TableHead className='h-11 px-5 text-[10px] font-black uppercase tracking-[0.13em] text-purple-muted-foreground/55 text-left'>
                Deadline
              </TableHead>
              <TableHead className='h-11 px-5 text-[10px] font-black uppercase tracking-[0.13em] text-purple-muted-foreground/55 text-right'>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode='popLayout'>
              {filteredEvents.map((event, idx) => (
                <motion.tr
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`border-b border-purple-border/15 hover:bg-purple-secondary/25 transition-colors duration-150 group ${idx % 2 === 1 ? 'bg-purple-background/45' : 'bg-white'}`}
                >
                  <TableCell className='py-3 px-5'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <div className='w-9 h-9 rounded-xl bg-purple-primary/8 flex items-center justify-center group-hover:bg-purple-primary/12 transition-colors shrink-0 border border-purple-border/20'>
                        <LinkIcon className='w-3.5 h-3.5 text-purple-primary/50' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='font-semibold text-purple-foreground text-[13px] leading-tight truncate'>
                          {event.title}
                        </p>
                        <p className='text-[11px] text-purple-muted-foreground/60 font-medium truncate mt-0.5'>
                          {event.url}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-3 px-5'>
                    {event.targetAudience?.[0] === 'all' ? (
                      <span className='admin-badge admin-badge-school'>
                        <Globe className='w-3 h-3 shrink-0' />
                        Global
                      </span>
                    ) : (
                      <span className='admin-badge admin-badge-stream'>
                        <GraduationCap className='w-3 h-3 shrink-0' />
                        <span className='truncate max-w-[80px]'>{event.targetAudience?.[0]}</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='py-3 px-5'>
                    <div className='flex items-center gap-1.5 text-purple-muted-foreground/75'>
                      <Clock className='w-3 h-3 shrink-0' />
                      <span className='text-[12px] font-medium'>
                        {event.date ? fmt(event.date) : '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='py-3 px-5 text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleEdit(event)}
                        className='w-8 h-8 rounded-lg hover:bg-purple-primary/10 hover:text-purple-primary transition-all'
                      >
                        <Edit className='w-3.5 h-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDelete(event.id)}
                        className='w-8 h-8 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all text-rose-400/60'
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredEvents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='h-[280px] text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-14 h-14 rounded-2xl bg-purple-secondary/50 flex items-center justify-center'>
                      <Sparkles className='w-6 h-6 text-purple-muted-foreground/35' />
                    </div>
                    <p className='text-[12px] font-bold uppercase tracking-widest text-purple-muted-foreground/45'>
                      {searchQuery ? 'No activities match your search' : 'No activities published yet'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={openDrawer}
                        className='mt-1 h-8 px-4 rounded-lg admin-button admin-button-primary text-[11px] font-bold gap-1.5'
                      >
                        <Send className='w-3 h-3' /> Post First Activity
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* ── SIDE DRAWER ─────────────────────────────────────────────── */}
      {/* Backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key='drawer-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-40 bg-black/25 backdrop-blur-sm'
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key='drawer-panel'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className='fixed top-0 right-0 z-50 h-screen w-full max-w-[480px] bg-white border-l border-purple-border/40 shadow-purple-xl flex flex-col'
          >
            {/* Drawer header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-purple-border/30 shrink-0'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-xl bg-purple-primary/10 flex items-center justify-center shrink-0'>
                  <Link2 className='w-4.5 h-4.5 text-purple-primary' />
                </div>
                <div>
                  <h2 className='font-heading font-black text-purple-foreground text-[15px] leading-none'>
                    {editingId ? 'Edit Activity' : 'New Activity'}
                  </h2>
                  <p className='text-[9px] text-purple-muted-foreground font-bold uppercase tracking-wider mt-1'>
                    {editingId ? 'Update link details' : 'Post a link to student feeds'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-purple-muted-foreground hover:bg-purple-secondary/40 transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Drawer form — scrollable */}
            <form ref={formRef} onSubmit={handleSubmit} className='flex-1 overflow-y-auto scrollbar-thin'>
              <div className='p-6 space-y-5'>

                {/* Type selector */}
                {!editingId && (
                  <div className='space-y-2'>
                    <Label className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em] flex items-center gap-1.5'>
                      <Tag className='w-3 h-3 text-purple-primary' />
                      Resource Type <span className='text-rose-500'>*</span>
                    </Label>
                    <div className='grid grid-cols-2 gap-2'>
                      {(Object.keys(LINK_TYPE_CONFIG) as LinkType[]).map((t) => {
                        const cfg = LINK_TYPE_CONFIG[t];
                        const active = linkType === t;
                        return (
                          <button
                            key={t}
                            type='button'
                            onClick={() => setLinkType(t)}
                            className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-all duration-200
                              ${active ? 'border-purple-primary/40 bg-purple-secondary/50 shadow-purple-xs' : 'border-purple-border/25 bg-purple-secondary/15 hover:border-purple-primary/30'}`}
                          >
                            <span className='text-lg leading-none'>{cfg.icon}</span>
                            <span className={`text-[11px] font-black uppercase tracking-wide ${active ? 'text-purple-primary' : 'text-purple-foreground/70'}`}>
                              {cfg.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em]'>
                    Display Title <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    placeholder='e.g. National Science Olympiad 2026'
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    required
                    className='h-10 rounded-xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
                  />
                </div>

                {/* URL */}
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em]'>
                    Resource URL <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    type='url'
                    placeholder='https://example.com/registration'
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                    required
                    className='h-10 rounded-xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
                  />
                </div>

                {/* Description */}
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em]'>
                    Description <span className='font-medium text-purple-muted-foreground normal-case tracking-normal'>(optional)</span>
                  </Label>
                  <textarea
                    value={desc}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
                    placeholder='Registration requirements, eligibility, preparation tips…'
                    rows={3}
                    className='w-full rounded-xl border border-purple-border/40 bg-purple-secondary/20 focus:bg-white px-3.5 py-2.5 text-sm font-medium
                      placeholder:text-purple-muted-foreground/35 outline-none focus:border-purple-primary transition-all resize-none font-sans'
                  />
                </div>

                {/* Deadline */}
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em] flex items-center gap-1.5'>
                    <Calendar className='w-3 h-3 text-purple-primary' />
                    Submission Deadline <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    type='date'
                    value={deadline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
                    required
                    className='h-10 rounded-xl border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-semibold'
                  />
                </div>

                {/* Audience */}
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.2em] flex items-center gap-1.5'>
                    <Users className='w-3 h-3 text-purple-primary' />
                    Target Audience <span className='text-rose-500'>*</span>
                  </Label>
                  <div className='flex gap-1.5 p-1 bg-purple-secondary/30 rounded-xl'>
                    {audienceOptions.map((opt) => {
                      const isActive = audience === opt.value;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={() => setAudience(opt.value)}
                          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 text-[11px] font-black uppercase tracking-wider
                            ${isActive ? 'bg-white shadow-purple-sm text-purple-primary' : 'text-purple-muted-foreground hover:text-purple-foreground'}`}
                        >
                          <Icon className='w-3 h-3 shrink-0' />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {audience === 'cohort' && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                      <Select value={cohort} onValueChange={(v) => setCohort(v || '')}>
                        <SelectTrigger className='h-10 w-full rounded-xl border-purple-border/40 bg-purple-secondary/20 focus:border-purple-primary transition-all text-sm font-semibold mt-1.5'>
                          <SelectValue placeholder='Select cohort' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl shadow-purple-lg border-purple-border/40'>
                          {COHORT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className='text-sm font-medium'>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>
              </div>
            </form>

            {/* Drawer footer — sticky */}
            <div className='px-6 py-4 border-t border-purple-border/30 flex gap-2.5 shrink-0'>
              <Button
                type='button'
                variant='outline'
                onClick={closeDrawer}
                className='h-10 px-5 rounded-xl border-purple-border/40 text-purple-muted-foreground font-bold text-[12px]'
              >
                Cancel
              </Button>
              <Button
                onClick={() => formRef.current?.requestSubmit()}
                disabled={isPublishing || !title || !url || !deadline || (audience === 'cohort' && !cohort)}
                className='flex-1 h-10 rounded-xl admin-button admin-button-primary font-bold text-[13px] btn-shimmer border-none disabled:opacity-60'
              >
                {isPublishing ? (
                  <span className='flex items-center gap-2'>
                    <svg className='animate-spin w-3.5 h-3.5' viewBox='0 0 24 24' fill='none'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                    </svg>
                    Saving…
                  </span>
                ) : (
                  <span className='flex items-center gap-2'>
                    <Send className='w-3.5 h-3.5' />
                    {editingId ? 'Update Activity' : 'Publish to Feeds'}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title='Delete activity?'
        description='This will permanently remove the activity from all student feeds. This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
