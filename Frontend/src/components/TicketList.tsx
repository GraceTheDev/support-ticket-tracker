import { Fragment, useState } from 'react'
import type { Priority, Status, Ticket } from '../types'
import {
  PRIORITIES,
  STATUSES,
  capitalizePriority,
  formatDate,
} from '../utils'

interface TicketListProps {
  tickets: Ticket[]
  busyId?: number | null
  readOnly?: boolean
  onRequestStatus?: (ticket: Ticket, status: Status) => void
  onRequestPriority?: (ticket: Ticket, priority: Priority) => void
}

export function TicketList({
  tickets,
  busyId = null,
  readOnly = false,
  onRequestStatus,
  onRequestPriority,
}: TicketListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (tickets.length === 0) {
    return (
      <div className="empty">
        <strong>No tickets found</strong>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="ticket-table">
        <thead>
          <tr>
            <th scope="col" className="col-id">
              ID
            </th>
            <th scope="col" className="col-title">
              Title
            </th>
            <th scope="col" className="col-priority">
              Priority
            </th>
            <th scope="col" className="col-status">
              Status
            </th>
            <th scope="col" className="col-date">
              Created
            </th>
            <th scope="col" className="col-date">
              Updated
            </th>
            <th scope="col" className="col-actions">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const isBusy = busyId === ticket.id
            const expanded = expandedId === ticket.id
            const activity = ticket.activity ?? []

            return (
              <Fragment key={ticket.id}>
                <tr className={isBusy ? 'ticket-table__row--busy' : undefined}>
                  <td className="col-id">
                    <span className="ticket-table__id">#{ticket.id}</span>
                  </td>
                  <td className="col-title">
                    <div className="ticket-table__title-cell">
                      <span className="ticket-table__title">{ticket.title}</span>
                      {ticket.description ? (
                        <span className="ticket-table__desc">{ticket.description}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="col-priority">
                    {readOnly ? (
                      <span className={`pill pill--${ticket.priority}`}>
                        {capitalizePriority(ticket.priority)}
                      </span>
                    ) : (
                      <div className="select-wrap select-wrap--table">
                        <select
                          value={ticket.priority}
                          disabled={isBusy}
                          aria-label={`Priority for ticket ${ticket.id}`}
                          onChange={(e) => {
                            const value = e.target.value as Priority
                            if (value !== ticket.priority) {
                              onRequestPriority?.(ticket, value)
                            }
                          }}
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {capitalizePriority(p)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </td>
                  <td className="col-status">
                    {readOnly ? (
                      <span
                        className={`pill pill--status-${ticket.status === 'In progress' ? 'progress' : ticket.status.toLowerCase()}`}
                      >
                        {ticket.status}
                      </span>
                    ) : (
                      <div className="select-wrap select-wrap--table">
                        <select
                          value={ticket.status}
                          disabled={isBusy}
                          aria-label={`Status for ticket ${ticket.id}`}
                          onChange={(e) => {
                            const value = e.target.value as Status
                            if (value !== ticket.status) {
                              onRequestStatus?.(ticket, value)
                            }
                          }}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </td>
                  <td className="col-date ticket-table__date">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="col-date ticket-table__date">
                    {formatDate(ticket.updatedAt)}
                  </td>
                  <td className="col-actions">
                    {activity.length > 0 ? (
                      <button
                        className="btn btn--ghost btn--sm"
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : ticket.id)
                        }
                      >
                        {expanded ? 'Hide' : activity.length}
                      </button>
                    ) : (
                      <span className="ticket-table__muted">—</span>
                    )}
                  </td>
                </tr>
                {expanded ? (
                  <tr className="ticket-table__detail">
                    <td colSpan={7}>
                      <div className="ticket-table__detail-inner">
                        <ul className="activity-list">
                          {[...activity].reverse().map((entry, i) => (
                            <li
                              key={entry.id ?? `${ticket.id}-${i}`}
                              className="activity"
                            >
                              <div className="activity__head">
                                <strong>
                                  {entry.type === 'status_change'
                                    ? `${entry.fromStatus} → ${entry.toStatus}`
                                    : `${capitalizePriority(entry.fromPriority!)} → ${capitalizePriority(entry.toPriority!)}`}
                                </strong>
                                <span>{formatDate(entry.createdAt)}</span>
                              </div>
                              <p>{entry.message}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
