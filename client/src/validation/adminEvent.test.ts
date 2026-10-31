import { describe, expect, it } from "vitest";
import {
  adminEventFormSchema,
  type AdminEventFormValues,
} from "./adminEvent";

function validValues(
  overrides: Partial<AdminEventFormValues> = {},
): AdminEventFormValues {
  return {
    title: "Production-ready React patterns",
    summary: "A practical workshop on modern React.",
    description:
      "A hands-on workshop covering server components, transitions and testing.",
    category: "Frontend",
    requiredSkills: ["React.js", "TypeScript"],
    interests: ["React.js"],
    bannerUrl: "",
    eventDate: "2026-11-21",
    startTime: "10:00",
    endTime: "13:00",
    timezone: "UTC",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://example.com/register",
    ...overrides,
  };
}

describe("adminEventFormSchema", () => {
  it("accepts a complete valid event", () => {
    expect(adminEventFormSchema.safeParse(validValues()).success).toBe(true);
  });

  it("accepts incomplete drafts with optional fields cleared", () => {
    const result = adminEventFormSchema.safeParse(
      validValues({
        summary: "",
        description: "",
        category: "",
        requiredSkills: [],
        interests: [],
        bannerUrl: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        location: "",
        registrationUrl: "",
      }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than five characters", () => {
    const result = adminEventFormSchema.safeParse(
      validValues({ title: "Hi" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["title"]);
    }
  });

  it("rejects unsafe URLs", () => {
    const result = adminEventFormSchema.safeParse(
      validValues({ registrationUrl: "javascript:alert(1)" }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects an end time that is not after the start time", () => {
    const result = adminEventFormSchema.safeParse(
      validValues({ startTime: "13:00", endTime: "10:00" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === "endTime"),
      ).toBe(true);
    }
  });

  it("rejects malformed dates and times", () => {
    const result = adminEventFormSchema.safeParse(
      validValues({ eventDate: "21-11-2026", startTime: "9am" }),
    );

    expect(result.success).toBe(false);
  });
});
