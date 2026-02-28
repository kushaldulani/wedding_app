import { NavLink } from 'react-router-dom'
import {
  Home,
  Calendar,
  Users,
  CheckSquare,
  Store,
  Wrench,
  Wallet,
  Mail,
  Gift,
  ListTodo,
  Shield,
  Settings,
  Heart,
} from 'lucide-react'
import { cn } from '../lib/utils'
import useAuthStore from '../stores/authStore'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard', end: true, roles: ['admin', 'manager', 'user', 'guest'] },
  { to: '/events', icon: Calendar, label: 'Events', roles: ['admin', 'manager', 'user', 'guest'] },
  { to: '/guests', icon: Users, label: 'Guests', roles: ['admin', 'manager', 'user'] },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks', roles: ['admin', 'manager', 'user', 'guest'] },
  { to: '/vendors', icon: Store, label: 'Vendors', roles: ['admin', 'manager', 'user'] },
  { to: '/vendor-services', icon: Wrench, label: 'Services', roles: ['admin', 'manager', 'user'] },
  { to: '/budget', icon: Wallet, label: 'Budget', roles: ['admin', 'manager'] },
  { to: '/invitations', icon: Mail, label: 'Invitations', roles: ['admin', 'manager', 'user', 'guest'] },
  { to: '/gifts', icon: Gift, label: 'Gifts', roles: ['admin', 'manager'] },
  { to: '/manage', icon: ListTodo, label: 'Manage', roles: ['admin', 'manager'] },
  { to: '/users', icon: Shield, label: 'Users', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'manager', 'user'] },
]

export default function Sidebar() {
  const { user } = useAuthStore()
  const role = user?.role || 'guest'
  const visibleItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 lg:w-64 bg-white border-r border-slate-200 h-full fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
          <Heart className="w-4 h-4" />
        </div>
        <span className="text-base font-bold text-slate-900">KL Wedding</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
