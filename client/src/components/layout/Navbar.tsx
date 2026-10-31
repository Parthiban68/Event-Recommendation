import { Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "rounded-lg bg-slate-100 px-2.5 py-2 text-sm font-semibold text-slate-950 sm:px-3"
    : "rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:px-3";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="EventMatch home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] font-bold tracking-tight text-slate-950">
              EventMatch
            </span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">
              Developer events, matched to you
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main">
          <NavLink to="/" end className={navLinkClass}>
            <span className="hidden sm:inline">Discover</span>
            <span className="sm:hidden">Home</span>
          </NavLink>
          <NavLink to="/events" className={navLinkClass}>
            Events
          </NavLink>
          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              `${navLinkClass({ isActive })} hidden md:block`
            }
          >
            For you
          </NavLink>
          <NavLink
            to="/admin/login"
            className={({ isActive }) =>
              `${navLinkClass({ isActive })} hidden lg:block`
            }
          >
            Admin
          </NavLink>
          <Link
            to="/recommendations"
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:px-3.5"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Get matched</span>
            <span className="sm:hidden">Match</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
