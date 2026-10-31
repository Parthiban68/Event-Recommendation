import { Check } from "lucide-react";
import { TECHNOLOGY_TAGS } from "../../constants/interests";
import { cn } from "../../utils/cn";

interface TagMultiSelectProps {
  label: string;
  description: string;
  selected: string[];
  onChange: (next: string[]) => void;
  tone: "skill" | "interest";
  disabled?: boolean;
}

export default function TagMultiSelect({
  label,
  description,
  selected,
  onChange,
  tone,
  disabled = false,
}: TagMultiSelectProps) {
  function toggle(tag: string) {
    onChange(
      selected.includes(tag)
        ? selected.filter((item) => item !== tag)
        : [...selected, tag],
    );
  }

  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {TECHNOLOGY_TAGS.map((tag) => {
          const active = selected.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(tag)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? tone === "skill"
                    ? "border-blue-600 bg-blue-600 text-white focus-visible:ring-blue-500"
                    : "border-emerald-600 bg-emerald-600 text-white focus-visible:ring-emerald-500"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400",
              )}
            >
              {active ? (
                <Check className="h-3 w-3" aria-hidden="true" />
              ) : null}
              {tag}
            </button>
          );
        })}
      </div>
      {selected.length > 0 ? (
        <p className="mt-2 text-xs font-medium text-slate-500">
          {selected.length} selected
        </p>
      ) : null}
    </fieldset>
  );
}
