import type { Event } from "@prisma/client";
import { differenceInUtcDays, formatUtcDate } from "../utils/date";
import { formatList, tagKey, uniqueByTag } from "../utils/tags";

export const SCORE_WEIGHTS = {
  skill: 40,
  interest: 35,
  date: 25,
} as const;

export interface CandidateProfile {
  skills: string[];
  interests: string[];
}

export interface ScoreBreakdown {
  skill: number;
  interest: number;
  date: number;
  total: number;
  percentage: number;
}

export interface ScoredEvent {
  event: Event;
  score: ScoreBreakdown;
  matchedSkills: string[];
  matchedInterests: string[];
  daysUntil: number;
  explanation: string;
}

export function getDaysUntil(eventDate: Date, now: Date = new Date()): number {
  return differenceInUtcDays(eventDate, now);
}

export function getDateScore(daysUntil: number): number {
  if (daysUntil < 0) return 0;
  if (daysUntil <= 7) return 25;
  if (daysUntil <= 30) return 20;
  if (daysUntil <= 60) return 15;
  if (daysUntil <= 90) return 10;
  return 5;
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function generateExplanation(
  matchedSkills: string[],
  matchedInterests: string[],
  eventDate: Date,
  daysUntil: number,
): string {
  if (matchedSkills.length > 0 && matchedInterests.length > 0) {
    return `Recommended because this event matches your ${formatList(
      matchedInterests,
    )} ${pluralize(
      matchedInterests.length,
      "interest",
      "interests",
    )} and your ${formatList(matchedSkills)} ${pluralize(
      matchedSkills.length,
      "skill",
      "skills",
    )}.`;
  }

  if (matchedInterests.length > 0) {
    return `Recommended because this event matches your ${formatList(
      matchedInterests,
    )} ${pluralize(matchedInterests.length, "interest", "interests")}.`;
  }

  if (matchedSkills.length > 0) {
    return `Recommended because this event requires your ${formatList(
      matchedSkills,
    )} ${pluralize(matchedSkills.length, "skill", "skills")}.`;
  }

  const soon = daysUntil <= 7 ? " (within the next 7 days)" : "";
  return `Recommended because it is an upcoming event on ${formatUtcDate(
    eventDate,
  )}${soon}.`;
}

export function scoreEvent(
  event: Event,
  profile: CandidateProfile,
  now: Date = new Date(),
): ScoredEvent | null {
  if (!event.eventDate || event.status !== "PUBLISHED") {
    return null;
  }

  const daysUntil = getDaysUntil(event.eventDate, now);

  if (daysUntil < 0) {
    return null;
  }

  const requiredSkills = uniqueByTag(event.requiredSkills, (tag) => tag);
  const interestPool = uniqueByTag(
    [...event.interests, ...event.requiredSkills],
    (tag) => tag,
  );

  const candidateSkillKeys = new Set(profile.skills.map(tagKey));
  const candidateInterestKeys = new Set(profile.interests.map(tagKey));

  const matchedSkills = requiredSkills.filter((skill) =>
    candidateSkillKeys.has(tagKey(skill)),
  );
  const matchedInterests = interestPool.filter((interest) =>
    candidateInterestKeys.has(tagKey(interest)),
  );

  const skillScore =
    requiredSkills.length > 0
      ? (matchedSkills.length / requiredSkills.length) * SCORE_WEIGHTS.skill
      : 0;

  const interestScore =
    interestPool.length > 0
      ? (matchedInterests.length / interestPool.length) *
        SCORE_WEIGHTS.interest
      : 0;

  const dateScore = getDateScore(daysUntil);
  const total = round(
    Math.min(skillScore, SCORE_WEIGHTS.skill) +
      Math.min(interestScore, SCORE_WEIGHTS.interest) +
      dateScore,
  );

  return {
    event,
    score: {
      skill: round(Math.min(skillScore, SCORE_WEIGHTS.skill)),
      interest: round(Math.min(interestScore, SCORE_WEIGHTS.interest)),
      date: dateScore,
      total,
      percentage: round(total, 1),
    },
    matchedSkills,
    matchedInterests,
    daysUntil,
    explanation: generateExplanation(
      matchedSkills,
      matchedInterests,
      event.eventDate,
      daysUntil,
    ),
  };
}

export function buildRecommendations(
  events: Event[],
  profile: CandidateProfile,
  now: Date = new Date(),
): ScoredEvent[] {
  return events
    .map((event) => scoreEvent(event, profile, now))
    .filter((result): result is ScoredEvent => result !== null)
    .sort(
      (a, b) =>
        b.score.total - a.score.total ||
        a.daysUntil - b.daysUntil ||
        a.event.title.localeCompare(b.event.title),
    );
}
