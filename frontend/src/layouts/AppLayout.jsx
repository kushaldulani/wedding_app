import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import Sidebar from '../components/Sidebar'
import { useCurrentUser } from '../hooks/useAuth'
import useAuthStore from '../stores/authStore'
import { useEffect } from 'react'

export default function AppLayout() {
  const { data: user } = useCurrentUser()
  const { setUser } = useAuthStore()

  useEffect(() => {
    if (user) setUser(user)
  }, [user, setUser])

  return (
    <div className="min-h-full bg-slate-50">
      {/* Sidebar — visible on md+ */}
      <Sidebar />

      {/* Main content area */}
      <div className="md:ml-60 lg:ml-64 min-h-full">
        <main className="pb-16 md:pb-0 max-w-4xl mx-auto bg-white md:bg-transparent md:min-h-screen safe-top">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — visible on mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
