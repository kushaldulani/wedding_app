import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import FileDropzone from '../../components/FileDropzone'
import AttachmentList from '../../components/AttachmentList'
import { useVendorService, useCreateVendorService, useUpdateVendorService } from '../../hooks/useVendorServices'
import { useAttachments, useUploadAttachments, useDeleteAttachment } from '../../hooks/useMediaAttachments'
import { useVendors } from '../../hooks/useVendors'
import { useEvents } from '../../hooks/useEvents'
import { VENDOR_SERVICE_STATUSES } from '../../lib/constants'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  vendor_id: z.string().optional(),
  event_id: z.string().optional(),
  service_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  amount: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

export default function VendorServiceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: svc, isLoading } = useVendorService(id)
  const { data: vendorsData } = useVendors({ page_size: 100 })
  const { data: eventsData } = useEvents({ page_size: 100 })
  const createService = useCreateVendorService()
  const updateService = useUpdateVendorService()
  const { data: attachments } = useAttachments('vendor_service', id)
  const uploadAttachments = useUploadAttachments('vendor_service', id)
  const deleteAttachment = useDeleteAttachment('vendor_service', id)

  const vendors = vendorsData?.items || vendorsData || []
  const events = eventsData?.items || eventsData || []

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '', vendor_id: '', event_id: '',
      service_date: '', start_time: '', end_time: '',
      amount: '', status: 'pending', notes: '',
    },
  })

  useEffect(() => {
    if (svc) {
      reset({
        title: svc.title || '',
        description: svc.description || '',
        vendor_id: svc.vendor_id != null ? String(svc.vendor_id) : '',
        event_id: svc.event_id != null ? String(svc.event_id) : '',
        service_date: svc.service_date ? String(svc.service_date).slice(0, 10) : '',
        start_time: svc.start_time ? String(svc.start_time).slice(0, 5) : '',
        end_time: svc.end_time ? String(svc.end_time).slice(0, 5) : '',
        amount: svc.amount != null ? String(svc.amount) : '',
        status: svc.status || 'pending',
        notes: svc.notes || '',
      })
    }
  }, [svc, reset])

  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      description: data.description || null,
      vendor_id: data.vendor_id ? Number(data.vendor_id) : null,
      event_id: data.event_id ? Number(data.event_id) : null,
      service_date: data.service_date || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      amount: data.amount !== '' && data.amount != null ? Number(data.amount) : null,
      status: data.status || 'pending',
      notes: data.notes || null,
    }

    if (isEdit) {
      updateService.mutate({ id, data: payload }, { onSuccess: () => navigate(`/vendor-services/${id}`) })
    } else {
      createService.mutate(payload, { onSuccess: () => navigate('/vendor-services') })
    }
  }

  if (isEdit && (isLoading || !vendorsData || !eventsData)) return <LoadingScreen />
  const saving = createService.isPending || updateService.isPending
  const error = createService.error || updateService.error

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Service' : 'New Service'}
        backTo={isEdit ? `/vendor-services/${id}` : '/vendor-services'}
        action={
          <button form="vs-form" type="submit" disabled={saving} className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <form id="vs-form" onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input {...register('title')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Wedding Photography" />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea {...register('description')} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor</label>
            <select {...register('vendor_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Unassigned</option>
              {vendors.map((v) => (
                <option key={v.id} value={String(v.id)}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Event</label>
            <select {...register('event_id')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">No event</option>
              {events.map((e) => (
                <option key={e.id} value={String(e.id)}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Date</label>
          <input {...register('service_date')} type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
            <input {...register('start_time')} type="time" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
            <input {...register('end_time')} type="time" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
            <input {...register('amount')} type="number" min="0" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select {...register('status')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {VENDOR_SERVICE_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>
      </form>

      {isEdit && (
        <div className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
          <h3 className="text-sm font-medium text-slate-700">Attachments</h3>
          <FileDropzone
            onUpload={(files) => uploadAttachments.mutateAsync(files)}
            uploading={uploadAttachments.isPending}
          />
          <AttachmentList
            attachments={attachments}
            onDelete={(attId) => deleteAttachment.mutate(attId)}
            deleting={deleteAttachment.isPending}
          />
        </div>
      )}
    </div>
  )
}
