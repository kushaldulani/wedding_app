export const EVENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled']
export const GUEST_SIDES = ['bride', 'groom']
export const AGE_GROUPS = ['adult', 'child', 'infant']
export const INVITATION_STATUSES = ['pending', 'sent', 'confirmed', 'declined', 'maybe']
export const PAYMENT_METHODS = ['cash', 'upi', 'bank_transfer', 'card', 'other']
export const PAYMENT_STATUSES = ['pending', 'partial', 'paid']
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent']
export const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']
export const VENDOR_SERVICE_STATUSES = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']

export const STATUS_COLORS = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  maybe: 'bg-orange-100 text-orange-700',
  partial: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  scheduled: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}
