'use client';

import { useState, useEffect, useMemo, useRef, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { flexRender, useReactTable } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnDef,
} from '@tanstack/table-core';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  User, School, GraduationCap, Mail, Calendar, Users,
  UploadCloud, FileSpreadsheet, X, Plus, Download, KeyRound,
  ChevronRight, ArrowUpDown, MoreHorizontal, ChevronLeft, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createStudent, bulkCreateStudents } from '@/lib/actions/admin.actions';
import { Label } from '@/components/ui/label';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';

interface Student {
  id: string; name: string; email: string; mobileNo: string;
  institution?: string; studentType?: string; classLevel?: string;
  stream?: string; college?: string; course?: string; year?: string; createdAt: string;
}

interface StudentDirectoryClientProps { initialStudents: Student[] }

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1)
    .map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    })
    .filter((r) => Object.values(r).some((v) => v));
}

export default function StudentDirectoryClient({ initialStudents }: StudentDirectoryClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchParams.get('q') ?? '');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkProcessing, startBulkTransition] = useTransition();
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Keep filter in sync when URL param changes (from topbar search)
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setGlobalFilter(q);
  }, [searchParams]);

  const filteredStudents = useMemo(() => {
    let data = initialStudents;
    if (typeFilter !== 'ALL') data = data.filter((s) => s.studentType === typeFilter);
    if (streamFilter !== 'ALL') data = data.filter((s) => s.stream === streamFilter);
    return data;
  }, [initialStudents, typeFilter, streamFilter]);

  const streams = Array.from(new Set(initialStudents.map((s) => s.stream).filter(Boolean) as string[]));

  const columns: ColumnDef<Student>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }: any) => (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:bg-transparent -ml-2 h-auto p-0 font-black uppercase tracking-widest text-[10px] text-purple-muted-foreground/60 gap-1'>
          Student <ArrowUpDown className='h-3 w-3' />
        </Button>
      ),
      cell: ({ row }: any) => (
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-purple-gradient flex items-center justify-center text-white text-[11px] font-black shrink-0'>
            {row.original.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className='min-w-0'>
            <p className='text-[13px] font-semibold text-purple-foreground truncate'>{row.original.name}</p>
            <p className='text-[11px] text-purple-muted-foreground/60 font-medium flex items-center gap-1 mt-0.5'>
              <Mail className='w-2.5 h-2.5 shrink-0' />
              <span className='truncate'>{row.original.email}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'studentType',
      header: () => <span className='font-black uppercase tracking-widest text-[10px] text-purple-muted-foreground/60'>Division</span>,
      cell: ({ row }: any) => {
        const type = row.original.studentType;
        if (!type) return <span className='admin-badge admin-badge-pending'>N/A</span>;
        return (
          <span className={`admin-badge ${type === 'SCHOOL' ? 'admin-badge-school' : 'admin-badge-college'}`}>
            {type === 'SCHOOL' ? <School className='w-2.5 h-2.5' /> : <GraduationCap className='w-2.5 h-2.5' />}
            {type}
          </span>
        );
      },
    },
    {
      id: 'details',
      header: () => <span className='font-black uppercase tracking-widest text-[10px] text-purple-muted-foreground/60'>Academic Context</span>,
      cell: ({ row }: any) => {
        const isSchool = row.original.studentType === 'SCHOOL';
        const top = isSchool ? row.original.classLevel : row.original.course;
        const bottom = isSchool ? row.original.stream : row.original.year;
        if (!top && !bottom)
          return <span className='text-[11px] text-purple-muted-foreground/40 italic'>Not assigned</span>;
        return (
          <div>
            <p className='text-[12px] font-semibold text-purple-foreground'>{top || '—'}</p>
            <p className='text-[10px] font-medium text-purple-muted-foreground/60 uppercase tracking-tight mt-0.5'>{bottom || '—'}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'institution',
      header: () => <span className='font-black uppercase tracking-widest text-[10px] text-purple-muted-foreground/60'>Institution</span>,
      cell: ({ row }: any) => (
        <span className='text-[12px] font-medium text-purple-muted-foreground/75'>{row.original.institution || '—'}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }: any) => (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:bg-transparent -ml-2 h-auto p-0 font-black uppercase tracking-widest text-[10px] text-purple-muted-foreground/60 gap-1'>
          Enrolled <ArrowUpDown className='h-3 w-3' />
        </Button>
      ),
      cell: ({ row }: any) => {
        const d = row.original.createdAt ? new Date(row.original.createdAt) : null;
        return (
          <div className='flex items-center gap-1.5 text-purple-muted-foreground/60 text-[11px] font-medium'>
            <Calendar className='w-3 h-3 shrink-0' />
            {isMounted && d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <div className='flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <Button variant='ghost' size='sm'
            className='h-7 px-2 text-[11px] font-bold text-purple-primary hover:bg-purple-secondary/60 gap-1 rounded-lg'
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); router.push(`/admin/students/${row.original.id}`); }}>
            View <ChevronRight className='w-3 h-3' />
          </Button>
          <Button variant='ghost' className='h-7 w-7 p-0 hover:bg-purple-secondary/60 rounded-lg'
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); router.push(`/admin/students/${row.original.id}`); }}>
            <MoreHorizontal className='h-3.5 w-3.5 text-purple-muted-foreground/60' />
          </Button>
        </div>
      ),
    },
  ], [router]);

  const table = useReactTable({
    data: filteredStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 12 } },
  });

  const filterDefs = [
    {
      id: 'type', placeholder: 'All Types', value: typeFilter, onChange: setTypeFilter, width: 'w-[120px]',
      options: [{ value: 'ALL', label: 'All Types' }, { value: 'SCHOOL', label: 'School' }, { value: 'COLLEGE', label: 'College' }],
    },
    {
      id: 'stream', placeholder: 'All Streams', value: streamFilter, onChange: setStreamFilter, width: 'w-[135px]',
      options: [{ value: 'ALL', label: 'All Streams' }, ...streams.map((s) => ({ value: s, label: s }))],
    },
  ];

  return (
    <div className='admin-shell space-y-5'>

      {/* Header */}
      <AdminPageHeader
        section='Management'
        title='Student Directory'
        subtitle='Browse and manage the global student database across all tiers.'
        icon={Users}
        actions={
          <>
            <Button variant='outline' onClick={() => setIsBulkOpen(true)}
              className='h-8 px-3.5 rounded-lg border-purple-border/50 text-purple-foreground hover:bg-white text-[11px] font-bold gap-1.5 shadow-purple-xs'>
              <UploadCloud className='w-3.5 h-3.5 text-purple-primary' /> Import CSV
            </Button>
            <Button onClick={() => { setIsCreateOpen(true); setCreatedPassword(null); }}
              className='h-8 px-3.5 rounded-lg bg-purple-primary hover:bg-purple-primary/90 text-white text-[11px] font-bold gap-1.5 btn-shimmer shadow-purple-sm'>
              <Plus className='w-3.5 h-3.5' /> Create Student
            </Button>
          </>
        }
      />

      {/* Filter Bar */}
      <AdminFilterBar
        searchValue={globalFilter ?? ''}
        onSearch={setGlobalFilter}
        searchPlaceholder='Search by name, email...'
        filters={filterDefs}
        resultCount={table.getFilteredRowModel().rows.length}
        totalCount={initialStudents.length}
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
            {table.getHeaderGroups().map((hg: any) => (
              <TableRow key={hg.id} className='hover:bg-transparent border-b border-purple-border/30 bg-[oklch(0.975_0.006_285)]'>
                {hg.headers.map((header: any) => (
                  <TableHead key={header.id} className='h-10 px-5 text-left'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any, idx: number) => (
                <TableRow key={row.id}
                  onClick={() => router.push(`/admin/students/${row.original.id}`)}
                  className={`admin-table-row group cursor-pointer border-b border-purple-border/15 ${idx % 2 === 1 ? 'bg-[oklch(0.975_0.006_285)]/50' : 'bg-white'}`}>
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id} className='py-3 px-5'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-[280px] text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-14 h-14 rounded-2xl bg-purple-secondary/50 flex items-center justify-center'>
                      <Users className='w-6 h-6 text-purple-muted-foreground/35' />
                    </div>
                    <p className='text-[12px] font-bold uppercase tracking-widest text-purple-muted-foreground/45'>
                      No student records found
                    </p>
                    <Button onClick={() => { setIsCreateOpen(true); setCreatedPassword(null); }}
                      className='mt-1 h-8 px-4 rounded-lg bg-purple-primary text-white text-[11px] font-bold gap-1.5'>
                      <Plus className='w-3.5 h-3.5' /> Add First Student
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className='flex items-center justify-between px-5 py-3 border-t border-purple-border/25 bg-[oklch(0.975_0.006_285)]/60'>
          <p className='text-[11px] font-medium text-purple-muted-foreground/60 tabular-nums'>
            {table.getFilteredRowModel().rows.length} students · Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </p>
          <div className='flex items-center gap-1.5'>
            <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
              className='rounded-lg border-purple-border/40 h-7 w-7 p-0 shadow-none'>
              <ChevronLeft className='w-3.5 h-3.5' />
            </Button>
            <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
              className='rounded-lg border-purple-border/40 h-7 w-7 p-0 shadow-none'>
              <ChevronRight className='w-3.5 h-3.5' />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Bulk Upload Dialog ── */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className='sm:max-w-md rounded-2xl border-purple-border/30 shadow-purple-lg'>
          <div className='dialog-accent-strip' />
          <DialogHeader>
            <DialogTitle className='text-lg font-heading font-black text-purple-foreground flex items-center gap-2'>
              <FileSpreadsheet className='w-4.5 h-4.5 text-purple-primary' /> Bulk Student Upload
            </DialogTitle>
            <DialogDescription className='text-purple-muted-foreground font-medium text-sm'>
              Upload a CSV file to import multiple students at once.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='rounded-xl bg-purple-secondary/30 border border-purple-border/25 p-4'>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-[10px] font-black text-purple-primary uppercase tracking-widest'>Required Columns</p>
                <button type='button' onClick={() => {
                  const csv = 'name,email,mobileNo,institution,studentType,classLevel,stream,college,course,year\nJohn Doe,john@example.com,9876543210,Sol9x Academy,SCHOOL,12,Science,,,';
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'student_template.csv'; a.click();
                  URL.revokeObjectURL(url);
                }} className='text-[10px] font-black text-purple-primary hover:underline flex items-center gap-1'>
                  <Download className='w-3 h-3' /> Template
                </button>
              </div>
              <code className='text-[11px] font-mono text-purple-foreground/80 block leading-relaxed'>
                name, email, mobileNo, institution, studentType,<br />classLevel, stream, college, course, year
              </code>
            </div>
            <div onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setCsvFile(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${csvFile ? 'border-purple-primary bg-purple-primary/8' : 'border-purple-border/40 hover:border-purple-primary/60 hover:bg-purple-secondary/20'}`}>
              <input ref={fileInputRef} type='file' accept='.csv' className='hidden' onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
              {csvFile ? (
                <div className='flex flex-col items-center gap-2'>
                  <FileSpreadsheet className='w-7 h-7 text-purple-primary' />
                  <p className='text-sm font-bold text-purple-foreground'>{csvFile.name}</p>
                  <p className='text-[11px] text-purple-muted-foreground'>{(csvFile.size / 1024).toFixed(1)} KB</p>
                  <button type='button' onClick={(e) => { e.stopPropagation(); setCsvFile(null); }} className='text-rose-400 hover:text-rose-600'>
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2 opacity-60'>
                  <UploadCloud className='w-7 h-7 text-purple-primary' />
                  <p className='text-sm font-bold text-purple-foreground'>Click to select CSV file</p>
                  <p className='text-[11px] text-purple-muted-foreground'>or drag and drop here</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => { setIsBulkOpen(false); setCsvFile(null); }}
              className='rounded-lg border-purple-border/40 font-bold text-[12px]'>Cancel</Button>
            <Button disabled={!csvFile || isBulkProcessing}
              onClick={() => {
                if (!csvFile) return;
                startBulkTransition(async () => {
                  try {
                    const text = await csvFile.text();
                    const rows = parseCsv(text);
                    if (rows.length === 0) { toast.error('CSV file is empty or has no valid rows.'); return; }
                    const result = await bulkCreateStudents(rows as any);
                    if (result.success) {
                      toast.success(`${result.created} students imported!`, { description: result.skipped > 0 ? `${result.skipped} rows skipped.` : undefined });
                      setIsBulkOpen(false); setCsvFile(null); router.refresh();
                    } else { toast.error('Bulk import failed. Please check your CSV.'); }
                  } catch { toast.error('Failed to read CSV file.'); }
                });
              }}
              className='rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest gap-2 btn-shimmer'>
              {isBulkProcessing ? <Loader2 className='w-4 h-4 animate-spin' /> : <UploadCloud className='w-4 h-4' />}
              {isBulkProcessing ? 'Importing...' : 'Start Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Student Dialog ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='sm:max-w-lg rounded-2xl border-purple-border/30 shadow-purple-lg'>
          <div className='dialog-accent-strip' />
          <DialogHeader>
            <DialogTitle className='text-lg font-heading font-black text-purple-foreground flex items-center gap-2'>
              <User className='w-4.5 h-4.5 text-purple-primary' /> Create New Student
            </DialogTitle>
            <DialogDescription className='text-purple-muted-foreground font-medium text-sm'>
              Add a student to the portal. A default password will be auto-generated.
            </DialogDescription>
          </DialogHeader>

          {createdPassword ? (
            <>
              <div className='py-4'>
                <div className='rounded-2xl bg-purple-gradient p-6 text-center space-y-3'>
                  <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto'>
                    <KeyRound className='w-5 h-5 text-white' />
                  </div>
                  <p className='text-sm font-bold text-white'>Student Created Successfully!</p>
                  <p className='text-[11px] text-white/80 font-medium'>Share this default password with the student:</p>
                  <div className='bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 inline-block'>
                    <code className='text-base font-mono font-black text-white'>{createdPassword}</code>
                  </div>
                  <p className='text-[10px] text-white/60 font-medium'>Student should change this on first login.</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setIsCreateOpen(false); setCreatedPassword(null); }}
                  className='w-full rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest'>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault(); setIsSubmitting(true);
              const formData = new FormData(e.currentTarget);
              try {
                const result = await createStudent(formData);
                if (result.success && result.defaultPassword) {
                  setCreatedPassword(result.defaultPassword);
                  toast.success('Student created successfully!'); router.refresh();
                } else { toast.error(result.error || 'Failed to create student.'); }
              } catch { toast.error('An unexpected error occurred.'); }
              finally { setIsSubmitting(false); }
            }} className='space-y-4 py-2'>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  { id: 'name', label: 'Full Name', placeholder: 'John Doe', required: true },
                  { id: 'email', label: 'Email', placeholder: 'john@example.com', required: true, type: 'email' },
                  { id: 'mobileNo', label: 'Mobile No', placeholder: '9876543210', required: true },
                  { id: 'institution', label: 'Institution', placeholder: 'Sol9x Academy' },
                  { id: 'classLevel', label: 'Class Level', placeholder: 'e.g. 12' },
                  { id: 'stream', label: 'Stream', placeholder: 'e.g. Science' },
                  { id: 'course', label: 'Course', placeholder: 'e.g. B.Tech CSE' },
                  { id: 'college', label: 'College', placeholder: 'College name' },
                  { id: 'year', label: 'Year', placeholder: 'e.g. 2nd Year' },
                ].map((f) => (
                  <div key={f.id} className='space-y-1.5'>
                    <Label htmlFor={f.id} className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'>
                      {f.label} {f.required && <span className='text-rose-400'>*</span>}
                    </Label>
                    <Input id={f.id} name={f.id} type={(f as any).type ?? 'text'} placeholder={f.placeholder} required={f.required}
                      className='h-9 rounded-lg border-purple-border/35 bg-purple-secondary/15 focus:bg-white focus:border-purple-primary focus-visible:ring-purple-primary/20 font-medium text-sm' />
                  </div>
                ))}
                <div className='space-y-1.5'>
                  <Label className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'>Student Type</Label>
                  <Select name='studentType'>
                    <SelectTrigger className='h-9 rounded-lg border-purple-border/35 bg-purple-secondary/15 font-medium text-sm'>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                    <SelectContent className='rounded-xl border-purple-border/35'>
                      <SelectItem value='SCHOOL'>School</SelectItem>
                      <SelectItem value='COLLEGE'>College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className='pt-2'>
                <Button type='submit' disabled={isSubmitting}
                  className='w-full h-10 rounded-lg bg-purple-primary text-white font-black uppercase tracking-widest btn-shimmer shadow-purple-sm'>
                  {isSubmitting ? <><Loader2 className='w-4 h-4 animate-spin mr-2 inline' /> Creating...</> : 'Create Student'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
