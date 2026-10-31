import { CheckCircle2, FileEdit } from "lucide-react";
import { cn } from "../../utils/cn";
import type { EventStatus } from "../../types";

export default function StatusBadge({ status }: { status: EventStatus }) {
  const isPublished = status === "PUBLISHED";
  const Icon = isPublished ? CheckCircle2 : FileEdit;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        isPublished
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}
