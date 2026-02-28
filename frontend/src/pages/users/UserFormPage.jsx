import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useUser, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers'

const USER_ROLES = ['admin', 'manager', 'user', 'guest']

const createSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.string().default('user'),
  is_active: z.boolean().default(true),
})

const editSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.string(),
  is_active: z.boolean(),
})

export default function UserFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: user, isLoading } = useUser(id)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const [showDelete, setShowDelete] = useState(false)

  const schema = isEdit ? editSchema : createSchema

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user', is_active: true },
  })

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        is_active: user.is_active,
      })
    }
  }, [user, reset])

  const onSubmit = (data) => {
    if (isEdit) {
      const payload = {
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        role: data.role,
        is_active: data.is_active,
      }
      updateUser.mutate({ id, data: payload }, { onSuccess: () => navigate('/users') })
    } else {
      const payload = {
        email: data.email,
        password: data.password,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        role: data.role,
        is_active: data.is_active,
      }
      createUser.mutate(payload, { onSuccess: () => navigate('/users') })
    }
  }

  const handleDelete = () => {
    deleteUser.mutate(id, { onSuccess: () => navigate('/users') })
  }

  if (isEdit && isLoading) return <LoadingScreen />

  const saving = createUser.isPending || updateUser.isPending
  const error = createUser.error || updateUser.error

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit User' : 'New User'}
        backTo="/users"
        action={
          <div className="flex gap-2">
            {isEdit && (
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="p-2 rounded-full active:bg-slate-100"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            )}
            <button
              form="user-form"
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      />

      <form
        id="user-form"
        onSubmit={handleSubmit(onSubmit)}
        className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl"
      >
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        {!isEdit && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password *
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Min 8 characters"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          </>
        )}

        {isEdit && user && (
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-medium text-slate-700">{user.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              First Name
            </label>
            <input
              {...register('first_name')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="First"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Last Name
            </label>
            <input
              {...register('last_name')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Last"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
          <select
            {...register('role')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1">
            Admin: full access &middot; Manager: all except user management &middot; User:
            limited &middot; Guest: view only
          </p>
        </div>

        <label className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            {...register('is_active')}
            className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-slate-700">Active</span>
        </label>
      </form>

      {isEdit && (
        <ConfirmDialog
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="Delete User"
          description={`Remove ${user?.first_name || user?.email}? This action cannot be undone.`}
          loading={deleteUser.isPending}
        />
      )}
    </div>
  )
}
