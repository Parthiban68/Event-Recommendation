import { MapPin, Wifi } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { getCategoryStyle } from "../../utils/format";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return <Badge className={getCategoryStyle(category)}>{category}</Badge>;
}

export function FormatBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <Badge
      className={
        isOnline
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }
    >
      {isOnline ? (
        <Wifi className="h-3 w-3" aria-hidden="true" />
      ) : (
        <MapPin className="h-3 w-3" aria-hidden="true" />
      )}
      {isOnline ? "Online" : "In person"}
    </Badge>
  );
}

const chipStyles = {
  skill: "border-blue-200 bg-blue-50 text-blue-700",
  interest: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
} as const;

export function TagChip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof chipStyles;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        chipStyles[tone],
      )}
    >
      {children}
    </span>
  );
}
