import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { EventItem, Recommendation } from "../../types";
import { cn } from "../../utils/cn";
import {
  formatDaysUntil,
  formatEventDate,
  formatEventTime,
  getScoreTone,
  scoreToneStyles,
} from "../../utils/format";
import { CategoryBadge, FormatBadge, TagChip } from "../ui/Badge";
import ScoreBadge from "../ui/ScoreBadge";

function MatchedGroup({
  label,
  tags,
  tone,
}: {
  label: string;
  tags: string[];
  tone: "skill" | "interest";
}) {
  if (tags.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <TagChip key={tag} tone={tone}>
            {tag}
          </TagChip>
        ))}
      </div>
    </div>
  );
}

export default function EventCard({
  event,
}: {
  event: EventItem | Recommendation;
}) {
  const recommendation = "score" in event ? event : null;
  const tone = recommendation
    ? getScoreTone(recommendation.score.percentage)
    : null;
  const toneStyles = tone ? scoreToneStyles[tone] : null;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={event.category} />
          <FormatBadge isOnline={event.isOnline} />
        </div>
        {recommendation ? (
          <ScoreBadge percentage={recommendation.score.percentage} />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatEventDate(event.eventDate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {formatEventTime(event.startTime, event.endTime)}
        </span>
        {recommendation && recommendation.daysUntil <= 30 ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
            {formatDaysUntil(recommendation.daysUntil)}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-base font-bold leading-6 tracking-tight text-slate-950">
        <Link
          to={`/events/${event.id}`}
          className="rounded transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {event.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {event.summary || event.description}
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="line-clamp-1">{event.location}</span>
      </div>

      {recommendation ? (
        <div className="mt-4 space-y-3">
          {recommendation.matchedSkills.length > 0 ||
          recommendation.matchedInterests.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              <MatchedGroup
                label="Matched skills"
                tags={recommendation.matchedSkills}
                tone="skill"
              />
              <MatchedGroup
                label="Matched interests"
                tags={recommendation.matchedInterests}
                tone="interest"
              />
            </div>
          ) : (
            <p className="rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-500">
              No direct skill or interest overlap - ranked by upcoming date.
            </p>
          )}

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <p className="flex gap-2 text-xs leading-5 text-slate-700">
              <Sparkles
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600"
                aria-hidden="true"
              />
              <span>
                <span className="font-semibold text-slate-900">
                  Why this event:{" "}
                </span>
                {recommendation.explanation}
              </span>
            </p>
          </div>

          {toneStyles ? (
            <div>
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span>Relevance</span>
                <span className={toneStyles.text}>
                  {Math.round(recommendation.score.percentage)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full", toneStyles.bar)}
                  style={{
                    width: `${Math.max(2, Math.min(100, recommendation.score.percentage))}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Required skills
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {event.requiredSkills.slice(0, 4).map((skill) => (
              <TagChip key={skill} tone="skill">
                {skill}
              </TagChip>
            ))}
            {event.requiredSkills.length > 4 ? (
              <TagChip>+{event.requiredSkills.length - 4} more</TagChip>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-auto pt-5">
        <Link
          to={`/events/${event.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          View details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
