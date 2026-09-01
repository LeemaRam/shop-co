export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="shrink-0 font-medium underline hover:no-underline">
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
