import { Check, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { TECHNOLOGY_TAGS } from "../../constants/interests";
import { cn } from "../../utils/cn";

interface InterestSelectorProps {
  skills: string[];
  interests: string[];
  loading: boolean;
  formError: string | null;
  profileDirty: boolean;
  onToggleSkill: (tag: string) => void;
  onToggleInterest: (tag: string) => void;
  onClear: () => void;
  onUseSample: () => void;
  onSubmit: () => void;
}

function TagGrid({
  selected,
  onToggle,
  selectedClass,
}: {
  selected: string[];
  onToggle: (tag: string) => void;
  selectedClass: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {TECHNOLOGY_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);

        return (
          <button
            key={tag}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(tag)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              isSelected
                ? selectedClass
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            {isSelected ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : null}
            {tag}
          </button>
        );
      })}
    </div>
  );
}

export default function InterestSelector({
  skills,
  interests,
  loading,
  formError,
  profileDirty,
  onToggleSkill,
  onToggleInterest,
  onClear,
  onUseSample,
  onSubmit,
}: InterestSelectorProps) {
  const totalSelected = skills.length + interests.length;

  return (
    <section id="match" className="scroll-mt-24">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                Build your match profile
              </h2>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Choose the technologies you have hands-on skills in and the topics
              you are interested in. You can select multiple options in both
              groups.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:pt-1">
            <button
              type="button"
              onClick={onUseSample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
              Try an example
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Skills you have
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Technologies you have used in projects or at work.
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                {skills.length}
              </span>
            </div>
            <TagGrid
              selected={skills}
              onToggle={onToggleSkill}
              selectedClass="border-blue-600 bg-blue-600 text-white shadow-sm"
            />
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Interests you want to explore
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Topics and tools you would like to learn more about.
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                {interests.length}
              </span>
            </div>
            <TagGrid
              selected={interests}
              onToggle={onToggleInterest}
              selectedClass="border-emerald-600 bg-emerald-600 text-white shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs text-slate-500" role="status">
              {totalSelected > 0
                ? `${totalSelected} selection${totalSelected === 1 ? "" : "s"} ready`
                : "Select at least one skill or interest to get started."}
              {profileDirty ? (
                <span className="ml-1 font-semibold text-amber-700">
                  Profile changed - run the match again to refresh results.
                </span>
              ) : null}
            </p>
            {formError ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {formError}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Finding events..." : "Find My Events"}
          </button>
        </div>
      </div>
    </section>
  );
}
