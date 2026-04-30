"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Clock,
  History,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  pastEvents: EventItem[];
  registrations: Record<string, string>;
}

const ITEMS_PER_PAGE = 6;

export default function ActivitiesClient({
  events,
  pastEvents,
  registrations,
}: ActivitiesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [localRegistrations, setLocalRegistrations] = useState(registrations);
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

  // Sync search input with URL param
  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
    setCurrentPage(1);
  }, [searchParams]);

  const baseEvents = activeTab === "active" ? events : pastEvents;

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return baseEvents;
    const q = searchQuery.toLowerCase();
    return baseEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description?.toLowerCase() ?? "").includes(q)
    );
  }, [baseEvents, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const handleRegister = (eventId: string, eventTitle: string) => {
    setRegisteringId(eventId);
    startTransition(async () => {
      try {
        await registerForEvent(eventId);
        setLocalRegistrations((prev) => ({ ...prev, [eventId]: "REGISTERED" }));
        toast.success(`Registered for "${eventTitle}"`);
      } catch {
        toast.error("Registration failed. Please try again.");
      } finally {
        setRegisteringId(null);
      }
    });
  };

  const getDaysLeft = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  const handleTabChange = (tab: "active" | "past") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    router.push("/activities");
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto pb-20">

      {/* ── Page Header ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest">
          <span className="text-purple-primary">Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span>Activities</span>
        </div>
        <h1 className="text-3xl font-heading font-black text-purple-foreground">
          Activities & Opportunities
        </h1>
        <p className="text-purple-muted-foreground text-sm font-medium">
          Discover opportunities, track your engagements, and claim verified achievements.
        </p>
      </motion.div>

      {/* ── Tabs + Search Row ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-purple-secondary/30 rounded-xl border border-purple-border/20 shrink-0">
          <button
            onClick={() => handleTabChange("active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200
              ${activeTab === "active" ? "bg-white shadow-sm text-purple-primary" : "text-purple-muted-foreground hover:text-purple-foreground"}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Active ({events.length})
          </button>
          <button
            onClick={() => handleTabChange("past")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200
              ${activeTab === "past" ? "bg-white shadow-sm text-purple-primary" : "text-purple-muted-foreground hover:text-purple-foreground"}`}
          >
            <History className="w-3.5 h-3.5" />
            Past ({pastEvents.length})
          </button>
        </div>

        {/* Inline search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-muted-foreground/50 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Filter activities..."
            className="w-full h-10 bg-white border border-purple-border/30 rounded-xl pl-9 pr-9 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-purple-primary/20 focus:border-purple-primary/50
              placeholder:text-purple-muted-foreground/40 transition-all"
          />
          {searchQuery && (
            <button onClick={handleSearchClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-muted-foreground/40 hover:text-purple-primary">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Events Grid ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-purple-foreground uppercase tracking-widest">
            {searchQuery ? `Results for "${searchQuery}"` : activeTab === "active" ? "Available Now" : "Past Activities"}
          </h2>
          <span className="text-[10px] bg-purple-primary/10 text-purple-primary px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-purple-primary/15">
            {filteredEvents.length} {filteredEvents.length === 1 ? "item" : "items"}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {paginatedEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl border border-purple-border/20 p-16 text-center space-y-3"
            >
              {searchQuery ? (
                <>
                  <Search className="w-10 h-10 text-purple-primary/20 mx-auto" />
                  <p className="text-sm font-bold text-purple-muted-foreground">No results for "{searchQuery}"</p>
                  <button onClick={handleSearchClear} className="text-[11px] text-purple-primary font-black uppercase tracking-widest hover:underline">
                    Clear search
                  </button>
                </>
              ) : activeTab === "active" ? (
                <>
                  <Sparkles className="w-10 h-10 text-purple-primary/20 mx-auto" />
                  <p className="text-sm font-bold text-purple-muted-foreground">No active opportunities right now</p>
                  <p className="text-xs text-purple-muted-foreground/60">New events are published regularly. Check back soon.</p>
                </>
              ) : (
                <>
                  <History className="w-10 h-10 text-purple-primary/20 mx-auto" />
                  <p className="text-sm font-bold text-purple-muted-foreground">No past activities found</p>
                  <p className="text-xs text-purple-muted-foreground/60">Completed events will appear here.</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${currentPage}-${searchQuery}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid md:grid-cols-2 gap-5"
            >
              {paginatedEvents.map((ev, i) => {
                const daysLeft = getDaysLeft(ev.eventDate);
                const isRegistered = !!localRegistrations[ev.id];
                const isExpired = activeTab === "past";

                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className={`bg-white rounded-3xl border shadow-purple overflow-hidden
                        hover:shadow-purple-lg transition-all duration-400 group flex flex-col
                        ${isExpired ? "border-purple-border/15 opacity-75" : "border-purple-border/30 hover:border-purple-primary/40"}`}
                    >
                      {/* Top accent bar */}
                      <div className={`h-1 w-full ${isExpired ? "bg-purple-muted-foreground/20" : "bg-purple-gradient"}`} />

                      <div className="p-6 flex-1 flex flex-col gap-4">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Status badge */}
                            {isExpired ? (
                              <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-secondary text-purple-muted-foreground border border-purple-border/20">
                                Ended
                              </span>
                            ) : isRegistered ? (
                              <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                ✓ Registered
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-primary/8 text-purple-primary border border-purple-primary/15">
                                Open
                              </span>
                            )}
                            <h3 className="text-[15px] font-heading font-black text-purple-foreground leading-snug group-hover:text-purple-primary transition-colors">
                              {ev.title}
                            </h3>
                          </div>
                          {daysLeft && !isExpired && (
                            <div className="shrink-0 text-[10px] font-black text-purple-primary bg-purple-primary/8 px-2.5 py-1.5 rounded-lg border border-purple-primary/15 uppercase tracking-widest">
                              {daysLeft}d left
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {ev.description && (
                          <p className="text-sm text-purple-muted-foreground font-medium leading-relaxed line-clamp-2 flex-1">
                            {ev.description}
                          </p>
                        )}

                        {/* Date */}
                        {ev.eventDate && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-purple-muted-foreground/70 pt-3 border-t border-purple-border/10">
                            <CalendarDays className="w-3.5 h-3.5 text-purple-primary/60" />
                            {isExpired ? "Ended " : "Deadline "}
                            {new Date(ev.eventDate).toLocaleDateString("en-US", {
                              weekday: "short", day: "numeric", month: "long", year: "numeric",
                            })}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2.5 pt-1">
                          {ev.externalUrl && (
                            <a href={ev.externalUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                              <Button
                                variant="outline"
                                className="w-full h-10 rounded-xl border-purple-border/30 hover:bg-purple-secondary/40 gap-2 text-[11px] font-black uppercase tracking-widest"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Visit Link
                              </Button>
                            </a>
                          )}
                          {!isExpired && (
                            isRegistered ? (
                              <Button
                                disabled
                                className="flex-1 h-10 rounded-xl bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest gap-2 border border-emerald-200 cursor-default"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Registered
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleRegister(ev.id, ev.title)}
                                disabled={isPending && registeringId === ev.id}
                                className="flex-1 h-10 rounded-xl bg-purple-gradient text-white text-[11px] font-black uppercase tracking-widest gap-2 shadow-purple border-none hover:scale-[1.02] active:scale-95 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {isPending && registeringId === ev.id ? "Joining..." : "Register"}
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pagination ──────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl border-purple-border/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all duration-200
                    ${currentPage === page ? "bg-purple-primary text-white shadow-purple-sm" : "text-purple-muted-foreground hover:bg-purple-secondary/50"}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl border-purple-border/30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
