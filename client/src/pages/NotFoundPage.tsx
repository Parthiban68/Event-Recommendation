import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-blue-600">
        404 - Page not found
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
        This page does not exist
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        The link may be broken or the page may have moved. Head back to the
        event catalogue to keep exploring.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
      >
        Back to events
      </Link>
    </div>
  );
}
