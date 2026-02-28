import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import { useGuest, useCreateGuest, useUpdateGuest } from '../../hooks/useGuests'
import { useDietaryPreferences, useRelationTypes, useFamilyGroups } from '../../hooks/useLookups'
import { GUEST_SIDES, AGE_GROUPS } from '../../lib/constants'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  side: z.enum(['bride', 'groom']),
  relation_type_id: z.coerce.number().optional().nullable(),
  family_group_id: z.coerce.number().optional().nullable(),
  dietary_preference_id: z.coerce.number().optional().nullable(),
  age_group: z.string().default('adult'),
  number_of_persons: z.string().optional(),
  room_number: z.string().optional(),
  floor: z.string().optional(),
  arrival_at: z.string().optional(),
  departure_at: z.string().optional(),
  notes: z.string().optional(),
  is_vip: z.boolean().default(false),
})

export default function GuestFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: guest, isLoading } = useGuest(id)
  const { data: dietaryPrefs } = useDietaryPreferences()
  const { data: relationTypes } = useRelationTypes()
  const { data: familyGroups } = useFamilyGroups()
  const createGuest = useCreateGuest()
  const updateGuest = useUpdateGuest()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { side: 'groom', age_group: 'adult', is_vip: false, number_of_persons: '1', room_number: '', floor: '', arrival_at: '', departure_at: '' },
  })

  useEffect(() => {
    if (guest) {
      reset({
        ...guest,
        email: guest.email || '',
        relation_type_id: guest.relation_type_id || '',
        dietary_preference_id: guest.dietary_preference_id || '',
        family_group_id: guest.family_group_id || '',
        number_of_persons: guest.number_of_persons != null ? String(guest.number_of_persons) : '1',
        room_number: guest.room_number || '',
        floor: guest.floor || '',
        arrival_at: guest.arrival_at ? String(guest.arrival_at).slice(0, 16) : '',
        departure_at: guest.departure_at ? String(guest.departure_at).slice(0, 16) : '',
      })
    }
  }, [guest, reset])

  const onSubmit = (data) => {
    const payload = {
      ...data,
      email: data.email || null,
      relation_type_id: data.relation_type_id || null,
      dietary_preference_id: data.dietary_preference_id || null,
      family_group_id: data.family_group_id || null,
      number_of_persons: data.number_of_persons ? Number(data.number_of_persons) : 1,
      room_number: data.room_number || null,
      floor: data.floor || null,
      arrival_at: data.arrival_at || null,
      departure_at: data.departure_at || null,
      notes: data.notes || null,
    }

    if (isEdit) {
      updateGuest.mutate({ id, data: payload }, { onSuccess: () => navigate(`/guests/${id}`) })
    } else {
      createGuest.mutate(payload, { onSuccess: () => navigate('/guests') })
    }
  }

  if (isEdit && (isLoading || !relationTypes || !familyGroups || !dietaryPrefs)) return <LoadingScreen />

  const saving = createGuest.isPending || updateGuest.isPending
  const error = createGuest.error || updateGuest.error

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Guest' : 'New Guest'}
        backTo={isEdit ? `/guests/${id}` : '/guests'}
        action={
          <button form="guest-form" type="submit" disabled={saving} className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <form id="guest-form" onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label>
            <input {...register('first_name')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="First" />
            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label>
            <input {...register('last_name')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Last" />
            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
          <input {...register('phone')} type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+91 98765 43210" />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="email@example.com" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Side *</label>
            <select {...register('side')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {GUEST_SIDES.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Age Group</label>
            <select {...register('age_group')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a} className="capitalize">{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Relation</label>
          <select {...register('relation_type_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select relation</option>
            {(relationTypes || []).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Dietary Preference</label>
          <select {...register('dietary_preference_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select preference</option>
            {(dietaryPrefs || []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Family Group</label>
          <select {...register('family_group_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select family group</option>
            {(familyGroups || []).map((fg) => (
              <option key={fg.id} value={fg.id}>{fg.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">No. of Persons</label>
            <input {...register('number_of_persons')} type="number" min="1" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Room Number</label>
            <input {...register('room_number')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. 101" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Floor</label>
            <input {...register('floor')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. 2nd" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Arrival</label>
            <input {...register('arrival_at')} type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Departure</label>
            <input {...register('departure_at')} type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Special requirements..." />
        </div>

        <label className="flex items-center gap-3 py-2">
          <input type="checkbox" {...register('is_vip')} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm font-medium text-slate-700">VIP Guest</span>
        </label>
      </form>
    </div>
  )
}
