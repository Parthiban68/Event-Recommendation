import type { Event } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  buildRecommendations,
  getDateScore,
  scoreEvent,
} from "../src/services/recommendation.scoring";
import { addUtcDays } from "../src/utils/date";

const NOW = new Date("2026-06-01T12:00:00.000Z");

function makeEvent(
  overrides: Partial<Event> & { daysFromNow?: number } = {},
): Event {
  const { daysFromNow = 10, ...rest } = overrides;

  return {
    id: crypto.randomUUID(),
    title: "Test Event",
    seedKey: null,
    summary: "A realistic test event summary.",
    description: "A realistic test event description for scoring.",
    category: "Backend",
    requiredSkills: ["Node.js", "Express.js"],
    interests: ["Node.js", "Backend"],
    bannerUrl: null,
    eventDate: addUtcDays(NOW, daysFromNow),
    startTime: "10:00",
    endTime: null,
    timezone: "UTC",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://example.com/register",
    status: "PUBLISHED",
    createdById: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...rest,
  };
}

describe("recommendation scoring", () => {
  it("computes skill, interest, date and total scores", () => {
    const event = makeEvent({
      daysFromNow: 5,
      requiredSkills: ["React.js", "TypeScript"],
      interests: ["React.js", "Next.js", "TypeScript"],
    });

    const result = scoreEvent(
      event,
      { skills: ["React.js", "TypeScript"], interests: ["React.js"] },
      NOW,
    );

    expect(result).not.toBeNull();
    expect(result!.score.skill).toBeCloseTo(40, 2);
    expect(result!.score.interest).toBeCloseTo(11.67, 2);
    expect(result!.score.date).toBe(25);
    expect(result!.score.total).toBeCloseTo(76.67, 2);
    expect(result!.score.percentage).toBe(76.7);
    expect(result!.matchedSkills).toEqual(["React.js", "TypeScript"]);
    expect(result!.matchedInterests).toEqual(["React.js"]);
  });

  it("calculates skill scores proportionally to required skills", () => {
    const event = makeEvent({
      daysFromNow: 5,
      requiredSkills: ["Node.js", "Express.js", "PostgreSQL", "Docker"],
      interests: [],
    });

    const result = scoreEvent(
      event,
      { skills: ["Node.js", "PostgreSQL"], interests: [] },
      NOW,
    );

    expect(result!.score.skill).toBeCloseTo(20, 2);
    expect(result!.matchedSkills).toEqual(["Node.js", "PostgreSQL"]);
  });

  it("calculates interest scores proportionally across interests and technologies", () => {
    const event = makeEvent({
      daysFromNow: 10,
      requiredSkills: ["Node.js", "PostgreSQL"],
      interests: ["Backend", "Full Stack"],
    });

    const result = scoreEvent(
      event,
      { skills: [], interests: ["PostgreSQL", "Backend"] },
      NOW,
    );

    expect(result!.score.interest).toBeCloseTo(17.5, 2);
    expect(result!.matchedInterests).toEqual(["Backend", "PostgreSQL"]);
  });

  it("matches technologies case-insensitively and through common aliases", () => {
    const event = makeEvent({
      requiredSkills: ["React.js", "PostgreSQL"],
      interests: ["Frontend"],
    });

    const result = scoreEvent(
      event,
      { skills: ["react", "postgres"], interests: ["reactjs"] },
      NOW,
    );

    expect(result!.matchedSkills).toEqual(["React.js", "PostgreSQL"]);
    expect(result!.matchedInterests).toEqual(["React.js"]);
  });

  it.each([
    [0, 25],
    [7, 25],
    [8, 20],
    [30, 20],
    [31, 15],
    [60, 15],
    [61, 10],
    [90, 10],
    [91, 5],
  ])("awards %i days until the event %i date points", (days, points) => {
    expect(getDateScore(days)).toBe(points);

    const result = scoreEvent(
      makeEvent({ daysFromNow: days, requiredSkills: [], interests: [] }),
      { skills: [], interests: [] },
      NOW,
    );

    expect(result!.score.date).toBe(points);
  });

  it("excludes past events from recommendations", () => {
    const past = makeEvent({ daysFromNow: -1, title: "Past event" });
    const today = makeEvent({ daysFromNow: 0, title: "Today event" });
    const future = makeEvent({ daysFromNow: 5, title: "Future event" });

    const results = buildRecommendations(
      [past, today, future],
      { skills: [], interests: [] },
      NOW,
    );

    expect(results.map((result) => result.event.title)).toEqual([
      "Today event",
      "Future event",
    ]);
  });

  it("sorts recommendations by total score, then by soonest date", () => {
    const profile = { skills: ["React.js"], interests: ["React.js"] };

    const unrelated = makeEvent({
      daysFromNow: 5,
      title: "Unrelated",
      requiredSkills: ["Python"],
      interests: ["Python"],
    });

    const partial = makeEvent({
      daysFromNow: 5,
      title: "Partial",
      requiredSkills: ["React.js"],
      interests: ["Python"],
    });

    const perfect = makeEvent({
      daysFromNow: 5,
      title: "Perfect",
      requiredSkills: ["React.js"],
      interests: ["React.js"],
    });

    const results = buildRecommendations(
      [unrelated, partial, perfect],
      profile,
      NOW,
    );

    expect(results.map((result) => result.event.title)).toEqual([
      "Perfect",
      "Partial",
      "Unrelated",
    ]);
    expect(results[0]!.score.total).toBe(100);
    expect(results[1]!.score.total).toBe(82.5);
    expect(results[2]!.score.total).toBe(25);
  });

  it("handles empty event skill and interest arrays without NaN", () => {
    const event = makeEvent({
      daysFromNow: 12,
      requiredSkills: [],
      interests: [],
    });

    const result = scoreEvent(
      event,
      { skills: ["Node.js"], interests: ["React.js"] },
      NOW,
    );

    expect(result!.score.skill).toBe(0);
    expect(result!.score.interest).toBe(0);
    expect(result!.score.date).toBe(20);
    expect(result!.score.total).toBe(20);
    expect(Number.isNaN(result!.score.total)).toBe(false);
    expect(result!.matchedSkills).toEqual([]);
    expect(result!.matchedInterests).toEqual([]);
  });

  it("handles an empty candidate profile safely", () => {
    const event = makeEvent({ daysFromNow: 9 });

    const result = scoreEvent(event, { skills: [], interests: [] }, NOW);

    expect(result!.score.skill).toBe(0);
    expect(result!.score.interest).toBe(0);
    expect(result!.score.total).toBe(20);
    expect(result!.explanation).toContain("upcoming event");
    expect(result!.explanation).not.toContain("matches your");
  });

  it("returns an empty list when there are no candidates", () => {
    expect(buildRecommendations([], { skills: [], interests: [] }, NOW)).toEqual(
      [],
    );
  });

  it("generates explanations only from matched data", () => {
    const event = makeEvent({
      daysFromNow: 5,
      requiredSkills: ["Node.js"],
      interests: ["Backend"],
    });

    const result = scoreEvent(
      event,
      { skills: ["Node.js"], interests: ["Docker"] },
      NOW,
    );

    expect(result!.matchedSkills).toEqual(["Node.js"]);
    expect(result!.matchedInterests).toEqual([]);
    expect(result!.explanation).toBe(
      "Recommended because this event requires your Node.js skill.",
    );
    expect(result!.explanation).not.toContain("Docker");
    expect(result!.explanation).not.toContain("Backend");
  });

  it("mentions both interests and skills when both match", () => {
    const event = makeEvent({
      daysFromNow: 5,
      requiredSkills: ["Node.js", "Express.js"],
      interests: ["React.js", "PostgreSQL"],
    });

    const result = scoreEvent(
      event,
      {
        skills: ["Node.js", "Express.js"],
        interests: ["React.js", "PostgreSQL"],
      },
      NOW,
    );

    expect(result!.explanation).toBe(
      "Recommended because this event matches your React.js and PostgreSQL interests and your Node.js and Express.js skills.",
    );
  });
});
