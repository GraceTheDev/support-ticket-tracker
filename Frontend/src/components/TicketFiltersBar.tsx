import type { Priority, Status, TicketFilters } from '../types'
import { PRIORITIES, STATUSES, capitalizePriority } from '../utils'

interface TicketFiltersBarProps {
  filters: TicketFilters
  onChange: (next: TicketFilters) => void
  onClear: () => void
}

export function TicketFiltersBar({
  filters,
  onChange,
  onClear,
}: TicketFiltersBarProps) {
  return (
    <div className="filters">
      <div className="field">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Title…"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="status">Status</label>
        <div className="select-wrap">
          <select
            id="status"
            value={filters.status ?? ''}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as Status | '' })
            }
          >
            <option value="">All</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="filter-priority">Priority</label>
        <div className="select-wrap">
          <select
            id="filter-priority"
            value={filters.priority ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                priority: e.target.value as Priority | '',
              })
            }
          >
            <option value="">All</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {capitalizePriority(p)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button className="btn btn--ghost" type="button" onClick={onClear}>
        Clear
      </button>
    </div>
  )
}
