import { Compass, Loader2, SearchX, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import EventCard from "../components/events/EventCard";
import InterestSelector from "../components/home/InterestSelector";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { EventGridSkeleton } from "../components/ui/LoadingSkeletons";
import { SAMPLE_PROFILE } from "../constants/interests";
import {
  fetchRecommendations,
  getApiErrorMessage,
  isCanceledError,
} from "../services/api";
import type {
  CandidateProfile,
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

export default function RecommendationsPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [meta, setMeta] = useState<RecommendationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!profile) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchRecommendations(
      { skills: profile.skills, interests: profile.interests },
      controller.signal,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setRecommendations(result.recommendations);
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
  }, [profile, retryKey]);

  const profileDirty = useMemo(() => {
    if (!profile) return false;
    return (
      !sameSelection(profile.skills, skills) ||
      !sameSelection(profile.interests, interests)
    );
  }, [profile, skills, interests]);

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
        .getElementById("recommendation-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [skills, interests]);

  const handleUseSample = useCallback(() => {
    setSkills([...SAMPLE_PROFILE.skills]);
    setInterests([...SAMPLE_PROFILE.interests]);
    setFormError(null);
  }, []);

  const handleClear = useCallback(() => {
    setSkills([]);
    setInterests([]);
    setFormError(null);
    setProfile(null);
    setRecommendations([]);
    setMeta(null);
    setError(null);
  }, []);

  const handleRetry = useCallback(() => setRetryKey((key) => key + 1), []);

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Personalised discovery
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Events ranked for your skills and interests
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            The scoring engine weights skills at 40%, interests at 35% and
            recency at 25%. Every result includes a transparent explanation,
            with no invented event details.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <InterestSelector
          skills={skills}
          interests={interests}
          loading={loading}
          formError={formError}
          profileDirty={profileDirty}
          onToggleSkill={handleToggleSkill}
          onToggleInterest={handleToggleInterest}
          onClear={handleClear}
          onUseSample={handleUseSample}
          onSubmit={handleSubmit}
        />

        <section id="recommendation-results" className="mt-10 scroll-mt-24">
          {profile ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Recommended for you
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Your matches
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {loading && recommendations.length === 0
                    ? "Scoring events..."
                    : `${meta?.total ?? recommendations.length} event${
                        (meta?.total ?? recommendations.length) === 1 ? "" : "s"
                      } ranked by relevance`}
                </p>
              </div>
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Updating
                </span>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "1. Pick your profile",
                  body: "Choose the technologies you know and the topics you want to explore.",
                },
                {
                  title: "2. We score every upcoming event",
                  body: "Skills, interests and recency are combined into one transparent score.",
                },
                {
                  title: "3. Review the explanation",
                  body: "Each recommendation tells you exactly which skills and interests matched.",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h2 className="mt-3 text-sm font-bold text-slate-900">
                    {step.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {error ? (
            <div className="mt-5">
              <ErrorState message={error} onRetry={handleRetry} />
            </div>
          ) : null}

          {profile ? (
            <div className="mt-5" aria-busy={loading}>
              {loading && recommendations.length === 0 ? (
                <EventGridSkeleton />
              ) : recommendations.length === 0 && !error ? (
                <EmptyState
                  icon={SearchX}
                  title="No upcoming matches"
                  description="There are no upcoming published events that overlap with this profile. Try adding more skills or interests."
                  action={
                    <button
                      type="button"
                      onClick={handleClear}
                      className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Update profile
                    </button>
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
                  {recommendations.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {meta ? (
            <div className="mt-6 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-slate-400" />
                Weights: skills {meta.weights.skill}, interest{" "}
                {meta.weights.interest}, date {meta.weights.date}
              </p>
              <p>
                Candidate:{" "}
                {[...meta.candidate.skills, ...meta.candidate.interests].join(
                  ", ",
                )}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
