import { Plus } from 'lucide-react'
import { cn } from '../lib/utils'

export default function FloatingButton({ onClick, label, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed right-4 bottom-20 md:bottom-6 md:right-6 z-30',
        'bg-primary-600 text-white shadow-lg shadow-primary-600/30',
        'active:scale-95 transition-transform',
        'w-14 h-14 rounded-full md:w-auto md:h-auto md:px-5 md:py-3 md:rounded-xl',
        'flex items-center justify-center gap-2',
        className
      )}
    >
      <Plus className="w-5 h-5" />
      {label && <span className="hidden md:inline text-sm font-medium">{label}</span>}
    </button>
  )
}
