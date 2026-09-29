import type { Priority, Status } from './types'

export const PRIORITIES: Priority[] = ['low', 'medium', 'high']
export const STATUSES: Status[] = ['Open', 'In progress', 'Resolved']

export const NEXT_STATUS: Partial<Record<Status, Status>> = {
  Open: 'In progress',
  'In progress': 'Resolved',
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function capitalizePriority(priority: Priority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}
