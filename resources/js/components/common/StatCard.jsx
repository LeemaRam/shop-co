export default function StatCard({ label, value, icon, accent = 'text-gray-900' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}
