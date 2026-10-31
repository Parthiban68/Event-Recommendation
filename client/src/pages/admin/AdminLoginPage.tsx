import {
  ArrowLeft,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../services/api";

export default function AdminLoginPage() {
  const { admin, status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromState = (location.state as { from?: string } | null)?.from;
  const redirectTo =
    fromState && fromState.startsWith("/admin")
      ? fromState
      : "/admin/dashboard";

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
      </div>
    );
  }

  if (admin) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter both your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.2),_transparent_45%)]"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">EventMatch</p>
            <p className="text-[11px] text-slate-400">Admin workspace</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Run your event programme from one calm dashboard.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Create drafts, publish events with confidence, and keep the public
            catalogue focused on upcoming opportunities.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Centralized ManagementEvent",
              "Reach the Right Audience",
              "Control Every Event Journey",
            ].map((item) => (
              <p
                key={item}
                className="flex items-center gap-2 text-sm text-slate-200"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                {item}
              </p>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          Authorised administrators only.
        </p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to public site
          </Link>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2.5 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-slate-950">
                EventMatch
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 lg:mt-0">
              Admin sign in
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use your administrator credentials to manage the event catalogue.
            </p>

            {error ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="admin@eventhub.dev"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                {submitting ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                )}
                {submitting ? "Signing in..." : "Sign in to dashboard"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Sessions expire automatically. Repeated failed attempts are rate
            limited.
          </p>
        </div>
      </div>
    </div>
  );
}
