interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Unable to connect to the Polar Knowledge API.",
  message = "Please check that the backend server is running, then try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-14 text-center"
    >
      <span aria-hidden="true" className="text-3xl">
        ⚠️
      </span>
      <p className="text-base font-semibold text-red-800">{title}</p>
      <p className="max-w-md text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}
