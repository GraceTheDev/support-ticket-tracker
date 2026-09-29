import { useCallback, useEffect, useState, useTransition } from 'react'
import { createTicket, fetchTickets } from '../api'
import { TicketForm } from './TicketForm'
import { TicketList } from './TicketList'
import type { CreateTicketInput, Ticket } from '../types'

interface LoggerPageProps {
  onBack: () => void
}

export function LoggerPage({ onBack }: LoggerPageProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [, startTransition] = useTransition()

  const refresh = useCallback(async () => {
    setError('')
    const list = await fetchTickets()
    startTransition(() => setTickets(list))
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await refresh()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tickets')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const handleCreate = async (input: CreateTicketInput): Promise<boolean> => {
    setCreating(true)
    setError('')
    setNotice('')
    try {
      const ticket = await createTicket(input)
      setNotice(`Ticket #${ticket.id} submitted`)
      await refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create ticket')
      return false
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="app">
      <header className="brand">
        <div className="brand__row">
          <div className="brand__mark">
            <img src="/logo.svg" alt="" width={36} height={36} className="brand__logo" />
            <div>
              <h1 className="brand__name">Log a ticket</h1>
              <p className="brand__role">Requester</p>
            </div>
          </div>
          <button className="btn btn--ghost btn--sm" type="button" onClick={onBack}>
            Home
          </button>
        </div>
      </header>

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

      <TicketForm onCreate={handleCreate} busy={creating} />

      <section className="panel">
        <div className="panel__header">
          <h2 className="panel__title">Your submissions</h2>
        </div>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <TicketList tickets={tickets} readOnly />
        )}
      </section>
    </div>
  )
}
