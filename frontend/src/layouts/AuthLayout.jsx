import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 safe-top">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
