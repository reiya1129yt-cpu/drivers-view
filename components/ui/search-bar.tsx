"use client";

import { useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocate: () => void;
  isLocating?: boolean;
}

export default function SearchBar({
  onSearch,
  onLocate,
  isLocating,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="場所を検索..."
          className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <button
        type="button"
        onClick={onLocate}
        disabled={isLocating}
        className="flex items-center justify-center rounded-lg border border-input bg-card px-3 py-2 text-card-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        title="現在地を取得"
      >
        {isLocating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
