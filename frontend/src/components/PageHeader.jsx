import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '../lib/utils'

export default function PageHeader({ title, backTo, action, className }) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 md:bg-transparent md:border-0 md:backdrop-blur-none md:static',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 md:px-6 lg:px-8 md:h-16 md:pt-2">
        <div className="flex items-center gap-3">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center justify-center w-8 h-8 -ml-1 rounded-full active:bg-slate-100 hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          <h1 className="text-lg md:text-xl font-semibold text-slate-900 truncate">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}
