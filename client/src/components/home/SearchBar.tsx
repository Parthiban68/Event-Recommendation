import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <label htmlFor="event-search" className="sr-only">
        Search events
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id="event-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search events by title or description..."
        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
