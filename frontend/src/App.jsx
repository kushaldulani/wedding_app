import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from './components/LoadingScreen'
import useAuthStore from './stores/authStore'

// Auth pages (keep eager - first screens users see)
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'

// Lazy-load module pages
const EventsPage = lazy(() => import('./pages/events/EventsPage'))
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'))
const EventFormPage = lazy(() => import('./pages/events/EventFormPage'))
const GuestsPage = lazy(() => import('./pages/guests/GuestsPage'))
const GuestDetailPage = lazy(() => import('./pages/guests/GuestDetailPage'))
const GuestFormPage = lazy(() => import('./pages/guests/GuestFormPage'))
const InvitationsPage = lazy(() => import('./pages/invitations/InvitationsPage'))
const EventInvitationsPage = lazy(() => import('./pages/invitations/EventInvitationsPage'))
const InviteGuestsPage = lazy(() => import('./pages/invitations/InviteGuestsPage'))
const VendorsPage = lazy(() => import('./pages/vendors/VendorsPage'))
const VendorDetailPage = lazy(() => import('./pages/vendors/VendorDetailPage'))
const VendorFormPage = lazy(() => import('./pages/vendors/VendorFormPage'))
const VendorServicesPage = lazy(() => import('./pages/vendor-services/VendorServicesPage'))
const VendorServiceDetailPage = lazy(() => import('./pages/vendor-services/VendorServiceDetailPage'))
const VendorServiceFormPage = lazy(() => import('./pages/vendor-services/VendorServiceFormPage'))
const BudgetPage = lazy(() => import('./pages/budget/BudgetPage'))
const BudgetCategoryFormPage = lazy(() => import('./pages/budget/BudgetCategoryFormPage'))
const ExpenseFormPage = lazy(() => import('./pages/budget/ExpenseFormPage'))
const TasksPage = lazy(() => import('./pages/tasks/TasksPage'))
const TaskFormPage = lazy(() => import('./pages/tasks/TaskFormPage'))
const GiftsPage = lazy(() => import('./pages/gifts/GiftsPage'))
const GiftFormPage = lazy(() => import('./pages/gifts/GiftFormPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const ManagePage = lazy(() => import('./pages/manage/ManagePage'))
const LookupListPage = lazy(() => import('./pages/manage/LookupListPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const UserFormPage = lazy(() => import('./pages/users/UserFormPage'))

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

function RoleRoute({ roles, children }) {
  const { user } = useAuthStore()
  if (user && roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

const ADMIN_ONLY = ['admin']
const ADMIN_MANAGER = ['admin', 'manager']
const NO_GUEST = ['admin', 'manager', 'user']

export default function App() {
  return (
    <SuspenseWrapper>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />

          {/* Events: all roles can view, only non-guests can create/edit */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/new" element={<RoleRoute roles={NO_GUEST}><EventFormPage /></RoleRoute>} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/edit" element={<RoleRoute roles={NO_GUEST}><EventFormPage /></RoleRoute>} />

          {/* Guests: admin, manager, user */}
          <Route path="/guests" element={<RoleRoute roles={NO_GUEST}><GuestsPage /></RoleRoute>} />
          <Route path="/guests/new" element={<RoleRoute roles={NO_GUEST}><GuestFormPage /></RoleRoute>} />
          <Route path="/guests/:id" element={<RoleRoute roles={NO_GUEST}><GuestDetailPage /></RoleRoute>} />
          <Route path="/guests/:id/edit" element={<RoleRoute roles={NO_GUEST}><GuestFormPage /></RoleRoute>} />

          {/* Invitations: all roles (guest sees my-invitations) */}
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/invitations/event/:eventId" element={<RoleRoute roles={NO_GUEST}><EventInvitationsPage /></RoleRoute>} />
          <Route path="/invitations/invite" element={<RoleRoute roles={ADMIN_MANAGER}><InviteGuestsPage /></RoleRoute>} />
          <Route path="/invitations/event/:eventId/invite" element={<RoleRoute roles={ADMIN_MANAGER}><InviteGuestsPage /></RoleRoute>} />

          {/* Vendors: admin, manager, user */}
          <Route path="/vendors" element={<RoleRoute roles={NO_GUEST}><VendorsPage /></RoleRoute>} />
          <Route path="/vendors/new" element={<RoleRoute roles={NO_GUEST}><VendorFormPage /></RoleRoute>} />
          <Route path="/vendors/:id" element={<RoleRoute roles={NO_GUEST}><VendorDetailPage /></RoleRoute>} />
          <Route path="/vendors/:id/edit" element={<RoleRoute roles={NO_GUEST}><VendorFormPage /></RoleRoute>} />

          {/* Vendor Services: admin, manager, user */}
          <Route path="/vendor-services" element={<RoleRoute roles={NO_GUEST}><VendorServicesPage /></RoleRoute>} />
          <Route path="/vendor-services/new" element={<RoleRoute roles={ADMIN_MANAGER}><VendorServiceFormPage /></RoleRoute>} />
          <Route path="/vendor-services/:id" element={<RoleRoute roles={NO_GUEST}><VendorServiceDetailPage /></RoleRoute>} />
          <Route path="/vendor-services/:id/edit" element={<RoleRoute roles={ADMIN_MANAGER}><VendorServiceFormPage /></RoleRoute>} />

          {/* Budget: admin, manager only */}
          <Route path="/budget" element={<RoleRoute roles={ADMIN_MANAGER}><BudgetPage /></RoleRoute>} />
          <Route path="/budget/categories/new" element={<RoleRoute roles={ADMIN_MANAGER}><BudgetCategoryFormPage /></RoleRoute>} />
          <Route path="/budget/categories/:id/edit" element={<RoleRoute roles={ADMIN_MANAGER}><BudgetCategoryFormPage /></RoleRoute>} />
          <Route path="/budget/expenses/new" element={<RoleRoute roles={ADMIN_MANAGER}><ExpenseFormPage /></RoleRoute>} />
          <Route path="/budget/expenses/:id/edit" element={<RoleRoute roles={ADMIN_MANAGER}><ExpenseFormPage /></RoleRoute>} />

          {/* Tasks: all roles can view, only non-guests can create/edit */}
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/new" element={<RoleRoute roles={NO_GUEST}><TaskFormPage /></RoleRoute>} />
          <Route path="/tasks/:id/edit" element={<RoleRoute roles={NO_GUEST}><TaskFormPage /></RoleRoute>} />

          {/* Gifts: admin, manager only */}
          <Route path="/gifts" element={<RoleRoute roles={ADMIN_MANAGER}><GiftsPage /></RoleRoute>} />
          <Route path="/gifts/new" element={<RoleRoute roles={ADMIN_MANAGER}><GiftFormPage /></RoleRoute>} />
          <Route path="/gifts/:id/edit" element={<RoleRoute roles={ADMIN_MANAGER}><GiftFormPage /></RoleRoute>} />

          {/* Manage/Lookups: admin, manager only */}
          <Route path="/manage" element={<RoleRoute roles={ADMIN_MANAGER}><ManagePage /></RoleRoute>} />
          <Route path="/manage/:type" element={<RoleRoute roles={ADMIN_MANAGER}><LookupListPage /></RoleRoute>} />

          {/* Users: admin only */}
          <Route path="/users" element={<RoleRoute roles={ADMIN_ONLY}><UsersPage /></RoleRoute>} />
          <Route path="/users/new" element={<RoleRoute roles={ADMIN_ONLY}><UserFormPage /></RoleRoute>} />
          <Route path="/users/:id/edit" element={<RoleRoute roles={ADMIN_ONLY}><UserFormPage /></RoleRoute>} />

          {/* Settings: admin, manager, user */}
          <Route path="/settings" element={<RoleRoute roles={NO_GUEST}><SettingsPage /></RoleRoute>} />
        </Route>
      </Routes>
    </SuspenseWrapper>
  )
}
