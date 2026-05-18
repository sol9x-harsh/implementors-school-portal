'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  UploadCloud,
  Calendar,
  ClipboardList,
  GraduationCap,
  School,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createAcademicTest } from '@/lib/actions/test.actions';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SCHOOL_COHORTS, ACADEMIC_STREAMS } from '@/lib/constants/cohorts';

const ITEMS_PER_PAGE = 12;

interface AcademicTest {
  _id: string;
  name: string;
  date: string;
  targetClass?: string;
  targetStream?: string;
  marksUploaded?: boolean;
}
interface TestManagementClientProps {
  initialTests: AcademicTest[];
  schools: { _id: string; name: string }[];
}

export default function TestManagementClient({
  initialTests,
  schools,
}: TestManagementClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadTestId, setUploadTestId] = useState<string | null>(null);
  const [marksFile, setMarksFile] = useState<File | null>(null);
  // Track locally uploaded tests so UI reflects state immediately
  const [uploadedIds, setUploadedIds] = useState<Set<string>>(
    new Set(initialTests.filter((t) => t.marksUploaded).map((t) => t._id)),
  );

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const filteredTests = useMemo(() => {
    if (!searchQuery.trim()) return initialTests;
    return initialTests.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [initialTests, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTests.length / ITEMS_PER_PAGE),
  );
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const uploadTest = initialTests.find((t) => t._id === uploadTestId);

  const handleSearchChange = (v: string) => {
    setSearchQuery(v);
    setCurrentPage(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createAcademicTest(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success('Test created successfully.');
      setIsModalOpen(false);
    } else {
      toast.error(result.error || 'Failed to create test.');
    }
  };

  const isDatePast = (dateStr: string) => new Date(dateStr) < new Date();

  // Uploaded / Pending counts for summary strip
  const uploadedCount = uploadedIds.size;
  const pendingCount = initialTests.length - uploadedCount;

  return (
    <div className='admin-shell space-y-5'>
      {/* Header */}
      <AdminPageHeader
        section='Academics'
        title='Test Management'
        subtitle='Create and manage dynamic exams, internal tests, and performance grading.'
        icon={ClipboardList}
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            className='h-8 px-3.5 rounded-lg bg-purple-primary hover:bg-purple-primary/90 text-white text-[11px] font-bold gap-1.5 btn-shimmer shadow-purple-sm'
          >
            <Plus className='w-3.5 h-3.5' /> Create Test
          </Button>
        }
      />

      {/* Verification Summary Strip */}
      {initialTests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className='grid grid-cols-2 gap-3'
        >
          <div className='flex items-center gap-3 bg-white border border-purple-border/30 rounded-xl px-4 py-3 shadow-sm'>
            <div className='w-8 h-8 rounded-lg bg-purple-primary/10 flex items-center justify-center shrink-0'>
              <CheckCircle2 className='w-4 h-4 text-purple-primary' />
            </div>
            <div>
              <p className='text-[10px] font-black text-purple-secondary-foreground uppercase tracking-widest'>
                Marks Uploaded
              </p>
              <p className='text-xl font-heading font-black text-purple-primary leading-tight'>
                {uploadedCount}
              </p>
            </div>
            <span className='ml-auto text-[10px] font-bold text-purple-primary/60 bg-purple-secondary/15 border border-purple-border/20 px-2 py-0.5 rounded-full'>
              {initialTests.length > 0
                ? Math.round((uploadedCount / initialTests.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div className='flex items-center gap-3 bg-white border border-amber-200 rounded-xl px-4 py-3 shadow-sm'>
            <div className='w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0'>
              <Clock3 className='w-4 h-4 text-amber-600' />
            </div>
            <div>
              <p className='text-[10px] font-black text-amber-700 uppercase tracking-widest'>
                Marks Pending
              </p>
              <p className='text-xl font-heading font-black text-amber-600 leading-tight'>
                {pendingCount}
              </p>
            </div>
            <span className='ml-auto text-[10px] font-bold text-amber-600/60 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full'>
              {initialTests.length > 0
                ? Math.round((pendingCount / initialTests.length) * 100)
                : 0}
              %
            </span>
          </div>
        </motion.div>
      )}

      {/* Filter Bar */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearch={handleSearchChange}
        searchPlaceholder='Search tests by name...'
        resultCount={filteredTests.length}
        totalCount={initialTests.length}
      />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className='admin-card overflow-hidden'
      >
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent border-b border-purple-border/30 bg-[oklch(0.975_0.006_285)]'>
              {[
                '#',
                'Test Identity',
                'Exam Date',
                'Target Cohort',
                'Marks Status',
                'Actions',
              ].map((h) => (
                <TableHead
                  key={h}
                  className={`h-10 px-5 font-black uppercase tracking-widest text-[10px] text-purple-muted-foreground/60 ${h === 'Actions' ? 'w-28 text-right' : ''} ${h === 'Marks Status' ? 'w-36' : ''}`}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTests.length > 0 ? (
              paginatedTests.map((test, idx) => {
                const absIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                const past = isDatePast(test.date);
                const d = new Date(test.date);
                const isUploaded = uploadedIds.has(test._id);
                return (
                  <TableRow
                    key={test._id}
                    className={`border-b border-purple-border/15 group ${idx % 2 === 1 ? 'bg-[oklch(0.975_0.006_285)]/50' : 'bg-white'}`}
                  >
                    {/* Index */}
                    <TableCell className='py-3 px-5 w-12'>
                      <span className='text-[11px] font-black text-purple-muted-foreground/35 tabular-nums'>
                        {String(absIdx).padStart(2, '0')}
                      </span>
                    </TableCell>
                    {/* Name */}
                    <TableCell className='py-3 px-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-lg bg-purple-primary/10 border border-purple-primary/15 flex items-center justify-center shrink-0'>
                          <ClipboardList className='w-3.5 h-3.5 text-purple-primary' />
                        </div>
                        <span className='text-[13px] font-semibold text-purple-foreground'>
                          {test.name}
                        </span>
                      </div>
                    </TableCell>
                    {/* Date */}
                    <TableCell className='py-3 px-5'>
                      <div
                        className={`flex items-center gap-2 text-[12px] font-medium ${past ? 'text-rose-500' : 'text-purple-primary'}`}
                      >
                        <Calendar className='w-3 h-3 shrink-0' />
                        {isMounted && !isNaN(d.getTime())
                          ? d.toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                        <span
                          className={`admin-badge ${past ? 'admin-badge-pending' : 'admin-badge-new'}`}
                        >
                          {past ? 'Past' : 'Upcoming'}
                        </span>
                      </div>
                    </TableCell>
                    {/* Cohort */}
                    <TableCell className='py-3 px-5'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        {test.targetClass && (
                          <span className='admin-badge admin-badge-school'>
                            <School className='w-2.5 h-2.5' />
                            {test.targetClass}
                          </span>
                        )}
                        {test.targetStream && (
                          <span className='admin-badge admin-badge-stream'>
                            <GraduationCap className='w-2.5 h-2.5' />
                            {test.targetStream}
                          </span>
                        )}
                        {!test.targetClass && !test.targetStream && (
                          <span className='text-[11px] text-purple-muted-foreground/40 font-medium italic'>
                            Global
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {/* Marks Status (Verification) */}
                    <TableCell className='py-3 px-5'>
                      {isUploaded ? (
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-primary/10 border border-purple-primary/25 text-[10px] font-black text-purple-primary uppercase tracking-wide'>
                          <CheckCircle2 className='w-3 h-3' /> Uploaded
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-300/50 text-[10px] font-black text-amber-700 uppercase tracking-wide'>
                          <Clock3 className='w-3 h-3' /> Pending
                        </span>
                      )}
                    </TableCell>
                    {/* Actions */}
                    <TableCell className='py-3 px-5 text-right'>
                      <button
                        onClick={() => setUploadTestId(test._id)}
                        title='Upload Marks CSV'
                        className='inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[11px] font-bold transition-all duration-150 shadow-sm
                          bg-purple-primary border-purple-primary text-white hover:bg-purple-primary/90 hover:shadow-purple-sm'
                      >
                        <UploadCloud className='w-3.5 h-3.5' />
                        Upload
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className='h-[260px] text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-12 h-12 rounded-2xl bg-purple-secondary/50 flex items-center justify-center'>
                      <ClipboardList className='w-5 h-5 text-purple-muted-foreground/35' />
                    </div>
                    <p className='text-[11px] font-bold uppercase tracking-widest text-purple-muted-foreground/45'>
                      {searchQuery
                        ? 'No tests match your search'
                        : 'No academic tests defined yet'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setIsModalOpen(true)}
                        className='mt-1 h-8 px-4 rounded-lg bg-purple-primary text-white text-[11px] font-bold gap-1.5'
                      >
                        <Plus className='w-3.5 h-3.5' /> Create First Test
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between px-5 py-3 border-t border-purple-border/25 bg-[oklch(0.975_0.006_285)]/60'>
            <p className='text-[11px] font-medium text-purple-muted-foreground/60 tabular-nums'>
              Page {currentPage} of {totalPages} · {filteredTests.length} tests
            </p>
            <div className='flex items-center gap-1.5'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className='rounded-lg border-purple-border/40 h-7 w-7 p-0 shadow-none'
              >
                <ChevronLeft className='w-3.5 h-3.5' />
              </Button>
              <span className='text-[12px] font-bold text-purple-foreground tabular-nums px-2'>
                {currentPage}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className='rounded-lg border-purple-border/40 h-7 w-7 p-0 shadow-none'
              >
                <ChevronRight className='w-3.5 h-3.5' />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Create Test Dialog ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-md rounded-2xl border-purple-border/30 shadow-purple-lg'>
          <div className='dialog-accent-strip' />
          <DialogHeader>
            <DialogTitle className='text-lg font-heading font-black text-purple-foreground flex items-center gap-2'>
              <ClipboardList className='w-4.5 h-4.5 text-purple-primary' />{' '}
              Define Academic Test
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-5 py-2'>
            <div className='space-y-1.5'>
              <Label
                htmlFor='name'
                className='text-[10px] font-black uppercase tracking-widest text-purple-muted-foreground'
              >
                Test Name
              </Label>
              <Input
                id='name'
                name='name'
                placeholder='e.g. Unit Test 1'
                required
                className='h-10 rounded-lg border-purple-border/30 bg-purple-secondary/15 focus:bg-white focus:border-purple-primary focus-visible:ring-purple-primary/20 font-medium'
              />
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='date'
                className='text-[10px] font-black uppercase tracking-widest text-purple-muted-foreground'
              >
                Exam Date
              </Label>
              <Input
                id='date'
                name='date'
                type='date'
                required
                className='h-10 rounded-lg border-purple-border/30 bg-purple-secondary/15 focus:bg-white focus:border-purple-primary focus-visible:ring-purple-primary/20 font-medium'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-[10px] font-black uppercase tracking-widest text-purple-muted-foreground'>
                Target Institution
              </Label>
              <Select name='targetSchool' defaultValue='SOL9X School'>
                <SelectTrigger className='h-10 rounded-lg border-purple-border/30 bg-purple-secondary/15 font-medium'>
                  <SelectValue placeholder='SOL9X School' />
                </SelectTrigger>
                <SelectContent className='rounded-xl border-purple-border/30 shadow-purple-lg'>
                  {schools.map((s) => (
                    <SelectItem key={s._id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-[10px] font-black uppercase tracking-widest text-purple-muted-foreground'>
                  Target Class
                </Label>
                <Select name='targetClass'>
                  <SelectTrigger className='h-10 rounded-lg border-purple-border/30 bg-purple-secondary/15 font-medium'>
                    <SelectValue placeholder='All Classes' />
                  </SelectTrigger>
                  <SelectContent className='rounded-xl border-purple-border/30 shadow-purple-lg'>
                    <SelectItem value=''>All Classes</SelectItem>
                    {SCHOOL_COHORTS.map((c) => (
                      <SelectItem key={c.id} value={c.label}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-[10px] font-black uppercase tracking-widest text-purple-muted-foreground'>
                  Target Stream
                </Label>
                <Select name='targetStream'>
                  <SelectTrigger className='h-10 rounded-lg border-purple-border/30 bg-purple-secondary/15 font-medium'>
                    <SelectValue placeholder='All Streams' />
                  </SelectTrigger>
                  <SelectContent className='rounded-xl border-purple-border/30 shadow-purple-lg'>
                    <SelectItem value=''>All Streams</SelectItem>
                    {ACADEMIC_STREAMS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className='pt-1'>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full h-10 rounded-lg bg-purple-primary text-white font-black uppercase tracking-widest btn-shimmer shadow-purple-sm'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin mr-2 inline' />
                    Creating...
                  </>
                ) : (
                  'Launch Test Entry'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Upload Marks Dialog ── */}
      <Dialog
        open={!!uploadTestId}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setUploadTestId(null);
            setMarksFile(null);
          }
        }}
      >
        <DialogContent className='sm:max-w-md rounded-2xl border-purple-border/30 shadow-purple-lg'>
          <div className='dialog-accent-strip' />
          <DialogHeader>
            <DialogTitle className='text-lg font-heading font-black text-purple-foreground flex items-center gap-2'>
              <FileSpreadsheet className='w-4.5 h-4.5 text-purple-primary' />{' '}
              Upload Marks
            </DialogTitle>
            <DialogDescription className='text-purple-muted-foreground font-medium text-sm'>
              {uploadTest?.name} — Upload a CSV with student scores.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='rounded-xl bg-purple-secondary/30 border border-purple-border/25 p-4'>
              <p className='text-[10px] font-black text-purple-primary uppercase tracking-widest mb-1.5'>
                Required CSV Columns
              </p>
              <code className='text-[11px] font-mono text-purple-foreground/80'>
                studentEmail, score, maxScore, remarks
              </code>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setMarksFile(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${marksFile ? 'border-purple-primary bg-purple-primary/8' : 'border-purple-border/40 hover:border-purple-primary/60 hover:bg-purple-secondary/20'}`}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept='.csv'
                className='hidden'
                onChange={(e) => setMarksFile(e.target.files?.[0] ?? null)}
              />
              {marksFile ? (
                <div className='flex flex-col items-center gap-2'>
                  <FileSpreadsheet className='w-7 h-7 text-purple-primary' />
                  <p className='text-sm font-bold text-purple-foreground'>
                    {marksFile.name}
                  </p>
                  <p className='text-[11px] text-purple-muted-foreground'>
                    {(marksFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setMarksFile(null);
                    }}
                    className='text-rose-400 hover:text-rose-600'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2 opacity-60'>
                  <UploadCloud className='w-7 h-7 text-purple-primary' />
                  <p className='text-sm font-bold text-purple-foreground'>
                    Click to select CSV
                  </p>
                  <p className='text-[11px] text-purple-muted-foreground'>
                    or drag and drop here
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setUploadTestId(null);
                setMarksFile(null);
              }}
              className='rounded-lg border-purple-border/40 font-bold text-[12px]'
            >
              Cancel
            </Button>
            <Button
              disabled={!marksFile}
              onClick={() => {
                if (uploadTestId) {
                  setUploadedIds((prev) => new Set([...prev, uploadTestId]));
                }
                toast.success('Marks CSV queued for processing.', {
                  description: 'Scores will be visible to students shortly.',
                });
                setUploadTestId(null);
                setMarksFile(null);
              }}
              className='rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest gap-2 btn-shimmer'
            >
              <UploadCloud className='w-4 h-4' /> Process Marks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
