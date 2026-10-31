import { describe, expect, it } from "vitest";
import {
  formatEventDate,
  formatEventTime,
  formatTime,
  getScoreTone,
  isHttpUrl,
  toDateInputValue,
} from "./format";

describe("format helpers", () => {
  it("formats event dates in UTC without shifting the day", () => {
    expect(formatEventDate("2026-11-21T00:00:00.000Z")).toBe(
      "Sat, Nov 21, 2026",
    );
    expect(formatEventDate("2026-11-21T00:00:00.000Z", "long")).toBe(
      "Saturday, November 21, 2026",
    );
  });

  it("handles invalid dates and times safely", () => {
    expect(formatEventDate("not-a-date")).toBe("Date to be announced");
    expect(formatTime("bad")).toBe("bad");
    expect(formatEventTime("18:30", null)).toBe("6:30 PM");
    expect(formatEventTime("18:30", "20:00")).toBe("6:30 PM - 8:00 PM");
  });

  it("converts ISO timestamps to date input values", () => {
    expect(toDateInputValue("2026-11-21T00:00:00.000Z")).toBe("2026-11-21");
    expect(toDateInputValue(null)).toBe("");
    expect(toDateInputValue("invalid")).toBe("");
  });

  it("only accepts http and https URLs", () => {
    expect(isHttpUrl("https://example.com/register")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("example.com")).toBe(false);
  });

  it("maps percentages to score tones", () => {
    expect(getScoreTone(90)).toBe("excellent");
    expect(getScoreTone(65)).toBe("strong");
    expect(getScoreTone(45)).toBe("fair");
    expect(getScoreTone(10)).toBe("low");
  });
});
