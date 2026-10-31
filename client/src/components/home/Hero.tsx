import { ArrowDown, Sparkles } from "lucide-react";

const signals = [
  {
    label: "Skill match",
    weight: 40,
    description: "Overlap with the event's required skills",
    color: "bg-blue-500",
  },
  {
    label: "Interest match",
    weight: 35,
    description: "Topics and technologies you want to explore",
    color: "bg-emerald-500",
  },
  {
    label: "Date relevance",
    weight: 25,
    description: "Upcoming events score higher, past events are excluded",
    color: "bg-amber-500",
  },
];

export default function Hero() {
  return (
    <section className="hero-surface relative overflow-hidden border-b border-slate-200 bg-white">
      <div
        className="dot-grid pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Relevance-first event discovery
          </span>

          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Find developer events that match your{" "}
            <span className="text-blue-600">stack.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Select the technologies you work with and the topics you want to
            explore. Every upcoming event is scored against your profile, with
            a transparent reason for why it was recommended.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#match"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Build my profile
            </a>
            <a
              href="#results"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              Browse upcoming events
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                How your match score is built
              </p>
              <p className="mt-1 text-xs text-slate-500">
                100 points, three transparent signals
              </p>
            </div>
            <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
              100
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {signals.map((signal) => (
              <div key={signal.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-800">
                    {signal.label}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {signal.weight} pts
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${signal.color}`}
                    style={{ width: `${signal.weight}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
            Scores are computed by the API from PostgreSQL event data. Nothing
            on this page is a static recommendation.
          </p>
        </div>
      </div>
    </section>
  );
}
