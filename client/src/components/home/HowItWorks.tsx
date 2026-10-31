import { CalendarClock, Code2, Heart } from "lucide-react";

const scoreCards = [
  {
    icon: Code2,
    weight: 40,
    title: "Skill match",
    description:
      "We compare your selected skills with the event's required skills. Matching half of the requirements earns half of the 40 points.",
    accent: "text-blue-600 bg-blue-50",
  },
  {
    icon: Heart,
    weight: 35,
    title: "Interest match",
    description:
      "Your interests are matched against the event's interest tags and the technologies it covers. Relevance is proportional.",
    accent: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: CalendarClock,
    weight: 25,
    title: "Date relevance",
    description:
      "Events within 7 days score 25 points, then 20 within 30 days, 15 within 60, 10 within 90 and 5 thereafter. Past events are excluded.",
    accent: "text-amber-600 bg-amber-50",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Transparent by design
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            No black-box recommendations
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            The API scores every upcoming event out of 100 points and returns
            the exact breakdown. Every explanation is generated from the actual
            matched skills and interests.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {scoreCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.accent}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {card.weight}
                    <span className="ml-0.5 text-sm font-semibold text-slate-400">
                      pts
                    </span>
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
