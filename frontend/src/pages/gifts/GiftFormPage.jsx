import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import { useGift, useCreateGift, useUpdateGift } from '../../hooks/useGifts'
import { useGuests } from '../../hooks/useGuests'
import { useEvents } from '../../hooks/useEvents'
import { useGiftTypes } from '../../hooks/useLookups'

const schema = z.object({
  guest_id: z.coerce.number().min(1, 'Guest is required'),
  gift_type_id: z.coerce.number().min(1, 'Gift type is required'),
  description: z.string().optional(),
  amount: z.coerce.number().optional().nullable(),
  event_id: z.coerce.number().optional().nullable(),
  received_at: z.string().optional(),
  thank_you_sent: z.boolean().default(false),
  notes: z.string().optional(),
})

export default function GiftFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: gift, isLoading } = useGift(id)
  const { data: guestsData } = useGuests()
  const { data: eventsData } = useEvents()
  const { data: giftTypes } = useGiftTypes()
  const guests = guestsData?.items || guestsData || []
  const events = eventsData?.items || eventsData || []

  const create = useCreateGift()
  const update = useUpdateGift()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { thank_you_sent: false },
  })

  useEffect(() => {
    if (gift) {
      reset({
        ...gift,
        guest_id: gift.guest_id || '',
        gift_type_id: gift.gift_type_id || '',
        event_id: gift.event_id || '',
        received_at: gift.received_at ? gift.received_at.slice(0, 10) : '',
      })
    }
  }, [gift, reset])

  const onSubmit = (data) => {
    const payload = {
      ...data,
      amount: data.amount || null,
      event_id: data.event_id || null,
      description: data.description || null,
      received_at: data.received_at || null,
      notes: data.notes || null,
    }
    if (isEdit) {
      update.mutate({ id, data: payload }, { onSuccess: () => navigate('/gifts') })
    } else {
      create.mutate(payload, { onSuccess: () => navigate('/gifts') })
    }
  }

  if (isEdit && isLoading) return <LoadingScreen />
  const saving = create.isPending || update.isPending
  const error = create.error || update.error

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Gift' : 'New Gift'}
        backTo="/gifts"
        action={
          <button form="gift-form" type="submit" disabled={saving} className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <form id="gift-form" onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Guest *</label>
          <select {...register('guest_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select guest</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>{g.first_name} {g.last_name}</option>
            ))}
          </select>
          {errors.guest_id && <p className="text-xs text-red-500 mt-1">{errors.guest_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Gift Type *</label>
          <select {...register('gift_type_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select type</option>
            {(giftTypes || []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {errors.gift_type_id && <p className="text-xs text-red-500 mt-1">{errors.gift_type_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <input {...register('description')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Shagun envelope" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
            <input {...register('amount')} type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="51000" />
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
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Received At</label>
          <input {...register('received_at')} type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>

        <label className="flex items-center gap-3 py-2">
          <input type="checkbox" {...register('thank_you_sent')} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm font-medium text-slate-700">Thank You Sent</span>
        </label>
      </form>
    </div>
  )
}
