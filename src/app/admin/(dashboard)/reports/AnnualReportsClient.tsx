'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  RefreshCw,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  Download,
  CalendarDays,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { generateAnnualReport } from '@/lib/actions/admin.actions';

interface CohortOption {
  value: string;
  label: string;
  count: number;
}

interface AnnualReport {
  id: string;
  cohortValue: string;
  cohortLabel: string;
  studentCount: number;
  generatedAt: string;
  status: 'complete' | 'failed';
  generatedBy?: string;
}

interface AnnualReportsClientProps {
  cohortOptions: CohortOption[];
  initialReports: AnnualReport[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function AnnualReportsClient({
  cohortOptions,
  initialReports,
}: AnnualReportsClientProps) {
  const [selectedCohort, setSelectedCohort] = useState(
    cohortOptions[0]?.value ?? 'all'
  );
  const [reports, setReports] = useState<AnnualReport[]>(initialReports);
  const [isPending, startTransition] = useTransition();

  const selected = cohortOptions.find((o) => o.value === selectedCohort);

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const result = await generateAnnualReport(selectedCohort);
        toast.success(
          `Report generated — ${result.report.studentCount} students in ${result.report.cohortLabel}`
        );
        setReports((prev) => [result.report, ...prev]);
      } catch {
        toast.error('Failed to generate report. Please try again.');
      }
    });
  };

  return (
    <div className="admin-shell space-y-6">
      <AdminPageHeader
        section="Tools"
        title="Annual Portfolio Reports"
        subtitle="Generate cohort-level institutional portfolio reports by aggregating academic data, activities, and verified achievements."
        icon={Zap}
      />

      {/* Generate Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="admin-card p-6 space-y-5">
          <p className="text-xs font-black text-purple-foreground uppercase tracking-[0.2em]">
            Generate New Report
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-purple-muted-foreground uppercase tracking-wider">
                Target Cohort
              </label>
              <Select
                value={selectedCohort}
                onValueChange={(v) => { if (v) setSelectedCohort(v); }}
              >
                <SelectTrigger className="h-10 rounded-xl border-purple-border/40 bg-white font-medium text-sm text-purple-foreground focus:ring-purple-primary/30">
                  <SelectValue placeholder="Select a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {opt.label}
                        <span className="text-[11px] text-purple-muted-foreground font-mono tabular-nums">
                          ({opt.count})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isPending}
              className="h-10 px-6 rounded-xl bg-purple-primary hover:bg-purple-primary/90 text-white font-bold text-sm shadow-purple-sm border-none gap-2 btn-shimmer disabled:opacity-60"
            >
              {isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isPending ? 'Generating…' : 'Generate Report'}
            </Button>
          </div>

          {selected && (
            <motion.div
              key={selected.value}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-purple-secondary/40 border border-purple-border/20"
            >
              <Users className="w-4 h-4 text-purple-primary shrink-0" />
              <p className="text-[12px] text-purple-foreground font-medium">
                <span className="font-black text-purple-primary">
                  {selected.count}
                </span>{' '}
                enrolled students in{' '}
                <span className="font-black">{selected.label}</span>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Reports Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <p className="text-xs font-black text-purple-foreground uppercase tracking-[0.2em] mb-4">
          Previously Generated Reports
        </p>

        <div className="admin-card overflow-hidden">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <CalendarDays className="w-10 h-10 text-purple-muted-foreground opacity-20" />
              <p className="text-sm font-medium text-purple-muted-foreground opacity-50">
                No reports generated yet
              </p>
              <p className="text-[11px] text-purple-muted-foreground opacity-30 font-medium">
                Select a cohort above and click Generate Report
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-purple-border/20 bg-purple-secondary/30 hover:bg-purple-secondary/30">
                  <TableHead className="text-[11px] font-black uppercase tracking-wider text-purple-muted-foreground">
                    Cohort
                  </TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-wider text-purple-muted-foreground">
                    Students
                  </TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-wider text-purple-muted-foreground">
                    Generated At
                  </TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-wider text-purple-muted-foreground">
                    Generated By
                  </TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-wider text-purple-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-wider text-purple-muted-foreground text-right">
                    Export
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report, i) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-purple-border/10 hover:bg-purple-secondary/20 transition-colors"
                  >
                    <TableCell className="font-semibold text-[13px] text-purple-foreground">
                      {report.cohortLabel}
                    </TableCell>
                    <TableCell>
                      <span className="admin-badge admin-badge-school">
                        {report.studentCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-[12px] text-purple-muted-foreground font-medium">
                      {formatDate(report.generatedAt)}
                    </TableCell>
                    <TableCell className="text-[12px] text-purple-muted-foreground font-medium max-w-[180px] truncate">
                      {report.generatedBy ?? '—'}
                    </TableCell>
                    <TableCell>
                      {report.status === 'complete' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-red-500">
                          <XCircle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        onClick={() =>
                          toast.info('PDF export coming soon.')
                        }
                        className="h-7 px-3 text-[11px] font-bold rounded-lg text-purple-muted-foreground opacity-40 gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
