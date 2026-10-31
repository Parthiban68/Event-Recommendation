import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ErrorState({
  message,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={
        compact
          ? "flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          : "flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center"
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className={compact ? "flex-1" : "mt-3"}>
        <h3 className="text-sm font-semibold text-red-900">
          Something went wrong
        </h3>
        <p className="mt-1 text-sm leading-6 text-red-700">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
