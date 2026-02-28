import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon className="w-12 h-12 text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-500">{title || 'Nothing here yet'}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">{description}</p>
      )}
    </div>
  )
}
