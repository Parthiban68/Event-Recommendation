import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

const runDbTests = process.env.RUN_DB_TESTS === "1";
const describeDatabase = runDbTests ? describe : describe.skip;

describeDatabase("recommendations against PostgreSQL", () => {
  const app = createApp();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns ranked recommendations from seeded database events", async () => {
    const response = await request(app).post("/api/recommendations").send({
      skills: ["Node.js", "Express.js"],
      interests: ["React.js", "PostgreSQL"],
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const recommendations = response.body.data.recommendations as Array<{
      id: string;
      title: string;
      eventDate: string;
      explanation: string;
      score: { total: number; percentage: number };
      matchedSkills: string[];
      matchedInterests: string[];
    }>;

    expect(recommendations.length).toBeGreaterThan(0);

    const today = new Date();
    const todayIso = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    )
      .toISOString()
      .slice(0, 10);

    for (const recommendation of recommendations) {
      expect(recommendation.eventDate.slice(0, 10) >= todayIso).toBe(true);
      expect(recommendation.score.total).toBeGreaterThanOrEqual(5);
      expect(recommendation.score.percentage).toBeGreaterThanOrEqual(5);
      expect(recommendation.explanation.length).toBeGreaterThan(20);
    }

    for (let index = 1; index < recommendations.length; index += 1) {
      expect(recommendations[index - 1]!.score.total).toBeGreaterThanOrEqual(
        recommendations[index]!.score.total,
      );
    }

    const reactRecommendation = recommendations.find(
      (recommendation) =>
        recommendation.matchedSkills.includes("React.js") ||
        recommendation.matchedInterests.includes("React.js"),
    );

    expect(reactRecommendation).toBeDefined();
  });

  it("filters events in PostgreSQL by technology and format", async () => {
    const response = await request(app).get(
      "/api/events?technology=React.js&isOnline=true&limit=50",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);

    for (const event of response.body.data) {
      expect(event.isOnline).toBe(true);
      expect(
        event.requiredSkills.includes("React.js") ||
          event.interests.includes("React.js"),
      ).toBe(true);
    }
  });

  it("returns event details by id", async () => {
    const listResponse = await request(app).get("/api/events?limit=1");
    expect(listResponse.status).toBe(200);

    const eventId = listResponse.body.data[0].id;
    const detailResponse = await request(app).get(`/api/events/${eventId}`);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.data.id).toBe(eventId);
  });

  it("reports healthy database status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      status: "ok",
      database: "up",
    });
  });
});
