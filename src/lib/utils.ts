import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'running':
    case 'active':
    case 'completed':
    case 'success':
    case 'online':
      return 'text-secondary bg-secondary/10 border-secondary/30'
    case 'paused':
    case 'pending':
    case 'waiting':
    case 'elevated':
      return 'text-tertiary bg-tertiary/10 border-tertiary/30'
    case 'failed':
    case 'error':
    case 'critical':
    case 'rejected':
      return 'text-error bg-error/10 border-error/30'
    default:
      return 'text-primary bg-primary/10 border-primary/30'
  }
}
