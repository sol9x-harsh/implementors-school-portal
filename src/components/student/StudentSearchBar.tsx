"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

export function StudentSearchBar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/activities?q=${encodeURIComponent(query.trim())}`);
    });
  };

  const handleClear = () => {
    setQuery("");
    startTransition(() => {
      router.push("/activities");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 max-w-md relative group"
    >
      <div className="relative">
        {isPending ? (
          <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-primary animate-spin" />
        ) : (
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-muted-foreground/60 group-focus-within:text-purple-primary transition-colors pointer-events-none" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activities..."
          className="w-full h-9 bg-purple-secondary/30 border border-purple-border/40 rounded-xl py-2 pl-10 pr-9 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-purple-primary/20 focus:border-purple-primary/50 focus:bg-white
            placeholder:text-purple-muted-foreground/50 transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-muted-foreground/50 hover:text-purple-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
