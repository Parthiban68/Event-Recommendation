export function EventCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="h-5 w-20 rounded-full bg-slate-200" />
        <div className="h-14 w-20 rounded-xl bg-slate-100" />
      </div>
      <div className="mt-5 h-5 w-4/5 rounded bg-slate-200" />
      <div className="mt-2 h-5 w-2/3 rounded bg-slate-200" />
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-slate-100" />
        <div className="h-3.5 w-11/12 rounded bg-slate-100" />
        <div className="h-3.5 w-3/4 rounded bg-slate-100" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-16 rounded-md bg-slate-100" />
        <div className="h-6 w-20 rounded-md bg-slate-100" />
        <div className="h-6 w-14 rounded-md bg-slate-100" />
      </div>
      <div className="mt-5 h-10 w-full rounded-lg bg-slate-100" />
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="mt-6 h-9 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 h-9 w-1/2 rounded bg-slate-200" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="mt-8 h-32 rounded-2xl bg-slate-100" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
