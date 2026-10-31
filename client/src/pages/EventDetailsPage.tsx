import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Sparkles,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CategoryBadge, FormatBadge, TagChip } from "../components/ui/Badge";
import ErrorState from "../components/ui/ErrorState";
import { DetailsSkeleton } from "../components/ui/LoadingSkeletons";
import {
  fetchEvent,
  getApiErrorMessage,
  isCanceledError,
} from "../services/api";
import type { EventItem } from "../types";
import {
  formatEventDate,
  formatEventTime,
  isHttpUrl,
} from "../utils/format";

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!id) {
        setError("No event id was provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchEvent(id, controller.signal);
        if (!controller.signal.aborted) {
          setEvent(result);
        }
      } catch (loadError) {
        if (!isCanceledError(loadError)) {
          setError(getApiErrorMessage(loadError));
          setEvent(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [id, retryKey]);

  const registrationValid = event ? isHttpUrl(event.registrationUrl) : false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to events
      </Link>

      <div className="mt-6">
        {loading ? <DetailsSkeleton /> : null}

        {!loading && error ? (
          <div className="mx-auto max-w-2xl">
            <ErrorState
              message={error}
              onRetry={() => setRetryKey((key) => key + 1)}
            />
            <div className="mt-5 text-center">
              <Link
                to="/events"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Return to the event catalogue
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && event ? (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <CategoryBadge category={event.category} />
              <FormatBadge isOnline={event.isOnline} />
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              {event.title}
            </h1>

            {event.summary ? (
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                {event.summary}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  className="h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                {formatEventDate(event.eventDate, "long")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {formatEventTime(event.startTime, event.endTime)}
                {event.timezone ? ` (${event.timezone})` : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {event.location}
              </span>
            </div>

            {event.bannerUrl && isHttpUrl(event.bannerUrl) ? (
              <img
                src={event.bannerUrl}
                alt=""
                className="mt-7 max-h-80 w-full rounded-2xl border border-slate-200 object-cover shadow-sm"
              />
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold tracking-tight text-slate-950">
                    About this event
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {event.description}
                  </p>
                </section>

                <div className="grid gap-6 sm:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">
                      Required skills
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {event.requiredSkills.map((skill) => (
                        <TagChip key={skill} tone="skill">
                          {skill}
                        </TagChip>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">
                      Topics covered
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {event.interests.map((interest) => (
                        <TagChip key={interest} tone="interest">
                          {interest}
                        </TagChip>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900">
                    Event at a glance
                  </h2>
                  <div className="mt-3 space-y-2.5">
                    {event.requiredSkills.map((skill) => (
                      <p
                        key={skill}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                        Required skill: {skill}
                      </p>
                    ))}
                    <p className="flex items-start gap-2 text-sm text-slate-600">
                      {event.isOnline ? (
                        <Wifi
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <MapPin
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                      )}
                      {event.isOnline
                        ? "Attend online from anywhere"
                        : `Join in person in ${event.location}`}
                    </p>
                  </div>
                </section>
              </div>

              <aside className="lg:sticky lg:top-24">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Registration
                      </h2>
                      <p className="text-xs text-slate-500">
                        Continue on the event page
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-500">Date</dt>
                      <dd className="text-right font-medium text-slate-900">
                        {formatEventDate(event.eventDate)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-500">Time</dt>
                      <dd className="text-right font-medium text-slate-900">
                        {formatEventTime(event.startTime, event.endTime)}
                        {event.timezone ? (
                          <span className="block text-xs font-normal text-slate-500">
                            {event.timezone}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-500">Format</dt>
                      <dd className="text-right font-medium text-slate-900">
                        {event.isOnline ? "Online" : "In person"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-500">Location</dt>
                      <dd className="max-w-[190px] text-right font-medium text-slate-900">
                        {event.location}
                      </dd>
                    </div>
                  </dl>

                  {registrationValid ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      Register for this event
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">
                      Registration link is unavailable for this event.
                    </p>
                  )}

                  <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                    Opens the registration page in a new tab.
                  </p>
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
