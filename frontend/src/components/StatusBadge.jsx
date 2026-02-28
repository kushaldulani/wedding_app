import { cn } from '../lib/utils'
import { STATUS_COLORS } from '../lib/constants'

export default function StatusBadge({ status, className }) {
  if (!status) return null
  const label = status.replace(/_/g, ' ')
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
        STATUS_COLORS[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {label}
    </span>
  )
}
