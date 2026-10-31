import { Compass, Loader2, SearchX, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import EventCard from "../components/events/EventCard";
import FilterBar from "../components/home/FilterBar";
import Hero from "../components/home/Hero";
import HowItWorks from "../components/home/HowItWorks";
import InterestSelector from "../components/home/InterestSelector";
import SearchBar from "../components/home/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { EventGridSkeleton } from "../components/ui/LoadingSkeletons";
import { EMPTY_FILTERS, SAMPLE_PROFILE } from "../constants/interests";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  fetchEvents,
  fetchRecommendations,
  getApiErrorMessage,
  isCanceledError,
} from "../services/api";
import type {
  CandidateProfile,
  EventFilters,
  EventItem,
  FilterState,
  PaginationMeta,
  Recommendation,
  RecommendationMeta,
} from "../types";

function sameSelection(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((item) => set.has(item));
}

function toggleTag(list: string[], tag: string): string[] {
  return list.includes(tag)
    ? list.filter((item) => item !== tag)
    : [...list, tag];
}

export default function HomePage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [eventsMeta, setEventsMeta] = useState<PaginationMeta | null>(null);
  const [recommendationMeta, setRecommendationMeta] =
    useState<RecommendationMeta | null>(null);

  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS });
  const debouncedSearch = useDebouncedValue(filters.search);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
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

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (profile) {
          const result = await fetchRecommendations(
            {
              skills: profile.skills,
              interests: profile.interests,
              filters: effectiveFilters,
            },
            controller.signal,
          );

          if (!controller.signal.aborted) {
            setRecommendations(result.recommendations);
            setRecommendationMeta(result.meta);
            setEvents([]);
            setEventsMeta(null);
          }
        } else {
          const result = await fetchEvents(
            { ...effectiveFilters, page: 1, limit: 50 },
            controller.signal,
          );

          if (!controller.signal.aborted) {
            setEvents(result.events);
            setEventsMeta(result.meta);
            setRecommendations([]);
            setRecommendationMeta(null);
          }
        }
      } catch (loadError) {
        if (!isCanceledError(loadError)) {
          setError(getApiErrorMessage(loadError));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [profile, effectiveFilters, retryKey]);

  const profileDirty = useMemo(() => {
    if (!profile) return false;
    return (
      !sameSelection(profile.skills, skills) ||
      !sameSelection(profile.interests, interests)
    );
  }, [profile, skills, interests]);

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

  const resultCount = profile ? recommendations.length : events.length;
  const totalCount = profile
    ? (recommendationMeta?.total ?? recommendations.length)
    : (eventsMeta?.total ?? events.length);

  const handleToggleSkill = useCallback((tag: string) => {
    setSkills((current) => toggleTag(current, tag));
    setFormError(null);
  }, []);

  const handleToggleInterest = useCallback((tag: string) => {
    setInterests((current) => toggleTag(current, tag));
    setFormError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (skills.length === 0 && interests.length === 0) {
      setFormError(
        "Select at least one skill or interest before finding events.",
      );
      return;
    }

    setFormError(null);
    setProfile({ skills: [...skills], interests: [...interests] });
    window.setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [skills, interests]);

  const handleUseSample = useCallback(() => {
    setSkills([...SAMPLE_PROFILE.skills]);
    setInterests([...SAMPLE_PROFILE.interests]);
    setFormError(null);
  }, []);

  const handleClearProfile = useCallback(() => {
    setSkills([]);
    setInterests([]);
    setFormError(null);
    setProfile(null);
    setRecommendations([]);
    setRecommendationMeta(null);
  }, []);

  const handleFilterChange = useCallback((patch: Partial<FilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
  }, []);

  const handleRetry = useCallback(() => {
    setRetryKey((key) => key + 1);
  }, []);

  const emptyState = profile ? (
    <EmptyState
      icon={SearchX}
      title="No events match this search"
      description={
        activeFilterCount > 0
          ? "Your profile is ready, but the current filters exclude every upcoming event. Try clearing one or more filters."
          : "There are no upcoming events that match your current profile. Try adding more skills or interests."
      }
      action={
        activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Clear filters
          </button>
        ) : (
          <a
            href="#match"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Update profile
          </a>
        )
      }
    />
  ) : (
    <EmptyState
      icon={Compass}
      title="No events found"
      description={
        activeFilterCount > 0
          ? "No events match the selected search and filters. Try broadening your criteria."
          : "There are no events in the database yet. Run the seed script to load the sample event catalogue."
      }
      action={
        activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Clear filters
          </button>
        ) : undefined
      }
    />
  );

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <InterestSelector
          skills={skills}
          interests={interests}
          loading={loading}
          formError={formError}
          profileDirty={profileDirty}
          onToggleSkill={handleToggleSkill}
          onToggleInterest={handleToggleInterest}
          onClear={handleClearProfile}
          onUseSample={handleUseSample}
          onSubmit={handleSubmit}
        />

        <section id="results" className="mt-12 scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {profile ? "Personalised results" : "Event catalogue"}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {profile ? "Recommended for you" : "Explore events"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {profile
                  ? "Upcoming events ranked by relevance. Every score and explanation comes from the recommendation API."
                  : "Browse every event stored in PostgreSQL, or build your profile above for a ranked, explainable view."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              {loading ? (
                <Loader2
                  className="h-4 w-4 animate-spin text-blue-600"
                  aria-hidden="true"
                />
              ) : null}
              <span aria-live="polite">
                {loading && resultCount === 0
                  ? "Loading events"
                  : `${totalCount} event${totalCount === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>

          {profile ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Matching against
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profile.skills.map((tag) => (
                      <span
                        key={`skill-${tag}`}
                        className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                      >
                        {tag} · skill
                      </span>
                    ))}
                    {profile.interests.map((tag) => (
                      <span
                        key={`interest-${tag}`}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                      >
                        {tag} · interest
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <a
                    href="#match"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit profile
                  </a>
                  {recommendationMeta ? (
                    <p className="text-[11px] text-slate-400">
                      Weights: skills {recommendationMeta.weights.skill}, interest{" "}
                      {recommendationMeta.weights.interest}, date{" "}
                      {recommendationMeta.weights.date}
                    </p>
                  ) : null}
                </div>
              </div>
              {profileDirty ? (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                  Your selections changed. Click "Find My Events" to refresh
                  these recommendations.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4">
            <SearchBar
              value={filters.search}
              onChange={(search) => handleFilterChange({ search })}
            />
          </div>

          <div className="mt-3">
            <FilterBar
              filters={filters}
              activeCount={activeFilterCount}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>

          {error ? (
            <div className="mt-5">
              <ErrorState
                message={error}
                onRetry={handleRetry}
                compact={resultCount > 0}
              />
            </div>
          ) : null}

          <div className="mt-6" aria-busy={loading}>
            {loading && resultCount === 0 ? (
              <EventGridSkeleton />
            ) : resultCount === 0 && !error ? (
              emptyState
            ) : (
              <div
                className={
                  loading
                    ? "grid gap-5 opacity-60 transition-opacity md:grid-cols-2 xl:grid-cols-3"
                    : "grid gap-5 transition-opacity md:grid-cols-2 xl:grid-cols-3"
                }
              >
                {profile
                  ? recommendations.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  : events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <HowItWorks />
    </>
  );
}
