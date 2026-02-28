import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  CheckSquare,
  Wallet,
  Gift,
  Store,
  Mail,
  ListTodo,
  Shield,
  Settings,
  Heart,
} from 'lucide-react'
import useAuthStore from '../stores/authStore'
import { useEventsSummary } from '../hooks/useEvents'
import { useGuestsSummary } from '../hooks/useGuests'
import { useTasksSummary } from '../hooks/useTasks'
import { useBudgetOverview } from '../hooks/useBudget'
import { formatCurrency } from '../lib/utils'

function StatTile({ icon: Icon, label, value, sub, color, bg, to }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className={`relative overflow-hidden rounded-2xl p-4 md:p-5 text-left active:scale-[0.97] transition-transform ${bg}`}
    >
      <Icon className={`w-5 h-5 mb-2 ${color}`} />
      <p className={`text-2xl font-bold ${color}`}>{value ?? '-'}</p>
      <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      <div className={`absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-10 ${color.replace('text-', 'bg-')}`} />
    </button>
  )
}

function NavItem({ icon: Icon, label, to, color }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
    >
      <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[11px] md:text-xs font-medium text-slate-600">{label}</span>
    </button>
  )
}

const allStatTiles = [
  { key: 'events', icon: Calendar, label: 'Events', color: 'text-blue-600', bg: 'bg-blue-50', to: '/events', roles: ['admin', 'manager', 'user', 'guest'] },
  { key: 'guests', icon: Users, label: 'Guests', color: 'text-purple-600', bg: 'bg-purple-50', to: '/guests', roles: ['admin', 'manager', 'user'] },
  { key: 'tasks', icon: CheckSquare, label: 'Pending Tasks', color: 'text-amber-600', bg: 'bg-amber-50', to: '/tasks', roles: ['admin', 'manager', 'user', 'guest'] },
  { key: 'budget', icon: Wallet, label: 'Budget Spent', color: 'text-green-600', bg: 'bg-green-50', to: '/budget', roles: ['admin', 'manager'] },
]

const allQuickAccess = [
  { icon: Calendar, label: 'Events', to: '/events', color: 'bg-blue-100 text-blue-600', roles: ['admin', 'manager', 'user', 'guest'] },
  { icon: Users, label: 'Guests', to: '/guests', color: 'bg-purple-100 text-purple-600', roles: ['admin', 'manager', 'user'] },
  { icon: CheckSquare, label: 'Tasks', to: '/tasks', color: 'bg-amber-100 text-amber-600', roles: ['admin', 'manager', 'user', 'guest'] },
  { icon: Store, label: 'Vendors', to: '/vendors', color: 'bg-indigo-100 text-indigo-600', roles: ['admin', 'manager', 'user'] },
  { icon: Wallet, label: 'Budget', to: '/budget', color: 'bg-green-100 text-green-600', roles: ['admin', 'manager'] },
  { icon: Mail, label: 'Invitations', to: '/invitations', color: 'bg-sky-100 text-sky-600', roles: ['admin', 'manager', 'user', 'guest'] },
  { icon: Gift, label: 'Gifts', to: '/gifts', color: 'bg-pink-100 text-pink-600', roles: ['admin', 'manager'] },
  { icon: ListTodo, label: 'Manage', to: '/manage', color: 'bg-teal-100 text-teal-600', roles: ['admin', 'manager'] },
  { icon: Shield, label: 'Users', to: '/users', color: 'bg-red-100 text-red-600', roles: ['admin'] },
  { icon: Settings, label: 'Settings', to: '/settings', color: 'bg-slate-100 text-slate-600', roles: ['admin', 'manager', 'user'] },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const role = user?.role || 'guest'
  const { data: eventsSummary } = useEventsSummary()
  const { data: guestsSummary } = useGuestsSummary()
  const { data: tasksSummary } = useTasksSummary()
  const { data: budgetOverview } = useBudgetOverview()

  const firstName = user?.first_name || 'there'
  const showBudget = ['admin', 'manager'].includes(role)
  const budgetPercent =
    showBudget && budgetOverview && budgetOverview.total_estimated > 0
      ? Math.min(100, (budgetOverview.total_spent / budgetOverview.total_estimated) * 100)
      : 0

  const statTiles = allStatTiles.filter((t) => t.roles.includes(role))
  const quickAccess = allQuickAccess.filter((t) => t.roles.includes(role))

  const getStatValue = (key) => {
    switch (key) {
      case 'events': return eventsSummary?.total_events
      case 'guests': return guestsSummary?.total_guests
      case 'tasks': return tasksSummary?.pending
      case 'budget': return budgetOverview ? formatCurrency(budgetOverview.total_spent) : undefined
      default: return undefined
    }
  }

  const getStatSub = (key) => {
    switch (key) {
      case 'events': return eventsSummary?.by_status?.upcoming ? `${eventsSummary.by_status.upcoming} upcoming` : undefined
      case 'guests': return guestsSummary?.vip_count ? `${guestsSummary.vip_count} VIP` : undefined
      case 'tasks': return tasksSummary?.overdue ? `${tasksSummary.overdue} overdue` : undefined
      case 'budget': return budgetOverview?.total_estimated ? `of ${formatCurrency(budgetOverview.total_estimated)}` : undefined
      default: return undefined
    }
  }

  return (
    <div className="md:p-6 lg:p-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 md:px-0 md:pt-0 md:pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Welcome back,</p>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{firstName}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center md:hidden">
          <Heart className="w-5 h-5" />
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="px-4 py-4 md:px-0 md:py-0 md:pb-6">
        <div className={`grid grid-cols-2 ${statTiles.length >= 4 ? 'md:grid-cols-4' : `md:grid-cols-${statTiles.length}`} gap-3 md:gap-4`}>
          {statTiles.map((tile) => (
            <StatTile
              key={tile.key}
              icon={tile.icon}
              label={tile.label}
              value={getStatValue(tile.key)}
              sub={getStatSub(tile.key)}
              color={tile.color}
              bg={tile.bg}
              to={tile.to}
            />
          ))}
        </div>
      </div>

      {/* Budget progress bar */}
      {showBudget && budgetOverview && budgetOverview.total_estimated > 0 && (
        <div className="px-5 pb-2 md:px-0 md:pb-6">
          <div className="p-4 bg-white rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500">Budget Progress</span>
              <span className="text-xs font-semibold text-slate-700">{budgetPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${budgetPercent > 90 ? 'bg-red-500' : 'bg-primary-500'}`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Access — icon grid */}
      <div className="px-5 pt-4 pb-8 md:px-0 md:pt-0">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-y-5 gap-x-2 md:gap-x-4">
          {quickAccess.map((item) => (
            <NavItem key={item.to} icon={item.icon} label={item.label} to={item.to} color={item.color} />
          ))}
        </div>
      </div>
    </div>
  )
}
