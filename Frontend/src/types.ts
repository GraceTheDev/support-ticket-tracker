export type Priority = 'low' | 'medium' | 'high'
export type Status = 'Open' | 'In progress' | 'Resolved'
export type ActivityType = 'status_change' | 'priority_change'

export interface TicketActivity {
  id?: string
  message: string
  type: ActivityType
  fromStatus?: Status
  toStatus?: Status
  fromPriority?: Priority
  toPriority?: Priority
  createdAt: string
}

export interface Ticket {
  id: number
  title: string
  description: string
  priority: Priority
  status: Status
  activity: TicketActivity[]
  createdAt: string
  updatedAt: string
}

export interface TicketSummary {
  total: number
  byStatus: Record<Status, number>
}

export interface CreateTicketInput {
  title: string
  description: string
  priority: Priority
}

export interface TicketFilters {
  search?: string
  status?: Status | ''
  priority?: Priority | ''
}

export interface ApiSuccess<T> {
  success: true
  data: T
  count?: number
}

export interface ApiError {
  success: false
  error?: string
  errors?: string[]
}
