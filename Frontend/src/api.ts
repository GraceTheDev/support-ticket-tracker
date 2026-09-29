import type {
  ApiError,
  CreateTicketInput,
  Priority,
  Status,
  Ticket,
  TicketFilters,
  TicketSummary,
} from './types'

const BASE = '/api/tickets'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })

  const body = (await res.json()) as T | ApiError

  if (!res.ok || (body as ApiError).success === false) {
    const err = body as ApiError
    const message =
      err.errors?.join(', ') || err.error || `Request failed (${res.status})`
    throw new Error(message)
  }

  return body as T
}

export async function fetchTickets(filters: TicketFilters = {}): Promise<Ticket[]> {
  const params = new URLSearchParams()
  if (filters.search?.trim()) params.set('search', filters.search.trim())
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)

  const query = params.toString()
  const result = await request<{ success: true; data: Ticket[] }>(
    `${BASE}${query ? `?${query}` : ''}`
  )
  return result.data
}

export async function fetchSummary(): Promise<TicketSummary> {
  const result = await request<{ success: true; data: TicketSummary }>(
    `${BASE}/summary`
  )
  return result.data
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const result = await request<{ success: true; data: Ticket }>(BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return result.data
}

export async function updateTicketStatus(
  id: number,
  status: Status,
  comment: string
): Promise<Ticket> {
  const result = await request<{ success: true; data: Ticket }>(
    `${BASE}/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, comment }),
    }
  )
  return result.data
}

export async function updateTicketPriority(
  id: number,
  priority: Priority,
  comment: string
): Promise<Ticket> {
  const result = await request<{ success: true; data: Ticket }>(
    `${BASE}/${id}/priority`,
    {
      method: 'PATCH',
      body: JSON.stringify({ priority, comment }),
    }
  )
  return result.data
}
