"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

export function AdminSearchBar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/admin/students?q=${encodeURIComponent(query.trim())}`);
    });
  };

  const handleClear = () => {
    setQuery("");
    startTransition(() => {
      router.push("/admin/students");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-sm relative group">
      <div className="relative">
        {isPending ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-primary animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-muted-foreground/50 group-focus-within:text-purple-primary transition-colors pointer-events-none" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
          className="w-full h-9 bg-white border border-purple-border/30 rounded-xl py-1 pl-9 pr-8 text-[13px] font-medium
            focus:outline-none focus:ring-2 focus:ring-purple-primary/10 focus:border-purple-primary/40
            placeholder:text-purple-muted-foreground/40 transition-all duration-150 shadow-purple-xs group-hover:border-purple-border/60"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-muted-foreground/30 hover:text-purple-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
