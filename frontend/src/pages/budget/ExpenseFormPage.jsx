import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useBudgetCategories, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../../hooks/useBudget'
import { useVendors } from '../../hooks/useVendors'
import { useEvents } from '../../hooks/useEvents'
import { useUsers } from '../../hooks/useUsers'
import { getExpense } from '../../api/budget'
import { useQuery } from '@tanstack/react-query'
import { PAYMENT_METHODS, PAYMENT_STATUSES, GUEST_SIDES } from '../../lib/constants'

const schema = z.object({
  budget_id: z.coerce.number().optional().nullable(),
  vendor_id: z.coerce.number().optional().nullable(),
  event_id: z.coerce.number().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  payment_status: z.string().default('pending'),
  payment_date: z.string().optional(),
  receipt_url: z.string().optional(),
  paid_by_user_id: z.coerce.number().optional().nullable(),
  paid_by_name: z.string().optional(),
  side: z.string().optional(),
  notes: z.string().optional(),
})

export default function ExpenseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: expense } = useQuery({
    queryKey: ['budget', 'expenses', id],
    queryFn: () => getExpense(id),
    enabled: !!id,
  })
  const { data: categories } = useBudgetCategories()
  const { data: vendorsData } = useVendors()
  const { data: eventsData } = useEvents()
  const { data: usersData } = useUsers()
  const vendors = vendorsData?.items || vendorsData || []
  const events = eventsData?.items || eventsData || []
  const users = usersData?.items || usersData || []

  const create = useCreateExpense()
  const update = useUpdateExpense()
  const deleteExpense = useDeleteExpense()
  const [showDelete, setShowDelete] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { payment_status: 'pending' },
  })

  useEffect(() => {
    if (expense) {
      reset({
        ...expense,
        budget_id: expense.budget_id || '',
        vendor_id: expense.vendor_id || '',
        event_id: expense.event_id || '',
        paid_by_user_id: expense.paid_by_user_id || '',
        paid_by_name: expense.paid_by_name || '',
        side: expense.side || '',
      })
    }
  }, [expense, reset])

  const onSubmit = (data) => {
    const payload = {
      ...data,
      budget_id: data.budget_id || null,
      vendor_id: data.vendor_id || null,
      event_id: data.event_id || null,
      payment_date: data.payment_date || null,
      receipt_url: data.receipt_url || null,
      paid_by_user_id: data.paid_by_user_id || null,
      paid_by_name: data.paid_by_name || null,
      side: data.side || null,
      notes: data.notes || null,
    }
    if (isEdit) {
      update.mutate({ id, data: payload }, { onSuccess: () => navigate('/budget') })
    } else {
      create.mutate(payload, { onSuccess: () => navigate('/budget') })
    }
  }

  const saving = create.isPending || update.isPending
  const error = create.error || update.error

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Expense' : 'New Expense'}
        backTo="/budget"
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
            <button form="exp-form" type="submit" disabled={saving} className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      />

      <form id="exp-form" onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
          <input {...register('description')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Photographer advance" />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount *</label>
            <input {...register('amount')} type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="50000" />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Date</label>
            <input {...register('payment_date')} type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method *</label>
            <select {...register('payment_method')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Select</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.payment_method && <p className="text-xs text-red-500 mt-1">{errors.payment_method.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Status</label>
            <select {...register('payment_status')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Category</label>
          <select {...register('budget_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">None</option>
            {(categories?.items || categories || []).map((c) => (
              <option key={c.id} value={c.id}>{c.category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor</label>
          <select {...register('vendor_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Event</label>
          <select {...register('event_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">None</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Paid By (User)</label>
            <select {...register('paid_by_user_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">None</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Paid By (Name)</label>
            <input {...register('paid_by_name')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Dad" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Side</label>
          <select {...register('side')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">None</option>
            {GUEST_SIDES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>
      </form>

      {isEdit && (
        <ConfirmDialog
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={() => {
            deleteExpense.mutate(id, { onSuccess: () => navigate('/budget') })
          }}
          title="Delete Expense"
          description={`Remove "${expense?.description}"? This action cannot be undone.`}
          loading={deleteExpense.isPending}
        />
      )}
    </div>
  )
}
