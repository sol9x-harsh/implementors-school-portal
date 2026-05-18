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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  User,
  School,
  GraduationCap,
  Mail,
  Calendar,
  Users,
  UploadCloud,
  FileSpreadsheet,
  X,
  Plus,
  Download,
  KeyRound,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  Loader2,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createStudent, bulkCreateStudents } from '@/lib/actions/admin.actions';
import { Label } from '@/components/ui/label';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';

interface Student {
  id: string;
  uid?: string;
  name: string;
  email: string;
  mobileNo: string;
  institution?: string;
  studentType?: string;
  classLevel?: string;
  stream?: string;
  createdAt: string;
}

const CLASS_OPTIONS = ['9', '10', '11', '12'];
const STREAM_OPTIONS = [
  'PCM',
  'PCB',
  'PCMB',
  'Commerce (With Maths)',
  'Commerce (Without Maths)',
  'Humanities',
];

interface StudentDirectoryClientProps {
  initialStudents: Student[];
  schools: { _id: string; name: string }[];
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });
      return row;
    })
    .filter((r) => Object.values(r).some((v) => v));
}

export default function StudentDirectoryClient({
  initialStudents,
  schools,
}: StudentDirectoryClientProps) {
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
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkProcessing, startBulkTransition] = useTransition();
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [credentialsData, setCredentialsData] = useState<any[]>([]);
  const [bulkCredentials, setBulkCredentials] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Keep filter in sync when URL param changes (from topbar search)
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setGlobalFilter(q);
  }, [searchParams]);

  const filteredStudents = useMemo(() => {
    let data = initialStudents;
    if (typeFilter !== 'ALL')
      data = data.filter((s) => s.studentType === typeFilter);
    if (streamFilter !== 'ALL')
      data = data.filter((s) => s.stream === streamFilter);
    return data;
  }, [initialStudents, typeFilter, streamFilter]);

  const streams = Array.from(
    new Set(initialStudents.map((s) => s.stream).filter(Boolean) as string[]),
  );

  const columns: ColumnDef<Student>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }: any) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='hover:bg-transparent -ml-2 h-auto p-0 font-bold uppercase tracking-[0.12em] text-[10px] text-purple-muted-foreground/60 gap-1'
          >
            Student <ArrowUpDown className='h-3 w-3' />
          </Button>
        ),
        cell: ({ row }: any) => (
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-purple-gradient flex items-center justify-center text-white text-[12px] font-black shrink-0 shadow-purple-xs'>
              {row.original.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <p className='text-[13px] font-semibold text-purple-foreground truncate'>
                  {row.original.name}
                </p>
                {row.original.uid && (
                  <span className='text-[9px] font-black text-purple-primary bg-purple-primary/10 px-1.5 py-0.5 rounded border border-purple-primary/10'>
                    {row.original.uid}
                  </span>
                )}
              </div>
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
        header: () => (
          <span className='font-bold uppercase tracking-[0.12em] text-[10px] text-purple-muted-foreground/60'>
            Division
          </span>
        ),
        cell: ({ row }: any) => {
          return (
            <span className='admin-badge admin-badge-school'>
              <School className='w-2.5 h-2.5' />
              SCHOOL
            </span>
          );
        },
      },
      {
        id: 'details',
        header: () => (
          <span className='font-bold uppercase tracking-[0.12em] text-[10px] text-purple-muted-foreground/60'>
            Academic Context
          </span>
        ),
        cell: ({ row }: any) => {
          const top = row.original.classLevel;
          const bottom = row.original.stream;
          if (!top && !bottom)
            return (
              <span className='text-[11px] text-purple-muted-foreground/40 italic'>
                Not assigned
              </span>
            );
          return (
            <div>
              <p className='text-[12px] font-semibold text-purple-foreground'>
                {top || '—'}
              </p>
              <p className='text-[10px] font-medium text-purple-muted-foreground/60 uppercase tracking-tight mt-0.5'>
                {bottom || '—'}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'institution',
        header: () => (
          <span className='font-black uppercase tracking-widest text-[10px] text-purple-muted-foreground/60'>
            Institution
          </span>
        ),
        cell: ({ row }: any) => (
          <span className='text-[12px] font-medium text-purple-muted-foreground/75'>
            {row.original.institution || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }: any) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='hover:bg-transparent -ml-2 h-auto p-0 font-black uppercase tracking-widest text-[10px] text-purple-muted-foreground/60 gap-1'
          >
            Enrolled <ArrowUpDown className='h-3 w-3' />
          </Button>
        ),
        cell: ({ row }: any) => {
          const d = row.original.createdAt
            ? new Date(row.original.createdAt)
            : null;
          return (
            <div className='flex items-center gap-1.5 text-purple-muted-foreground/60 text-[11px] font-medium'>
              <Calendar className='w-3 h-3 shrink-0' />
              {isMounted && d && !isNaN(d.getTime())
                ? d.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'}
            </div>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }: any) => (
          <div className='flex items-center justify-end gap-1.5'>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-3 text-[11px] font-bold text-purple-primary hover:bg-purple-primary hover:text-white gap-1 rounded-lg border border-purple-primary/25 hover:border-purple-primary transition-all duration-150'
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                router.push(`/admin/students/${row.original.id}`);
              }}
            >
              View <ChevronRight className='w-3 h-3' />
            </Button>
          </div>
        ),
      },
    ],
    [router],
  );

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
      id: 'type',
      placeholder: 'All Types',
      value: typeFilter,
      onChange: setTypeFilter,
      width: 'w-[120px]',
      options: [
        { value: 'ALL', label: 'All Types' },
        { value: 'SCHOOL', label: 'School' },
      ],
    },
    {
      id: 'stream',
      placeholder: 'All Streams',
      value: streamFilter,
      onChange: setStreamFilter,
      width: 'w-[135px]',
      options: [
        { value: 'ALL', label: 'All Streams' },
        ...streams.map((s) => ({ value: s, label: s })),
      ],
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
            <Button
              variant='outline'
              onClick={() => setIsCredentialsOpen(true)}
              className='h-8 px-3.5 rounded-lg border-purple-border/50 text-purple-foreground hover:bg-white text-[11px] font-bold gap-1.5 shadow-purple-xs'
            >
              <KeyRound className='w-3.5 h-3.5 text-purple-primary' /> Manage
              Credentials
            </Button>
            <Button
              variant='outline'
              onClick={() => setIsBulkOpen(true)}
              className='h-8 px-3.5 rounded-lg border-purple-border/50 text-purple-foreground hover:bg-white text-[11px] font-bold gap-1.5 shadow-purple-xs'
            >
              <UploadCloud className='w-3.5 h-3.5 text-purple-primary' /> Import
              CSV
            </Button>
            <Button
              onClick={() => {
                setIsCreateOpen(true);
                setCreatedPassword(null);
              }}
              className='h-8 px-3.5 rounded-lg bg-purple-primary hover:bg-purple-primary/90 text-white text-[11px] font-bold gap-1.5 btn-shimmer shadow-purple-sm'
            >
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
              <TableRow
                key={hg.id}
                className='hover:bg-transparent border-b border-purple-border/40 bg-purple-secondary/30'
              >
                {hg.headers.map((header: any) => (
                  <TableHead key={header.id} className='h-12 px-5 text-left'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any, idx: number) => (
                <TableRow
                  key={row.id}
                  onClick={() =>
                    router.push(`/admin/students/${row.original.id}`)
                  }
                  className={`admin-table-row group cursor-pointer border-b border-purple-border/15 ${idx % 2 === 1 ? 'bg-[oklch(0.975_0.006_285)]/50' : 'bg-white'}`}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id} className='py-3 px-5'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-[280px] text-center'
                >
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-14 h-14 rounded-2xl bg-purple-secondary/50 flex items-center justify-center'>
                      <Users className='w-6 h-6 text-purple-muted-foreground/35' />
                    </div>
                    <p className='text-[12px] font-bold uppercase tracking-widest text-purple-muted-foreground/45'>
                      No student records found
                    </p>
                    <Button
                      onClick={() => {
                        setIsCreateOpen(true);
                        setCreatedPassword(null);
                      }}
                      className='mt-1 h-8 px-4 rounded-lg bg-purple-primary text-white text-[11px] font-bold gap-1.5'
                    >
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
            {table.getFilteredRowModel().rows.length} students · Page{' '}
            {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.max(1, table.getPageCount())}
          </p>
          <div className='flex items-center gap-1.5'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className='rounded-lg border-purple-border/40 h-7 w-7 p-0 shadow-none'
            >
              <ChevronLeft className='w-3.5 h-3.5' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className='rounded-lg border-purple-border/40 h-7 w-7 p-0 shadow-none'
            >
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
              <FileSpreadsheet className='w-4.5 h-4.5 text-purple-primary' />{' '}
              Bulk Student Upload
            </DialogTitle>
            <DialogDescription className='text-purple-muted-foreground font-medium text-sm'>
              Upload a CSV file to import multiple students at once.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='rounded-xl bg-purple-secondary/30 border border-purple-border/25 p-4'>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-[10px] font-black text-purple-primary uppercase tracking-widest'>
                  Required Columns
                </p>
                <button
                  type='button'
                  onClick={() => {
                    const csv =
                      'name,email,mobileNo,institution,classLevel,stream\nJohn Doe,john@example.com,9876543210,Sol9x Academy,12,PCM';
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'student_template.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className='text-[10px] font-black text-purple-primary hover:underline flex items-center gap-1'
                >
                  <Download className='w-3 h-3' /> Template
                </button>
              </div>
              <code className='text-[11px] font-mono text-purple-foreground/80 block leading-relaxed'>
                name, email, mobileNo, institution,
                <br />
                classLevel, stream
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
                  setCsvFile(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${csvFile ? 'border-purple-primary bg-purple-primary/8' : 'border-purple-border/40 hover:border-purple-primary/60 hover:bg-purple-secondary/20'}`}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept='.csv'
                className='hidden'
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              />
              {csvFile ? (
                <div className='flex flex-col items-center gap-2'>
                  <FileSpreadsheet className='w-7 h-7 text-purple-primary' />
                  <p className='text-sm font-bold text-purple-foreground'>
                    {csvFile.name}
                  </p>
                  <p className='text-[11px] text-purple-muted-foreground'>
                    {(csvFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setCsvFile(null);
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
                    Click to select CSV file
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
                setIsBulkOpen(false);
                setCsvFile(null);
              }}
              className='rounded-lg border-purple-border/40 font-bold text-[12px]'
            >
              Cancel
            </Button>
            <Button
              disabled={!csvFile || isBulkProcessing}
              onClick={() => {
                if (!csvFile) return;
                startBulkTransition(async () => {
                  try {
                    const text = await csvFile.text();
                    const rows = parseCsv(text);
                    if (rows.length === 0) {
                      toast.error('CSV file is empty or has no valid rows.');
                      return;
                    }
                    const result = await bulkCreateStudents(rows as any);
                    if (result.success) {
                      if (result.credentials && result.credentials.length > 0) {
                        setBulkCredentials(result.credentials);
                        toast.success(
                          `${result.created} students imported! Credentials ready.`,
                          {
                            description:
                              result.skipped > 0
                                ? `${result.skipped} rows skipped.`
                                : undefined,
                          },
                        );
                      } else {
                        toast.success(`${result.created} students imported!`, {
                          description:
                            result.skipped > 0
                              ? `${result.skipped} rows skipped.`
                              : undefined,
                        });
                        setIsBulkOpen(false);
                        setCsvFile(null);
                        router.refresh();
                      }
                    } else {
                      toast.error('Bulk import failed. Please check your CSV.');
                    }
                  } catch {
                    toast.error('Failed to read CSV file.');
                  }
                });
              }}
              className='rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest gap-2 btn-shimmer'
            >
              {isBulkProcessing ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <UploadCloud className='w-4 h-4' />
              )}
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
              <User className='w-4.5 h-4.5 text-purple-primary' /> Create New
              Student
            </DialogTitle>
            <DialogDescription className='text-purple-muted-foreground font-medium text-sm'>
              Add a student to the portal. A default password will be
              auto-generated.
            </DialogDescription>
          </DialogHeader>

          {createdPassword ? (
            <>
              <div className='py-4'>
                <div className='rounded-2xl bg-purple-gradient p-6 text-center space-y-3'>
                  <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto'>
                    <KeyRound className='w-5 h-5 text-white' />
                  </div>
                  <p className='text-sm font-bold text-white'>
                    Student Created Successfully!
                  </p>
                  <p className='text-[11px] text-white/80 font-medium'>
                    Share this default password with the student:
                  </p>
                  <div className='bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 inline-block'>
                    <code className='text-base font-mono font-black text-white'>
                      {createdPassword}
                    </code>
                  </div>
                  <p className='text-[10px] text-white/60 font-medium'>
                    Student should change this on first login.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setIsCreateOpen(false);
                    setCreatedPassword(null);
                  }}
                  className='w-full rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest'
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                const formData = new FormData(e.currentTarget);
                try {
                  const result = await createStudent(formData);
                  if (result.success && result.defaultPassword) {
                    setCreatedPassword(result.defaultPassword);
                    toast.success('Student created successfully!');
                    router.refresh();
                  } else {
                    toast.error(result.error || 'Failed to create student.');
                  }
                } catch {
                  toast.error('An unexpected error occurred.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className='space-y-6 py-2 overflow-y-auto max-h-[70vh] px-1 scrollbar-thin'
            >
              {/* Section 1: Basic Identity */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-1 border-b border-purple-border/20'>
                  <User className='w-3.5 h-3.5 text-purple-primary' />
                  <h3 className='text-[11px] font-black text-purple-foreground uppercase tracking-widest'>
                    Personal Identity
                  </h3>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='name'
                      className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'
                    >
                      Full Name <span className='text-rose-400'>*</span>
                    </Label>
                    <Input
                      id='name'
                      name='name'
                      placeholder='John Doe'
                      required
                      className='h-9 rounded-lg border-purple-border/35 bg-purple-secondary/15 focus:bg-white focus:border-purple-primary text-sm'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='email'
                      className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'
                    >
                      Email Address <span className='text-rose-400'>*</span>
                    </Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      placeholder='john@example.com'
                      required
                      className='h-9 rounded-lg border-purple-border/35 bg-purple-secondary/15 focus:bg-white focus:border-purple-primary text-sm'
                    />
                  </div>
                  <div className='col-span-2 space-y-1.5'>
                    <Label
                      htmlFor='mobileNo'
                      className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'
                    >
                      Mobile Number <span className='text-rose-400'>*</span>
                    </Label>
                    <Input
                      id='mobileNo'
                      name='mobileNo'
                      placeholder='9876543210'
                      required
                      className='h-9 rounded-lg border-purple-border/35 bg-purple-secondary/15 focus:bg-white focus:border-purple-primary text-sm'
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Context */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-1 border-b border-purple-border/20'>
                  <GraduationCap className='w-3.5 h-3.5 text-purple-primary' />
                  <h3 className='text-[11px] font-black text-purple-foreground uppercase tracking-widest'>
                    Academic Profile
                  </h3>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'>
                      Institution / School
                    </Label>
                    <Select name='institution'>
                      <SelectTrigger className='h-9 rounded-lg border-purple-border/35 bg-purple-secondary/15 text-sm'>
                        <SelectValue placeholder='Select School' />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-purple-border/35 shadow-purple-lg'>
                        {schools.map((s) => (
                          <SelectItem key={s._id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1.5'>
                    <Label className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'>
                      Class Level
                    </Label>
                    <Select name='classLevel'>
                      <SelectTrigger className='h-9 rounded-lg border-purple-border/35 bg-purple-secondary/15 text-sm'>
                        <SelectValue placeholder='Select Class' />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-purple-border/35 shadow-purple-lg'>
                        {CLASS_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            Class {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='col-span-2 space-y-1.5'>
                    <Label className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'>
                      Academic Stream
                    </Label>
                    <Select name='stream'>
                      <SelectTrigger className='h-9 rounded-lg border-purple-border/35 bg-purple-secondary/15 text-sm'>
                        <SelectValue placeholder='Select Stream' />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-purple-border/35 shadow-purple-lg'>
                        {STREAM_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 3: Guardian Details */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-1 border-b border-purple-border/20'>
                  <Users className='w-3.5 h-3.5 text-purple-primary' />
                  <h3 className='text-[11px] font-black text-purple-foreground uppercase tracking-widest'>
                    Parent / Guardian Information
                  </h3>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  {/* Father */}
                  <div className='space-y-3 p-3 rounded-xl bg-purple-primary/5 border border-purple-primary/10'>
                    <p className='text-[9px] font-black text-purple-primary uppercase tracking-widest'>
                      Father's Details
                    </p>
                    <div className='space-y-2'>
                      <Input
                        name='fatherName'
                        placeholder='Name'
                        className='h-8 text-[11px] bg-white'
                      />
                      <Input
                        name='fatherOccupation'
                        placeholder='Occupation'
                        className='h-8 text-[11px] bg-white'
                      />
                      <Input
                        name='fatherMobile'
                        placeholder='Mobile'
                        className='h-8 text-[11px] bg-white'
                      />
                      <Input
                        name='fatherEmail'
                        placeholder='Email'
                        type='email'
                        className='h-8 text-[11px] bg-white'
                      />
                    </div>
                  </div>
                  {/* Mother */}
                  <div className='space-y-3 p-3 rounded-xl bg-purple-primary/5 border border-purple-primary/10'>
                    <p className='text-[9px] font-black text-purple-primary uppercase tracking-widest'>
                      Mother's Details
                    </p>
                    <div className='space-y-2'>
                      <Input
                        name='motherName'
                        placeholder='Name'
                        className='h-8 text-[11px] bg-white'
                      />
                      <Input
                        name='motherOccupation'
                        placeholder='Occupation'
                        className='h-8 text-[11px] bg-white'
                      />
                      <Input
                        name='motherMobile'
                        placeholder='Mobile'
                        className='h-8 text-[11px] bg-white'
                      />
                      <Input
                        name='motherEmail'
                        placeholder='Email'
                        type='email'
                        className='h-8 text-[11px] bg-white'
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className='pt-2 sticky bottom-0 bg-white pb-2'>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full h-11 rounded-lg bg-purple-gradient text-white font-black uppercase tracking-widest btn-shimmer shadow-purple-sm'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin mr-2 inline' />{' '}
                      Creating Identity...
                    </>
                  ) : (
                    'Launch Student Profile'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Bulk Credentials Display Dialog ── */}
      <Dialog
        open={bulkCredentials.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setBulkCredentials([]);
            setIsBulkOpen(false);
            setCsvFile(null);
            router.refresh();
          }
        }}
      >
        <DialogContent className='sm:max-w-3xl rounded-2xl border-purple-border/30 shadow-purple-lg max-h-[80vh] overflow-y-auto'>
          <div className='dialog-accent-strip' />
          <DialogHeader>
            <DialogTitle className='text-lg font-heading font-black text-purple-foreground flex items-center gap-2'>
              <KeyRound className='w-4.5 h-4.5 text-purple-primary' /> Bulk
              Import Credentials
            </DialogTitle>
            <DialogDescription className='text-purple-muted-foreground font-medium text-sm'>
              Download or email credentials for the newly imported students.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            {/* Credentials Display */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2 pb-1 border-b border-purple-border/20'>
                <KeyRound className='w-3.5 h-3.5 text-purple-primary' />
                <h3 className='text-[11px] font-black text-purple-foreground uppercase tracking-widest'>
                  Generated Credentials ({bulkCredentials.length} students)
                </h3>
              </div>
              <div className='max-h-60 overflow-y-auto border border-purple-border/20 rounded-lg p-3'>
                <div className='space-y-2 text-xs font-mono'>
                  {bulkCredentials.map((cred, index) => (
                    <div
                      key={cred.email}
                      className='grid grid-cols-5 gap-2 p-2 bg-purple-secondary/10 rounded'
                    >
                      <span className='font-medium'>{cred.name}</span>
                      <span className='text-purple-muted-foreground'>
                        {cred.email}
                      </span>
                      <span className='font-bold text-purple-primary'>
                        {cred.password}
                      </span>
                      <span className='text-purple-muted-foreground'>
                        {cred.uid}
                      </span>
                      <span className='text-purple-muted-foreground'>
                        {cred.institution || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2'>
              <Button
                onClick={() => {
                  // Generate CSV content
                  const csv =
                    'Name,Email,Password,UID,Institution,Class,Stream\n' +
                    bulkCredentials
                      .map(
                        (cred) =>
                          `"${cred.name}","${cred.email}","${cred.password}","${cred.uid || ''}","${cred.institution || ''}","${cred.classLevel || ''}","${cred.stream || ''}"`,
                      )
                      .join('\n');

                  // Download CSV
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `bulk-credentials-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);

                  toast.success('Credentials CSV downloaded');
                }}
                className='rounded-lg border-purple-border/40 font-bold text-[12px] gap-2'
              >
                <Download className='w-4 h-4' /> Download CSV
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const { sendBulkCredentialsEmails } =
                      await import('@/lib/actions/credential.actions');
                    const studentIds = bulkCredentials.map(
                      (cred) => cred.email,
                    ); // Use email as identifier since we don't have IDs
                    const result = await sendBulkCredentialsEmails(
                      studentIds,
                      adminPassword,
                    );

                    if (result.success) {
                      toast.success(
                        `Credentials emailed to ${result.success} students${'failed' in result && result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
                      );
                    } else {
                      toast.error(result.error || 'Failed to send emails');
                    }
                  } catch (error) {
                    toast.error('Failed to send emails');
                  }
                }}
                className='rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest gap-2'
              >
                <Mail className='w-4 h-4' /> Email Students
              </Button>
              <Button
                onClick={() => {
                  setBulkCredentials([]);
                  setIsBulkOpen(false);
                  setCsvFile(null);
                  router.refresh();
                }}
                className='rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest'
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Credential Management Dialog ── */}
      <Dialog open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen}>
        <DialogContent className='sm:max-w-2xl rounded-2xl border-purple-border/30 shadow-purple-lg max-h-[80vh] overflow-y-auto'>
          <div className='dialog-accent-strip' />
          <DialogHeader>
            <DialogTitle className='text-lg font-heading font-black text-purple-foreground flex items-center gap-2'>
              <KeyRound className='w-4.5 h-4.5 text-purple-primary' /> Manage
              Student Credentials
            </DialogTitle>
            <DialogDescription className='text-purple-muted-foreground font-medium text-sm'>
              Verify admin password to access and manage student login
              credentials.
            </DialogDescription>
          </DialogHeader>

          {!credentialsData.length ? (
            <div className='space-y-6 py-4'>
              {/* Admin Password Verification */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-1 border-b border-purple-border/20'>
                  <Lock className='w-3.5 h-3.5 text-purple-primary' />
                  <h3 className='text-[11px] font-black text-purple-foreground uppercase tracking-widest'>
                    Admin Verification
                  </h3>
                </div>
                <div className='space-y-2'>
                  <Label
                    htmlFor='adminPassword'
                    className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'
                  >
                    Enter Admin Password{' '}
                    <span className='text-rose-400'>*</span>
                  </Label>
                  <Input
                    id='adminPassword'
                    type='password'
                    placeholder='Enter your admin password'
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className='h-10 rounded-lg border-purple-border/35 bg-purple-secondary/15 focus:bg-white focus:border-purple-primary'
                  />
                </div>
              </div>

              {/* Student Selection */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-1 border-b border-purple-border/20'>
                  <Users className='w-3.5 h-3.5 text-purple-primary' />
                  <h3 className='text-[11px] font-black text-purple-foreground uppercase tracking-widest'>
                    Select Students
                  </h3>
                </div>
                <div className='max-h-60 overflow-y-auto border border-purple-border/20 rounded-lg p-3 space-y-2'>
                  {filteredStudents.slice(0, 20).map((student) => (
                    <div
                      key={student.id}
                      className='flex items-center gap-3 p-2 rounded-lg hover:bg-purple-secondary/20'
                    >
                      <input
                        type='checkbox'
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([
                              ...selectedStudents,
                              student.id,
                            ]);
                          } else {
                            setSelectedStudents(
                              selectedStudents.filter(
                                (id) => id !== student.id,
                              ),
                            );
                          }
                        }}
                        className='w-4 h-4 text-purple-primary border-purple-border/30 rounded'
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className='flex-1 cursor-pointer'
                      >
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-sm'>
                            {student.name}
                          </span>
                          <span className='text-[10px] text-purple-muted-foreground'>
                            {student.email}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <p className='text-[10px] text-purple-muted-foreground'>
                  {selectedStudents.length} student
                  {selectedStudents.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              <DialogFooter className='gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsCredentialsOpen(false);
                    setAdminPassword('');
                    setSelectedStudents([]);
                  }}
                  className='rounded-lg border-purple-border/40 font-bold text-[12px]'
                >
                  Cancel
                </Button>
                <Button
                  disabled={
                    !adminPassword ||
                    selectedStudents.length === 0 ||
                    isVerifying
                  }
                  onClick={async () => {
                    setIsVerifying(true);
                    try {
                      // Import the credential actions dynamically
                      const { getBulkCredentials } =
                        await import('@/lib/actions/credential.actions');
                      const result = await getBulkCredentials(
                        selectedStudents,
                        adminPassword,
                      );

                      if (result.success && result.credentials) {
                        setCredentialsData(result.credentials);
                        toast.success(
                          `Credentials retrieved for ${result.credentials.length} students`,
                        );
                      } else {
                        toast.error(
                          result.error || 'Failed to retrieve credentials',
                        );
                      }
                    } catch (error) {
                      toast.error('An unexpected error occurred');
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                  className='rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest gap-2'
                >
                  {isVerifying ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <KeyRound className='w-4 h-4' />
                  )}
                  {isVerifying ? 'Verifying...' : 'Get Credentials'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className='space-y-4 py-4'>
              {/* Credentials Display */}
              <div className='space-y-3'>
                <div className='flex items-center gap-2 pb-1 border-b border-purple-border/20'>
                  <KeyRound className='w-3.5 h-3.5 text-purple-primary' />
                  <h3 className='text-[11px] font-black text-purple-foreground uppercase tracking-widest'>
                    Generated Credentials
                  </h3>
                </div>
                <div className='max-h-60 overflow-y-auto border border-purple-border/20 rounded-lg p-3'>
                  <div className='space-y-2 text-xs font-mono'>
                    {credentialsData.map((cred, index) => (
                      <div
                        key={cred.studentId}
                        className='grid grid-cols-4 gap-2 p-2 bg-purple-secondary/10 rounded'
                      >
                        <span className='font-medium'>{cred.name}</span>
                        <span className='text-purple-muted-foreground'>
                          {cred.email}
                        </span>
                        <span className='font-bold text-purple-primary'>
                          {cred.tempPassword}
                        </span>
                        <span className='text-purple-muted-foreground'>
                          {cred.uid}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className='gap-2'>
                <Button
                  onClick={() => {
                    // Generate CSV content
                    const csv =
                      'Name,Email,Password,UID,Institution,Class,Stream\n' +
                      credentialsData
                        .map(
                          (cred) =>
                            `"${cred.name}","${cred.email}","${cred.tempPassword}","${cred.uid || ''}","${cred.institution || ''}","${cred.classLevel || ''}","${cred.stream || ''}"`,
                        )
                        .join('\n');

                    // Download CSV
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `student-credentials-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);

                    toast.success('Credentials CSV downloaded');
                  }}
                  className='rounded-lg border-purple-border/40 font-bold text-[12px] gap-2'
                >
                  <Download className='w-4 h-4' /> Download CSV
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const { sendBulkCredentialsEmails } =
                        await import('@/lib/actions/credential.actions');
                      const result = await sendBulkCredentialsEmails(
                        selectedStudents,
                        adminPassword,
                      );

                      if (result.success) {
                        toast.success(
                          `Credentials emailed to ${result.success} students${'failed' in result && result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
                        );
                      } else {
                        toast.error(result.error || 'Failed to send emails');
                      }
                    } catch (error) {
                      toast.error('Failed to send emails');
                    }
                  }}
                  className='rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest gap-2'
                >
                  <Mail className='w-4 h-4' /> Email Students
                </Button>
                <Button
                  onClick={() => {
                    setIsCredentialsOpen(false);
                    setAdminPassword('');
                    setSelectedStudents([]);
                    setCredentialsData([]);
                  }}
                  className='rounded-lg bg-purple-primary text-white font-black text-[12px] uppercase tracking-widest'
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
