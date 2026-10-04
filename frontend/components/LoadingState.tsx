interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({
  label = "Loading polar resources...",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600"
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
