import { ChevronLeft, ChevronRight } from './DashboardIcons'

export default function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null
  const { current_page: page, last_page: last } = meta

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
      <span className="text-gray-500">
        Page {page} of {last} Â· {meta.total} total
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= last}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
