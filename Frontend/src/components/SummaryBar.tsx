import type { TicketSummary } from '../types'

interface SummaryBarProps {
  summary: TicketSummary | null
}

export function SummaryBar({ summary }: SummaryBarProps) {
  const total = summary?.total ?? 0
  const byStatus = summary?.byStatus ?? {
    Open: 0,
    'In progress': 0,
    Resolved: 0,
  }

  return (
    <section className="summary" aria-label="Ticket summary">
      <div className="summary__stat">
        <span className="summary__label">Total</span>
        <span className="summary__value">{total}</span>
      </div>
      <div className="summary__stat summary__stat--open">
        <span className="summary__label">Open</span>
        <span className="summary__value">{byStatus.Open}</span>
      </div>
      <div className="summary__stat summary__stat--progress">
        <span className="summary__label">In progress</span>
        <span className="summary__value">{byStatus['In progress']}</span>
      </div>
      <div className="summary__stat summary__stat--resolved">
        <span className="summary__label">Resolved</span>
        <span className="summary__value">{byStatus.Resolved}</span>
      </div>
    </section>
  )
}
