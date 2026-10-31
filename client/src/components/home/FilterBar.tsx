import { CalendarDays, MapPin, RotateCcw, SlidersHorizontal, Wifi } from "lucide-react";
import { CATEGORIES, TECHNOLOGY_TAGS } from "../../constants/interests";
import type { EventFormat, FilterState } from "../../types";
import { cn } from "../../utils/cn";

interface FilterBarProps {
  filters: FilterState;
  activeCount: number;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
}

const formatOptions: Array<{
  value: EventFormat;
  label: string;
  icon: typeof Wifi;
}> = [
  { value: "all", label: "All formats", icon: SlidersHorizontal },
  { value: "online", label: "Online", icon: Wifi },
  { value: "in-person", label: "In person", icon: MapPin },
];

export default function FilterBar({
  filters,
  activeCount,
  onChange,
  onClear,
}: FilterBarProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Filters
            {activeCount > 0 ? (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                {activeCount}
              </span>
            ) : null}
          </div>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="filter-category"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Category
            </label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={(event) => onChange({ category: event.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-technology"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Technology
            </label>
            <select
              id="filter-technology"
              value={filters.technology}
              onChange={(event) => onChange({ technology: event.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All technologies</option>
              {TECHNOLOGY_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-date-from"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              From
            </label>
            <div className="relative">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="filter-date-from"
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(event) => onChange({ dateFrom: event.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="filter-date-to"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              To
            </label>
            <div className="relative">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="filter-date-to"
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(event) => onChange({ dateTo: event.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Event format">
          {formatOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filters.format === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange({ format: option.value })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
