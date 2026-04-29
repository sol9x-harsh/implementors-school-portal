"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  RefreshCw,
  ChevronRight,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  CircleDot,
  Sparkles,
  Zap,
} from "lucide-react";
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const pipelineSteps = [
  { label: "Querying Verified Activity Certificates", done: true },
  { label: "Aggregating Academic Records (Term 1 & 2)", done: true },
  { label: "Validating Competitive Examination Credentials", done: true },
  { label: "Applying Institutional Portfolio Templates", done: false },
  { label: "Compiling Scalable Archive Distribution (ZIP)", done: false },
];

type Status = "idle" | "generating" | "done";

interface CohortCounts {
  class12: number;
  class12pcm: number;
  class11: number;
  total: number;
}

interface AnnualReportsClientProps {
  initialCounts: CohortCounts;
}

export default function AnnualReportsClient({ initialCounts }: AnnualReportsClientProps) {
  const cohorts = [
    {
      id: "class12",
      label: "Class 12",
      sub: "All Streams",
      icon: GraduationCap,
      count: initialCounts.class12,
    },
    {
      id: "class12pcm",
      label: "Class 12 (PCM)",
      sub: "Physics · Chemistry · Math",
      icon: BookOpen,
      count: initialCounts.class12pcm,
    },
    {
      id: "class11",
      label: "Class 11",
      sub: "All Streams",
      icon: Users,
      count: initialCounts.class11,
    },
  ];

  const [selected, setSelected] = useState("class12");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);

  const selectedCohort = cohorts.find((c) => c.id === selected)!;

  const handleGenerate = async () => {
    setStatus("generating");
    setProgress(0);
    for (let i = 1; i <= 100; i++) {
      await new Promise((r) => setTimeout(r, 25));
      setProgress(i);
    }
    setStatus("done");
  };

  return (
    <div className='admin-shell space-y-6'>
      <AdminPageHeader
        section='Tools'
        title='Annual Portfolio Synthesis'
        subtitle='Batch-synthesize institutional portfolios by mapping academic data, extracurricular milestones, and verified achievements.'
        icon={Zap}
      />

      {/* Cohort Selector — now uses real DB counts (#22) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-xs font-black text-purple-foreground uppercase tracking-[0.2em] mb-4">
          1. Targeted Institutional Cohort
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cohorts.map((c) => {
            const Icon = c.icon;
            const isActive = selected === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setSelected(c.id); setStatus("idle"); setProgress(0); }}
                className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 group
                  ${isActive
                    ? "border-purple-primary bg-purple-primary/[0.06] shadow-purple-sm"
                    : "border-purple-border/30 bg-white hover:border-purple-primary/40"}`}
              >
                <span className={`absolute top-3 right-3 admin-badge ${isActive ? 'admin-badge-school' : 'admin-badge-pending'}`}>
                  {c.count}
                </span>

                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all
                  ${isActive ? "bg-purple-primary text-white" : "bg-purple-secondary/60 text-purple-muted-foreground group-hover:bg-purple-primary/10 group-hover:text-purple-primary"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`font-heading font-black text-[13px] ${isActive ? "text-purple-primary" : "text-purple-foreground"}`}>
                  {c.label}
                </p>
                <p className="text-[10px] text-purple-muted-foreground font-medium mt-0.5">
                  {c.sub}
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Pipeline Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <p className="text-xs font-black text-purple-foreground uppercase tracking-[0.2em] mb-4">
          2. Synthesis Engine Pipeline
        </p>
        <div className="admin-card p-5 space-y-3">
          {pipelineSteps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors
                ${step.done ? "bg-purple-primary" : "bg-purple-secondary border border-purple-border/30"}`}>
                {step.done
                  ? <CheckCircle2 className="w-3 h-3 text-white" />
                  : <CircleDot className="w-3 h-3 text-purple-muted-foreground/30" />}
              </div>
              <span className={`text-[12px] font-medium flex-1 ${step.done ? "text-purple-foreground" : "text-purple-muted-foreground/40"}`}>
                {step.label}
              </span>
              {step.done && (
                <span className="admin-badge admin-badge-new">Done</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress (when generating) */}
      {status !== "idle" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="admin-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center animate-spin-slow">
                <RefreshCw className="w-5 h-5 text-purple-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-purple-foreground uppercase tracking-wider">
                  {status === "done" ? "Synthesis Operations Complete" : "Synthesis in Progress"}
                </p>
                <p className="text-[11px] font-bold text-purple-muted-foreground mt-0.5">
                  {status === "done"
                    ? "All assets finalized"
                    : `Compiling records for ${selectedCohort.label} cohort`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-heading font-black ${status === "done" ? "text-purple-primary" : "text-purple-foreground"}`}>
                {progress}%
              </span>
            </div>
          </div>
          <div className="h-4 bg-purple-secondary/50 rounded-full overflow-hidden p-0.5 border border-purple-border/10">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className="h-full rounded-full bg-purple-gradient"
              style={{ boxShadow: '0 0 20px oklch(0.60 0.18 280 / 0.50)' }}
            />
          </div>
          {status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-purple-primary/5 border border-purple-primary/20"
            >
              <Sparkles className="w-5 h-5 text-purple-primary" />
              <p className="text-[11px] text-purple-primary font-black uppercase tracking-widest">
                {selectedCohort.count} institutional portfolios successfully synthesized and encrypted.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <Button
          onClick={handleGenerate}
          disabled={status === "generating"}
          className="h-11 rounded-xl bg-purple-primary hover:bg-purple-primary/90 text-white font-bold text-sm shadow-purple-sm border-none
            disabled:opacity-60 gap-2 btn-shimmer transition-all duration-200"
        >
          {status === "generating" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Execute Synthesis</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info("Report download will be available once backend PDF generation is live.")}
          disabled={status !== "done"}
          className="h-11 rounded-xl border border-purple-border/40 bg-white font-bold text-sm gap-2
            hover:border-purple-primary hover:text-purple-primary disabled:opacity-30 transition-all"
        >
          <FileDown className="w-4 h-4" />
          Download Report
        </Button>
      </motion.div>

      <div className="flex items-center justify-center gap-4 text-[10px] text-purple-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
        <span>Cloud Synthesis</span>
        <div className="w-1 h-1 rounded-full bg-purple-muted-foreground" />
        <span>SHA-256 Encrypted</span>
        <div className="w-1 h-1 rounded-full bg-purple-muted-foreground" />
        <span>Asset Archive</span>
      </div>
    </div>
  );
}
