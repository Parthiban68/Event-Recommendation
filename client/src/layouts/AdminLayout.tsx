import {
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../utils/cn";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/events/create", label: "Create event", icon: PlusCircle },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="Admin">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin/events"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  const initials = admin?.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden bg-slate-950 lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">EventMatch</p>
            <p className="text-[11px] font-medium text-slate-400">
              Admin workspace
            </p>
          </div>
        </div>

        <div className="flex-1 px-3 py-5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Manage
          </p>
          <div className="mt-2">
            <NavItems />
          </div>
        </div>

        <div className="border-t border-slate-800 p-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View public site
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 lg:hidden"
                aria-label="EventMatch admin home"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-slate-950">Admin</span>
              </Link>
              <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 lg:flex">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure admin session
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-slate-900">{admin?.name}</p>
                <p className="text-[11px] text-slate-500">{admin?.email}</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {initials || "A"}
              </span>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 lg:hidden"
              >
                {loggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                Sign out
              </button>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/events"
              end
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              Events
            </NavLink>
            <NavLink
              to="/admin/events/create"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              Create
            </NavLink>
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-slate-600 hover:bg-slate-100"
            >
              Public site
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
