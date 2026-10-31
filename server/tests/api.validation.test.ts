import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const app = createApp();

function expectValidationError(response: request.Response) {
  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.error.code).toBe("VALIDATION_ERROR");
  expect(Array.isArray(response.body.error.details)).toBe(true);
  expect(JSON.stringify(response.body)).not.toContain("stack");
}

describe("GET /api/events validation", () => {
  it("rejects an invalid page number", async () => {
    const response = await request(app).get("/api/events?page=0");
    expectValidationError(response);
  });

  it("rejects an invalid limit", async () => {
    const response = await request(app).get("/api/events?limit=500");
    expectValidationError(response);
  });

  it("rejects an invalid online filter", async () => {
    const response = await request(app).get("/api/events?isOnline=yes");
    expectValidationError(response);
  });

  it("rejects an impossible calendar date", async () => {
    const response = await request(app).get(
      "/api/events?dateFrom=2026-02-30",
    );
    expectValidationError(response);
  });

  it("rejects a reversed date range", async () => {
    const response = await request(app).get(
      "/api/events?dateFrom=2026-06-10&dateTo=2026-06-01",
    );
    expectValidationError(response);
  });

  it("rejects a non-UUID event id", async () => {
    const response = await request(app).get("/api/events/not-a-uuid");
    expectValidationError(response);
    expect(response.body.error.details[0].path).toBe("id");
  });
});

describe("POST /api/recommendations validation", () => {
  it("rejects unsupported technologies", async () => {
    const response = await request(app)
      .post("/api/recommendations")
      .send({ skills: ["Blockchain"], interests: [] });

    expectValidationError(response);
    expect(response.body.error.details[0].message).toContain(
      "Unsupported technology",
    );
  });

  it("rejects a non-array skills value", async () => {
    const response = await request(app)
      .post("/api/recommendations")
      .send({ skills: "React.js", interests: [] });

    expectValidationError(response);
  });

  it("rejects invalid filters inside the recommendation request", async () => {
    const response = await request(app)
      .post("/api/recommendations")
      .send({
        skills: ["React.js"],
        interests: [],
        filters: { dateFrom: "hello" },
      });

    expectValidationError(response);
  });

  it("rejects too many selected technologies", async () => {
    const response = await request(app)
      .post("/api/recommendations")
      .send({
        skills: Array.from({ length: 26 }, () => "React.js"),
        interests: [],
      });

    expectValidationError(response);
  });
});

describe("API error handling", () => {
  it("returns a JSON 404 for unknown routes", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: "NOT_FOUND" },
    });
    expect(JSON.stringify(response.body)).not.toContain("stack");
  });

  it("returns a clean 400 for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/recommendations")
      .set("Content-Type", "application/json")
      .send('{"skills": [');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
