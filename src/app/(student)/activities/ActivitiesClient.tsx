"use client";

import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { registerForEvent } from "@/lib/actions/student.actions";
import { toast } from "sonner";
import { useTransition } from "react";

interface EventItem {
  id: string;
  title: string;
  description?: string;
  eventDate?: string;
  externalUrl?: string;
  targetAudience?: string[];
}

interface ActivitiesClientProps {
  events: EventItem[];
}

export default function ActivitiesClient({ events }: ActivitiesClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleRegister = (eventId: string, eventTitle: string) => {
    startTransition(async () => {
      try {
        await registerForEvent(eventId);
        toast.success(`Registered for "${eventTitle}"`);
      } catch {
        toast.error("Registration failed. Please try again.");
      }
    });
  };

  const getDaysLeft = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-md bg-purple-primary/10 text-[10px] font-black text-purple-primary uppercase tracking-widest">Student Portal</div>
          <ArrowRight className="w-3 h-3 text-purple-muted-foreground" />
          <div className="text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest">Growth Engine</div>
        </div>
        <h1 className="text-4xl font-heading font-black text-purple-foreground flex items-center gap-3">
          Activities & Opportunities <Zap className="w-7 h-7 text-purple-primary/40" />
        </h1>
        <p className="text-purple-muted-foreground font-medium max-w-2xl leading-relaxed">
          Discover high-impact opportunities, track your institutional engagements, and claim verified achievements for your portfolio.
        </p>
      </motion.div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Available Events", value: events.length.toString(), icon: Target },
          { label: "Upcoming", value: events.filter(e => getDaysLeft(e.eventDate)).length.toString(), icon: CalendarDays },
          { label: "Open Registration", value: events.length.toString(), icon: Clock },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-4xl border border-purple-border/30 shadow-purple p-6 flex items-center gap-4 group hover:shadow-purple-lg transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-purple-secondary/80 group-hover:bg-purple-primary group-hover:text-white transition-all duration-500 shadow-sm">
                  <Icon className="w-5 h-5 text-purple-primary group-hover:text-white" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-black text-purple-foreground">{s.value}</p>
                  <p className="text-[10px] text-purple-muted-foreground font-black uppercase tracking-widest">{s.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Events from Database ────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-primary animate-pulse" />
            <h2 className="text-xl font-heading font-black text-purple-foreground">Open Institutional Ops</h2>
          </div>
          <span className="text-[10px] bg-purple-primary text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-purple-sm">
            {events.length} Active Slots
          </span>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-5xl border border-purple-border/30 shadow-purple p-16 text-center">
            <Sparkles className="w-12 h-12 text-purple-primary/20 mx-auto mb-4" />
            <p className="text-sm font-bold text-purple-muted-foreground uppercase tracking-widest">
              No active opportunities at this time
            </p>
            <p className="text-xs text-purple-muted-foreground/60 mt-2">
              New events are published regularly. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((ev, i) => {
              const daysLeft = getDaysLeft(ev.eventDate);
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div
                    className="bg-white rounded-5xl border border-purple-border/30 shadow-purple overflow-hidden
                      hover:border-purple-primary hover:shadow-purple-lg transition-all duration-500 group flex flex-col relative"
                  >
                    <div className="absolute right-0 top-0 w-32 h-32 bg-purple-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-primary/10 transition-colors" />

                    <div className="h-2 w-full bg-purple-gradient opacity-60" />
                    <div className="p-8 flex-1 flex flex-col gap-6 relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                          <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-primary/10 text-purple-primary border border-purple-primary/20">
                            Featured
                          </span>
                          <h3 className="text-lg font-heading font-black text-purple-foreground leading-tight group-hover:text-purple-primary transition-colors">
                            {ev.title}
                          </h3>
                        </div>
                        {daysLeft && (
                          <div className="shrink-0">
                            <div className="text-[10px] font-black text-purple-primary bg-purple-primary/10 px-3 py-2 rounded-xl border border-purple-primary/20 shadow-sm uppercase tracking-widest">
                              {daysLeft}d left
                            </div>
                          </div>
                        )}
                      </div>

                      {ev.description && (
                        <p className="text-sm text-purple-muted-foreground font-medium leading-relaxed flex-1">
                          {ev.description}
                        </p>
                      )}

                      {ev.eventDate && (
                        <div className="flex items-center gap-3 text-[11px] font-black text-purple-foreground/60 uppercase tracking-widest pt-4 border-t border-purple-border/10">
                          <CalendarDays className="w-4 h-4 text-purple-primary" />
                          <span>Scheduled: {new Date(ev.eventDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {ev.externalUrl && (
                          <a href={ev.externalUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-purple-border/30 hover:bg-purple-secondary/40 gap-2 text-[11px] font-black uppercase tracking-widest transition-all">
                              <ExternalLink className="w-4 h-4" /> View Details
                            </Button>
                          </a>
                        )}
                        <Button
                          onClick={() => handleRegister(ev.id, ev.title)}
                          disabled={isPending}
                          className="flex-1 h-12 rounded-2xl bg-purple-gradient text-white text-[11px] font-black uppercase tracking-widest gap-2 shadow-purple border-none hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isPending ? "Registering..." : "Register"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex items-center justify-center gap-4 text-[10px] text-purple-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
        <span>Verified Opportunities</span>
        <div className="w-1 h-1 rounded-full bg-purple-muted-foreground" />
        <span>Institutional Verification</span>
        <div className="w-1 h-1 rounded-full bg-purple-muted-foreground" />
        <span>Smart Notifications</span>
      </div>
    </div>
  );
}
