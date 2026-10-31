import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  Loader2,
  PlusCircle,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/admin/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  deleteAdminEvent,
  fetchAdminEvents,
  getApiErrorMessage,
  updateAdminEventStatus,
} from "../../services/api";
import type { AdminEvent, EventStatus, PaginationMeta } from "../../types";
import { formatDateTime, formatEventDate } from "../../utils/format";

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");
  const [page, setPage] = useState(1);

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchAdminEvents({
      page,
      limit: 10,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter || undefined,
    })
      .then((result) => {
        if (!active) return;
        setEvents(result.events);
        setMeta(result.meta);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(getApiErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, statusFilter, retryKey]);

  const refresh = useCallback(() => setRetryKey((key) => key + 1), []);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: EventStatus | "") {
    setStatusFilter(value);
    setPage(1);
  }

  async function handleToggleStatus(event: AdminEvent) {
    const nextStatus: EventStatus =
      event.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    if (
      nextStatus === "DRAFT" &&
      !window.confirm(
        `Unpublish "${event.title}"? It will disappear from the public catalogue.`,
      )
    ) {
      return;
    }

    setActionId(event.id);
    setActionError(null);

    try {
      await updateAdminEventStatus(event.id, nextStatus);
      refresh();
    } catch (actionFailure) {
      setActionError(getApiErrorMessage(actionFailure));
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(event: AdminEvent) {
    if (
      !window.confirm(
        `Delete "${event.title}" permanently? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setActionId(event.id);
    setActionError(null);

    try {
      await deleteAdminEvent(event.id);
      if (events.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        refresh();
      }
    } catch (actionFailure) {
      setActionError(getApiErrorMessage(actionFailure));
    } finally {
      setActionId(null);
    }
  }

  const hasFilters = Boolean(search.trim() || statusFilter);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Catalogue
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Manage events
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Draft, publish and retire events. Public listing and recommendation
            endpoints only expose published events.
          </p>
        </div>
        <Link
          to="/admin/events/create"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          Create event
        </Link>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="flex-1">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="rounded p-0.5 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="admin-event-search" className="sr-only">
              Search events
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="admin-event-search"
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by title, summary or category..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="admin-status-filter"
              className="text-xs font-semibold text-slate-600"
            >
              Status
            </label>
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(event) =>
                handleStatusChange(event.target.value as EventStatus | "")
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  handleSearchChange("");
                  handleStatusChange("");
                }}
                className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5">
          <ErrorState message={error} onRetry={refresh} />
        </div>
      ) : null}

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <p className="text-sm font-semibold text-slate-800">
            {meta ? `${meta.total} event${meta.total === 1 ? "" : "s"}` : "Events"}
          </p>
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              Loading
            </span>
          ) : null}
        </div>

        {loading && events.length === 0 ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-4 px-5 py-4"
              >
                <div className="h-9 w-9 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/5 rounded bg-slate-200" />
                  <div className="h-3 w-1/4 rounded bg-slate-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={CalendarDays}
              title={hasFilters ? "No events match these filters" : "No events yet"}
              description={
                hasFilters
                  ? "Try a different search term or status filter."
                  : "Create a draft event and publish it when the details are ready."
              }
              action={
                hasFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleSearchChange("");
                      handleStatusChange("");
                    }}
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link
                    to="/admin/events/create"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create event
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Event
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 md:table-cell">
                    Date & format
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 xl:table-cell">
                    Updated
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => {
                  const busy = actionId === event.id;

                  return (
                    <tr key={event.id} className="hover:bg-slate-50/70">
                      <td className="max-w-xs px-5 py-4">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {event.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {event.category || "Uncategorised"} ·{" "}
                          {event.isOnline ? "Online" : "In person"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="hidden px-5 py-4 text-sm text-slate-600 md:table-cell">
                        <p>{formatEventDate(event.eventDate ?? "")}</p>
                        <p className="text-xs text-slate-400">
                          {event.startTime || "Time TBD"}
                          {event.timezone ? ` · ${event.timezone}` : ""}
                        </p>
                      </td>
                      <td className="hidden px-5 py-4 text-xs text-slate-500 xl:table-cell">
                        {formatDateTime(event.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <FileEdit className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleToggleStatus(event)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          >
                            {busy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UploadCloud className="h-3.5 w-3.5" />
                            )}
                            {event.status === "PUBLISHED"
                              ? "Unpublish"
                              : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(event)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-xs text-slate-500">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= meta.totalPages || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
