import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import { useVendor, useCreateVendor, useUpdateVendor } from '../../hooks/useVendors'
import { useVendorCategories } from '../../hooks/useLookups'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  vendor_category_id: z.coerce.number().min(1, 'Category is required'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  is_booked: z.boolean().default(false),
})

export default function VendorFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: vendor, isLoading } = useVendor(id)
  const { data: categories } = useVendorCategories()
  const createVendor = useCreateVendor()
  const updateVendor = useUpdateVendor()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_booked: false },
  })

  useEffect(() => {
    if (vendor) reset({ ...vendor, email: vendor.email || '' })
  }, [vendor, reset])

  const onSubmit = (data) => {
    const payload = {
      ...data,
      email: data.email || null,
      contact_person: data.contact_person || null,
      phone: data.phone || null,
      website: data.website || null,
      address: data.address || null,
      notes: data.notes || null,
    }

    if (isEdit) {
      updateVendor.mutate({ id, data: payload }, { onSuccess: () => navigate(`/vendors/${id}`) })
    } else {
      createVendor.mutate(payload, { onSuccess: () => navigate('/vendors') })
    }
  }

  if (isEdit && isLoading) return <LoadingScreen />
  const saving = createVendor.isPending || updateVendor.isPending
  const error = createVendor.error || updateVendor.error

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Vendor' : 'New Vendor'}
        backTo={isEdit ? `/vendors/${id}` : '/vendors'}
        action={
          <button form="vendor-form" type="submit" disabled={saving} className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <form id="vendor-form" onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor Name *</label>
          <input {...register('name')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Pixel Perfect Photography" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
          <select {...register('vendor_category_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select category</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.vendor_category_id && <p className="text-xs text-red-500 mt-1">{errors.vendor_category_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Person</label>
          <input {...register('contact_person')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input {...register('phone')} type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
          <input {...register('website')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
          <textarea {...register('address')} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>

        <label className="flex items-center gap-3 py-2">
          <input type="checkbox" {...register('is_booked')} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm font-medium text-slate-700">Booked</span>
        </label>
      </form>
    </div>
  )
}
