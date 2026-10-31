import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

const runDbTests = process.env.RUN_DB_TESTS === "1";
const describeDatabase = runDbTests ? describe : describe.skip;

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `admin.test.${suffix}@eventhub.dev`;
const adminPassword = "IntegrationPass123!";
const draftTitle = `Integration draft event ${suffix}`;
const publishedTitle = `Integration published event ${suffix}`;

function futureDate(daysAhead: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

describeDatabase("admin API against PostgreSQL", () => {
  const app = createApp();
  const agent = request.agent(app);
  let adminId = "";
  let csrfToken = "";
  let draftId = "";
  let publishedId = "";

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(adminPassword, 4);
    const admin = await prisma.admin.create({
      data: {
        name: "Integration Admin",
        email: adminEmail,
        passwordHash,
      },
    });
    adminId = admin.id;
  });

  afterAll(async () => {
    if (adminId) {
      await prisma.event.deleteMany({ where: { createdById: adminId } });
      await prisma.admin.delete({ where: { id: adminId } }).catch(() => null);
    }
    await prisma.$disconnect();
  });

  it("rejects unauthenticated dashboard access", async () => {
    const response = await request(app).get("/api/admin/dashboard/stats");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects invalid credentials without revealing account state", async () => {
    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: adminEmail, password: "wrong-password" });

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe("Invalid email or password");
  });

  it("logs in and issues a session and CSRF cookie", async () => {
    const response = await agent
      .post("/api/admin/auth/login")
      .send({ email: adminEmail, password: adminPassword });

    expect(response.status).toBe(200);
    expect(response.body.data.admin).toMatchObject({
      id: adminId,
      email: adminEmail,
      name: "Integration Admin",
    });
    expect(response.body.data.admin.passwordHash).toBeUndefined();

    csrfToken = response.body.data.csrfToken as string;
    expect(csrfToken.length).toBeGreaterThan(20);

    const cookies = (response.headers["set-cookie"] ?? []) as unknown as string[];
    const sessionCookie = cookies.find((cookie) =>
      cookie.startsWith("eventmatch_admin="),
    );
    const csrfCookie = cookies.find((cookie) =>
      cookie.startsWith("eventmatch_csrf="),
    );

    expect(sessionCookie).toContain("HttpOnly");
    expect(sessionCookie).toContain("SameSite=Lax");
    expect(csrfCookie).not.toContain("HttpOnly");
  });

  it("returns the current session", async () => {
    const response = await agent.get("/api/admin/auth/session");

    expect(response.status).toBe(200);
    expect(response.body.data.admin.id).toBe(adminId);
    expect(response.body.data.csrfToken).toBe(csrfToken);
  });

  it("returns dashboard statistics", async () => {
    const response = await agent.get("/api/admin/dashboard/stats");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        published: expect.any(Number),
        draft: expect.any(Number),
        upcoming: expect.any(Number),
        past: expect.any(Number),
      }),
    );
  });

  it("creates an incomplete draft with only a title", async () => {
    const response = await agent
      .post("/api/admin/events")
      .set("x-csrf-token", csrfToken)
      .send({ title: draftTitle });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("DRAFT");
    expect(response.body.data.eventDate).toBeNull();
    expect(response.body.data.createdById).toBe(adminId);

    draftId = response.body.data.id as string;
  });

  it("keeps drafts out of the public listing, detail and recommendations", async () => {
    const list = await request(app).get(
      `/api/events?search=${encodeURIComponent(draftTitle)}`,
    );
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(0);

    const detail = await request(app).get(`/api/events/${draftId}`);
    expect(detail.status).toBe(404);

    const recommendations = await request(app)
      .post("/api/recommendations")
      .send({ skills: ["Node.js"], interests: ["React.js"] });

    expect(recommendations.status).toBe(200);
    const ids = recommendations.body.data.recommendations.map(
      (item: { id: string }) => item.id,
    );
    expect(ids).not.toContain(draftId);
  });

  it("refuses to publish an incomplete event", async () => {
    const response = await agent
      .patch(`/api/admin/events/${draftId}/status`)
      .set("x-csrf-token", csrfToken)
      .send({ status: "PUBLISHED" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.message).toBe("Event is not ready to publish");

    const paths = (
      response.body.error.details as Array<{ path: string }>
    ).map((detail) => detail.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        "summary",
        "description",
        "category",
        "requiredSkills",
        "interests",
        "eventDate",
        "startTime",
        "location",
        "registrationUrl",
      ]),
    );
  });

  it("requires a matching CSRF token for writes", async () => {
    const withoutCsrf = await agent
      .post("/api/admin/events")
      .send({ title: `Blocked event ${suffix}` });

    expect(withoutCsrf.status).toBe(403);
    expect(withoutCsrf.body.error.message).toBe("CSRF validation failed");

    const wrongToken = await agent
      .post("/api/admin/events")
      .set("x-csrf-token", "not-the-right-token")
      .send({ title: `Blocked event ${suffix}` });

    expect(wrongToken.status).toBe(403);
  });

  it("rejects write requests from an untrusted origin", async () => {
    const response = await agent
      .post("/api/admin/events")
      .set("origin", "https://evil.example.com")
      .set("x-csrf-token", csrfToken)
      .send({ title: `Blocked origin event ${suffix}` });

    expect(response.status).toBe(403);
    expect(response.body.error.message).toBe("Request origin is not allowed");
  });

  it("creates a fully validated published event", async () => {
    const response = await agent
      .post("/api/admin/events")
      .set("origin", "http://localhost:5173")
      .set("x-csrf-token", csrfToken)
      .send({
        title: publishedTitle,
        summary: "A hands-on integration event for backend engineers.",
        description:
          "This event covers production Node.js patterns, testing and observability with a practical workshop format.",
        category: "Backend",
        requiredSkills: ["Node.js", "Express.js"],
        interests: ["React.js", "PostgreSQL"],
        eventDate: futureDate(21),
        startTime: "10:00",
        endTime: "13:00",
        timezone: "UTC",
        location: "Online",
        isOnline: true,
        registrationUrl: "https://example.com/register/integration",
        status: "PUBLISHED",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("PUBLISHED");
    expect(response.body.data.eventDate).toBe(
      `${futureDate(21)}T00:00:00.000Z`,
    );

    publishedId = response.body.data.id as string;
  });

  it("exposes the published event publicly and in recommendations", async () => {
    const detail = await request(app).get(`/api/events/${publishedId}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.title).toBe(publishedTitle);
    expect(detail.body.data.summary).toContain("integration event");

    const list = await request(app).get(
      `/api/events?search=${encodeURIComponent(publishedTitle)}`,
    );
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const recommendations = await request(app)
      .post("/api/recommendations")
      .send({ skills: ["Node.js"], interests: ["React.js"] });

    expect(recommendations.status).toBe(200);
    const match = recommendations.body.data.recommendations.find(
      (item: { id: string }) => item.id === publishedId,
    );

    expect(match).toBeDefined();
    expect(match.matchedSkills).toContain("Node.js");
    expect(match.matchedInterests).toContain("React.js");
  });

  it("unpublishes an event and hides it publicly", async () => {
    const response = await agent
      .patch(`/api/admin/events/${publishedId}/status`)
      .set("x-csrf-token", csrfToken)
      .send({ status: "DRAFT" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("DRAFT");

    const detail = await request(app).get(`/api/events/${publishedId}`);
    expect(detail.status).toBe(404);
  });

  it("deletes events and invalidates the session on logout", async () => {
    const deleteDraft = await agent
      .delete(`/api/admin/events/${draftId}`)
      .set("x-csrf-token", csrfToken);
    expect(deleteDraft.status).toBe(200);

    const deletePublished = await agent
      .delete(`/api/admin/events/${publishedId}`)
      .set("x-csrf-token", csrfToken);
    expect(deletePublished.status).toBe(200);

    draftId = "";
    publishedId = "";

    const logout = await agent
      .post("/api/admin/auth/logout")
      .set("x-csrf-token", csrfToken);
    expect(logout.status).toBe(200);

    const session = await agent.get("/api/admin/auth/session");
    expect(session.status).toBe(401);
  });
});
