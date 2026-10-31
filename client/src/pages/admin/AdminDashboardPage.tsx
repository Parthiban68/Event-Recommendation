import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileEdit,
  History,
  Layers3,
  Loader2,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/admin/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchDashboardStats,
  fetchRecentAdminEvents,
  getApiErrorMessage,
} from "../../services/api";
import type { AdminEvent, DashboardStats } from "../../types";
import { formatDateTime, formatEventDate } from "../../utils/format";

const statCards = [
  {
    key: "total",
    label: "Total events",
    icon: Layers3,
    className: "bg-slate-900 text-white",
    iconClassName: "bg-white/10 text-white",
  },
  {
    key: "published",
    label: "Published",
    icon: CheckCircle2,
    className: "bg-white text-slate-950",
    iconClassName: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "draft",
    label: "Drafts",
    icon: FileEdit,
    className: "bg-white text-slate-950",
    iconClassName: "bg-amber-50 text-amber-600",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: CalendarDays,
    className: "bg-white text-slate-950",
    iconClassName: "bg-blue-50 text-blue-600",
  },
  {
    key: "past",
    label: "Past",
    icon: History,
    className: "bg-white text-slate-950",
    iconClassName: "bg-slate-100 text-slate-500",
  },
] as const;

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([fetchDashboardStats(), fetchRecentAdminEvents()])
      .then(([nextStats, nextEvents]) => {
        if (!active) return;
        setStats(nextStats);
        setRecentEvents(nextEvents);
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
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey((key) => key + 1), []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back, {admin?.name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Track the catalogue health, review recent changes and move drafts
            toward publication.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={retry}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
          <Link
            to="/admin/events/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Create event
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={retry} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key] : null;

          return (
            <div
              key={card.key}
              className={`rounded-2xl border border-slate-200 p-4 shadow-sm ${card.className}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-xs font-bold uppercase tracking-wide ${
                    card.key === "total" ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {card.label}
                </p>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconClassName}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight">
                {loading && value === null ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-300" />
                ) : (
                  (value ?? 0)
                )}
              </p>
              <p
                className={`mt-1 text-xs ${
                  card.key === "total" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {card.key === "upcoming" || card.key === "past"
                  ? "Published events"
                  : "All time"}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-950">
              Recent publishing activity
            </h2>
            <p className="text-xs text-slate-500">
              The most recently updated events across drafts and publications.
            </p>
          </div>
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading && recentEvents.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Loading recent events...
          </div>
        ) : recentEvents.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Clock3}
              title="No events yet"
              description="Create your first draft to start building the public catalogue."
              action={
                <Link
                  to="/admin/events/create"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create event
                </Link>
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
                    Event date
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:table-cell">
                    Updated
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70">
                    <td className="max-w-xs px-5 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {event.category || "Uncategorised"}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="hidden px-5 py-3 text-sm text-slate-600 md:table-cell">
                      {formatEventDate(event.eventDate ?? "")}
                    </td>
                    <td className="hidden px-5 py-3 text-xs text-slate-500 lg:table-cell">
                      {formatDateTime(event.updatedAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/admin/events/${event.id}/edit`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
