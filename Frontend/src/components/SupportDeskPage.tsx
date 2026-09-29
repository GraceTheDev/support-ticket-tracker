import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  fetchSummary,
  fetchTickets,
  updateTicketPriority,
  updateTicketStatus,
} from '../api'
import { ActionModal } from './ActionModal'
import { SummaryBar } from './SummaryBar'
import { TicketFiltersBar } from './TicketFiltersBar'
import { TicketList } from './TicketList'
import type {
  Priority,
  Status,
  Ticket,
  TicketFilters,
  TicketSummary,
} from '../types'
import { capitalizePriority } from '../utils'

const EMPTY_FILTERS: TicketFilters = {
  search: '',
  status: '',
  priority: '',
}

type PendingAction =
  | { kind: 'status'; ticket: Ticket; status: Status }
  | { kind: 'priority'; ticket: Ticket; priority: Priority }

interface SupportDeskPageProps {
  onBack: () => void
}

export function SupportDeskPage({ onBack }: SupportDeskPageProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [summary, setSummary] = useState<TicketSummary | null>(null)
  const [filters, setFilters] = useState<TicketFilters>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [, startTransition] = useTransition()

  const refresh = useCallback(async (activeFilters: TicketFilters) => {
    setError('')
    const [list, stats] = await Promise.all([
      fetchTickets(activeFilters),
      fetchSummary(),
    ])
    startTransition(() => {
      setTickets(list)
      setSummary(stats)
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true)
        await refresh(filters)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tickets')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, filters.search ? 250 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [filters, refresh])

  const submitPending = async (comment: string) => {
    if (!pending) return
    setBusyId(pending.ticket.id)
    setError('')
    setNotice('')
    try {
      if (pending.kind === 'status') {
        await updateTicketStatus(pending.ticket.id, pending.status, comment)
        setNotice(`#${pending.ticket.id} → ${pending.status}`)
      } else {
        await updateTicketPriority(pending.ticket.id, pending.priority, comment)
        setNotice(
          `#${pending.ticket.id} priority → ${capitalizePriority(pending.priority)}`
        )
      }
      setPending(null)
      await refresh(filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes')
      throw err
    } finally {
      setBusyId(null)
    }
  }

  const modalCopy =
    pending?.kind === 'status'
      ? {
          title: `Status → ${pending.status}`,
          description: `Ticket #${pending.ticket.id}`,
          commentLabel: 'Comment',
          commentPlaceholder: 'What did you do?',
          submitLabel: 'Save',
        }
      : pending?.kind === 'priority'
        ? {
            title: `Priority → ${capitalizePriority(pending.priority)}`,
            description: `Ticket #${pending.ticket.id}`,
            commentLabel: 'Comment',
            commentPlaceholder: 'Why is priority changing?',
            submitLabel: 'Save',
          }
        : null

  return (
    <div className="app">
      <header className="brand">
        <div className="brand__row">
          <div className="brand__mark">
            <img src="/logo.svg" alt="" width={36} height={36} className="brand__logo" />
            <div>
              <h1 className="brand__name">Support desk</h1>
              <p className="brand__role">Agent</p>
            </div>
          </div>
          <button className="btn btn--ghost btn--sm" type="button" onClick={onBack}>
            Home
          </button>
        </div>
      </header>

      <SummaryBar summary={summary} />

      {error ? (
        <div className="banner banner--error" role="alert">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="banner banner--ok" role="status">
          {notice}
        </div>
      ) : null}

      <section className="panel">
        <div className="panel__header">
          <h2 className="panel__title">All tickets</h2>
        </div>
        <TicketFiltersBar
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <TicketList
            tickets={tickets}
            busyId={busyId}
            onRequestStatus={(ticket, status) =>
              setPending({ kind: 'status', ticket, status })
            }
            onRequestPriority={(ticket, priority) =>
              setPending({ kind: 'priority', ticket, priority })
            }
          />
        )}
      </section>

      {pending && modalCopy ? (
        <ActionModal
          title={modalCopy.title}
          description={modalCopy.description}
          commentLabel={modalCopy.commentLabel}
          commentPlaceholder={modalCopy.commentPlaceholder}
          submitLabel={modalCopy.submitLabel}
          busy={busyId === pending.ticket.id}
          onClose={() => setPending(null)}
          onSubmit={submitPending}
        />
      ) : null}
    </div>
  )
}
