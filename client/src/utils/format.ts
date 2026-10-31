export function formatEventDate(
  value: string,
  options: "short" | "long" = "short",
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: options === "long" ? "long" : "short",
    month: options === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatTime(value: string): string {
  const parts = value.split(":").map(Number);
  const hours = parts[0];
  const minutes = parts[1];

  if (
    hours === undefined ||
    minutes === undefined ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const date = new Date(Date.UTC(2020, 0, 1, hours, minutes));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

export function formatEventTime(
  startTime: string,
  endTime: string | null,
): string {
  const start = formatTime(startTime);
  return endTime ? `${start} - ${formatTime(endTime)}` : start;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function toDateInputValue(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
}

export function formatDaysUntil(daysUntil: number): string {
  if (daysUntil <= 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  return `In ${daysUntil} days`;
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type ScoreTone = "excellent" | "strong" | "fair" | "low";

export function getScoreTone(percentage: number): ScoreTone {
  if (percentage >= 80) return "excellent";
  if (percentage >= 60) return "strong";
  if (percentage >= 40) return "fair";
  return "low";
}

export const scoreToneStyles: Record<
  ScoreTone,
  { text: string; bg: string; bar: string; border: string }
> = {
  excellent: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    bar: "bg-emerald-500",
    border: "border-emerald-200",
  },
  strong: {
    text: "text-blue-700",
    bg: "bg-blue-50",
    bar: "bg-blue-500",
    border: "border-blue-200",
  },
  fair: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    bar: "bg-amber-500",
    border: "border-amber-200",
  },
  low: {
    text: "text-slate-600",
    bg: "bg-slate-100",
    bar: "bg-slate-400",
    border: "border-slate-200",
  },
};

const categoryStyles: Record<string, string> = {
  Frontend: "bg-sky-50 text-sky-700 border-sky-200",
  Backend: "bg-violet-50 text-violet-700 border-violet-200",
  "Full Stack": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Database: "bg-amber-50 text-amber-700 border-amber-200",
  "AI & ML": "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  "Cloud Computing": "bg-cyan-50 text-cyan-700 border-cyan-200",
  DevOps: "bg-orange-50 text-orange-700 border-orange-200",
  "System Design": "bg-teal-50 text-teal-700 border-teal-200",
};

export function getCategoryStyle(category: string): string {
  return categoryStyles[category] ?? "bg-slate-100 text-slate-700 border-slate-200";
}
