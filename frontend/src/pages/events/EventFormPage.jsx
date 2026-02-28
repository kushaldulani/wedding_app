import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import { useEvent, useCreateEvent, useUpdateEvent } from '../../hooks/useEvents'
import { useEventTypes } from '../../hooks/useLookups'
import { EVENT_STATUSES } from '../../lib/constants'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  event_type_id: z.coerce.number().optional().nullable(),
  description: z.string().optional(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  event_date: z.string().min(1, 'Date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.string().default('upcoming'),
})

export default function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: event, isLoading } = useEvent(id)
  const { data: eventTypes } = useEventTypes()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'upcoming' },
  })

  useEffect(() => {
    if (event) {
      reset({
        ...event,
        event_type_id: event.event_type_id || '',
        start_time: event.start_time?.slice(0, 5) || '',
        end_time: event.end_time?.slice(0, 5) || '',
      })
    }
  }, [event, reset])

  const onSubmit = (data) => {
    const payload = {
      ...data,
      event_type_id: data.event_type_id || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      description: data.description || null,
      venue_name: data.venue_name || null,
      venue_address: data.venue_address || null,
    }

    if (isEdit) {
      updateEvent.mutate(
        { id, data: payload },
        { onSuccess: () => navigate(`/events/${id}`) }
      )
    } else {
      createEvent.mutate(payload, {
        onSuccess: () => navigate('/events'),
      })
    }
  }

  if (isEdit && (isLoading || !eventTypes)) return <LoadingScreen />

  const saving = createEvent.isPending || updateEvent.isPending
  const error = createEvent.error || updateEvent.error

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Event' : 'New Event'}
        backTo={isEdit ? `/events/${id}` : '/events'}
        action={
          <button
            form="event-form"
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Name *</label>
          <input
            {...register('name')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Sangeet Night"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Type</label>
          <select
            {...register('event_type_id')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select type</option>
            {(eventTypes || []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
          <input
            type="date"
            {...register('event_date')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.event_date && <p className="text-xs text-red-500 mt-1">{errors.event_date.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
            <input
              type="time"
              {...register('start_time')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
            <input
              type="time"
              {...register('end_time')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue Name</label>
          <input
            {...register('venue_name')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Royal Garden Banquet"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue Address</label>
          <textarea
            {...register('venue_address')}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Full address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Event details..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select
            {...register('status')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  )
}
