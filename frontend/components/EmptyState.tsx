import type { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export default function EmptyState({
  title = "No polar resources found.",
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <span aria-hidden="true" className="text-3xl">
        🔍
      </span>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {message && <p className="max-w-md text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
