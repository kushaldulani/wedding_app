import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Shield, ShieldCheck, UserIcon, UserCircle } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import { useUsers } from '../../hooks/useUsers'
import { cn, getInitials } from '../../lib/utils'

const USER_ROLES = ['admin', 'manager', 'user', 'guest']

const ROLE_BADGE = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  user: 'bg-blue-100 text-blue-700',
  guest: 'bg-slate-100 text-slate-600',
}

const ROLE_ICON = {
  admin: Shield,
  manager: ShieldCheck,
  user: UserIcon,
  guest: UserCircle,
}

export default function UsersPage() {
  const navigate = useNavigate()
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useUsers({ limit: 100 })
  const allUsers = data?.items || data || []

  const filtered = allUsers
    .filter((u) => !roleFilter || u.role === roleFilter)
    .filter(
      (u) =>
        !search ||
        `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div>
      <PageHeader title="Users" />

      {/* Search */}
      <div className="px-4 md:px-6 lg:px-8 pt-2 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Role filter */}
      <div className="px-4 md:px-6 lg:px-8 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setRoleFilter('')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
            !roleFilter ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
          )}
        >
          All
        </button>
        {USER_ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize',
              roleFilter === r ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {r}s
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={search || roleFilter ? 'Try adjusting your filters' : 'Add your first user'}
        />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((user) => {
            const RoleIcon = ROLE_ICON[user.role] || UserIcon
            return (
              <button
                key={user.id}
                onClick={() => navigate(`/users/${user.id}/edit`)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow text-left"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex-shrink-0">
                  {getInitials(user.first_name || user.email, user.last_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.first_name
                      ? `${user.first_name} ${user.last_name || ''}`.trim()
                      : user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 truncate">{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize',
                      ROLE_BADGE[user.role] || 'bg-slate-100 text-slate-600'
                    )}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {user.role}
                  </span>
                  {!user.is_active && (
                    <span className="text-[10px] text-red-500 font-medium">Inactive</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <FloatingButton onClick={() => navigate('/users/new')} label="New User" />
    </div>
  )
}
