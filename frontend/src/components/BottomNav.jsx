import { NavLink } from 'react-router-dom'
import { Home, Calendar, Users, CheckSquare, Mail, Menu } from 'lucide-react'
import { cn } from '../lib/utils'
import { useState } from 'react'
import useAuthStore from '../stores/authStore'

const mainTabs = [
  { to: '/', icon: Home, label: 'Home', roles: ['admin', 'manager', 'user', 'guest'] },
  { to: '/events', icon: Calendar, label: 'Events', roles: ['admin', 'manager', 'user', 'guest'] },
  { to: '/guests', icon: Users, label: 'Guests', roles: ['admin', 'manager', 'user'] },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks', roles: ['admin', 'manager', 'user', 'guest'] },
  { to: '/invitations', icon: Mail, label: 'Invites', roles: ['guest'] },
]

const moreItems = [
  { to: '/vendors', label: 'Vendors', roles: ['admin', 'manager', 'user'] },
  { to: '/vendor-services', label: 'Services', roles: ['admin', 'manager', 'user'] },
  { to: '/budget', label: 'Budget', roles: ['admin', 'manager'] },
  { to: '/invitations', label: 'Invitations', roles: ['admin', 'manager', 'user'] },
  { to: '/gifts', label: 'Gifts', roles: ['admin', 'manager'] },
  { to: '/manage', label: 'Manage', roles: ['admin', 'manager'] },
  { to: '/users', label: 'Users', roles: ['admin'] },
  { to: '/settings', label: 'Settings', roles: ['admin', 'manager', 'user'] },
]

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false)
  const { user } = useAuthStore()
  const role = user?.role || 'guest'
  const visibleTabs = mainTabs.filter((t) => t.roles.includes(role))
  const visibleMore = moreItems.filter((t) => t.roles.includes(role))

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl p-4 safe-bottom animate-slide-up">
            <div className="grid grid-cols-3 gap-3">
              {visibleMore.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className="flex items-center justify-center py-3 px-2 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 active:bg-slate-100"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto h-14">
          {visibleTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-16 h-full text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary-600' : 'text-slate-400'
                )
              }
            >
              <tab.icon className="w-5 h-5 mb-0.5" />
              {tab.label}
            </NavLink>
          ))}
          {visibleMore.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full text-[10px] font-medium transition-colors',
                showMore ? 'text-primary-600' : 'text-slate-400'
              )}
            >
              <Menu className="w-5 h-5 mb-0.5" />
              More
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
