import { Compass, Loader2, SearchX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import EventCard from "../components/events/EventCard";
import FilterBar from "../components/home/FilterBar";
import SearchBar from "../components/home/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { EventGridSkeleton } from "../components/ui/LoadingSkeletons";
import { EMPTY_FILTERS } from "../constants/interests";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  fetchEvents,
  getApiErrorMessage,
  isCanceledError,
} from "../services/api";
import type {
  EventFilters,
  EventItem,
  FilterState,
  PaginationMeta,
} from "../types";

const PAGE_SIZE = 9;

export default function EventsPage() {
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS });
  const debouncedSearch = useDebouncedValue(filters.search);
  const [page, setPage] = useState(1);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const effectiveFilters = useMemo<EventFilters>(() => {
    const next: EventFilters = {};
    const search = debouncedSearch.trim();

    if (search) next.search = search;
    if (filters.category) next.category = filters.category;
    if (filters.technology) next.technology = filters.technology;
    if (filters.dateFrom) next.dateFrom = filters.dateFrom;
    if (filters.dateTo) next.dateTo = filters.dateTo;
    if (filters.format !== "all") next.isOnline = filters.format === "online";

    return next;
  }, [
    debouncedSearch,
    filters.category,
    filters.technology,
    filters.dateFrom,
    filters.dateTo,
    filters.format,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchEvents(
      { ...effectiveFilters, page, limit: PAGE_SIZE },
      controller.signal,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setEvents(result.events);
        setMeta(result.meta);
      })
      .catch((loadError: unknown) => {
        if (!isCanceledError(loadError)) {
          setError(getApiErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [effectiveFilters, page, retryKey]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.category) count += 1;
    if (filters.technology) count += 1;
    if (filters.format !== "all") count += 1;
    if (filters.dateFrom) count += 1;
    if (filters.dateTo) count += 1;
    return count;
  }, [filters]);

  const handleFilterChange = useCallback((patch: Partial<FilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
    setPage(1);
  }, []);

  const handleRetry = useCallback(() => setRetryKey((key) => key + 1), []);

  function goToPage(nextPage: number) {
    setPage(nextPage);
    window.setTimeout(() => {
      document
        .getElementById("event-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  const total = meta?.total ?? events.length;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Event catalogue
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Discover upcoming developer events
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Browse published events only. Search by keyword, narrow down by
            technology, category, date or format, or build a profile to get
            explainable recommendations.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="space-y-3">
          <SearchBar
            value={filters.search}
            onChange={(search) => handleFilterChange({ search })}
          />
          <FilterBar
            filters={filters}
            activeCount={activeFilterCount}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>

        <section id="event-results" className="mt-8 scroll-mt-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Upcoming events
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {loading && events.length === 0
                  ? "Loading the catalogue..."
                  : `${total} event${total === 1 ? "" : "s"} available`}
              </p>
            </div>
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                Updating
              </span>
            ) : null}
          </div>

          {error ? (
            <div className="mt-5">
              <ErrorState message={error} onRetry={handleRetry} />
            </div>
          ) : null}

          <div className="mt-5" aria-busy={loading}>
            {loading && events.length === 0 ? (
              <EventGridSkeleton count={PAGE_SIZE} />
            ) : events.length === 0 && !error ? (
              <EmptyState
                icon={activeFilterCount > 0 ? SearchX : Compass}
                title={
                  activeFilterCount > 0
                    ? "No events match these filters"
                    : "No upcoming events"
                }
                description={
                  activeFilterCount > 0
                    ? "Try removing a filter or searching for a different technology."
                    : "There are no published upcoming events right now. Check back soon."
                }
                action={
                  activeFilterCount > 0 ? (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Clear filters
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div
                className={
                  loading
                    ? "grid gap-5 opacity-60 transition-opacity md:grid-cols-2 xl:grid-cols-3"
                    : "grid gap-5 transition-opacity md:grid-cols-2 xl:grid-cols-3"
                }
              >
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 ? (
            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
              aria-label="Event pages"
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (pageNumber) =>
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - page) <= 1,
                )
                .map((pageNumber, index, list) => {
                  const previous = list[index - 1];
                  const showGap =
                    previous !== undefined && pageNumber - previous > 1;

                  return (
                    <span key={pageNumber} className="flex items-center gap-2">
                      {showGap ? (
                        <span className="text-sm text-slate-400">...</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => goToPage(pageNumber)}
                        disabled={loading}
                        aria-current={pageNumber === page ? "page" : undefined}
                        className={
                          pageNumber === page
                            ? "rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white"
                            : "rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        }
                      >
                        {pageNumber}
                      </button>
                    </span>
                  );
                })}
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages || loading}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}
