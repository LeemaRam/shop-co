export default function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-gray-500 ${className}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
