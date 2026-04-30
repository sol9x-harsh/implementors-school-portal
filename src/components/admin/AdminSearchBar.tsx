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
    <form onSubmit={handleSubmit} className="flex-1 max-w-xs relative group">
      <div className="relative">
        {isPending ? (
          <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-primary animate-spin" />
        ) : (
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-muted-foreground/50 group-focus-within:text-purple-primary transition-colors pointer-events-none" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
          className="w-full h-7 bg-white border border-purple-border/40 rounded-lg py-1 pl-8 pr-7 text-[12px] font-medium
            focus:outline-none focus:ring-1 focus:ring-purple-primary/30 focus:border-purple-border/70
            placeholder:text-purple-muted-foreground/50 transition-all duration-150"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-muted-foreground/40 hover:text-purple-primary transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </form>
  );
}
