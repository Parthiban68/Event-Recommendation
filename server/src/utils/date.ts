const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(startOfUtcDay(date).getTime() + days * DAY_IN_MS);
}

export function differenceInUtcDays(target: Date, from: Date): number {
  return Math.round(
    (startOfUtcDay(target).getTime() - startOfUtcDay(from).getTime()) /
      DAY_IN_MS,
  );
}

export function parseDateOnly(value: string): Date | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function formatUtcDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
