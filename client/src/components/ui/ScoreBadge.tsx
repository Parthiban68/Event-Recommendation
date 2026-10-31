import { Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";
import { getScoreTone, scoreToneStyles } from "../../utils/format";

export default function ScoreBadge({ percentage }: { percentage: number }) {
  const tone = getScoreTone(percentage);
  const styles = scoreToneStyles[tone];

  return (
    <div
      className={cn(
        "flex flex-col items-end rounded-xl border px-3 py-2",
        styles.bg,
        styles.border,
      )}
      aria-label={`Relevance score ${Math.round(percentage)} percent`}
    >
      <div className={cn("flex items-baseline gap-0.5", styles.text)}>
        <span className="text-2xl font-bold tracking-tight">
          {Math.round(percentage)}
        </span>
        <span className="text-sm font-semibold">%</span>
      </div>
      <span
        className={cn(
          "flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide",
          styles.text,
        )}
      >
        <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
        match
      </span>
    </div>
  );
}
