import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>
            <span className="font-semibold text-slate-700">EventMatch</span> -
            relevance-first event discovery for developers.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <Link to="/events" className="transition-colors hover:text-slate-900">
            Browse events
          </Link>
          <Link
            to="/recommendations"
            className="transition-colors hover:text-slate-900"
          >
            Recommendations
          </Link>
          <Link
            to="/#how-it-works"
            className="transition-colors hover:text-slate-900"
          >
            Scoring
          </Link>
          <Link
            to="/admin/login"
            className="transition-colors hover:text-slate-900"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
