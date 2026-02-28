import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Trash2, Calendar, Clock, IndianRupee, Wrench, Store, FileText } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import ConfirmDialog from '../../components/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge'
import { useVendorService, useDeleteVendorService } from '../../hooks/useVendorServices'
import { useVendor } from '../../hooks/useVendors'
import { useEvent } from '../../hooks/useEvents'
import { formatDate, formatTime, formatCurrency } from '../../lib/utils'

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  )
}

export default function VendorServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: svc, isLoading } = useVendorService(id)
  const deleteService = useDeleteVendorService()
  const [showDelete, setShowDelete] = useState(false)

  const { data: vendor } = useVendor(svc?.vendor_id)
  const { data: event } = useEvent(svc?.event_id)

  if (isLoading) return <LoadingScreen />
  if (!svc) return null

  const timeRange =
    svc.start_time || svc.end_time
      ? [svc.start_time && formatTime(svc.start_time), svc.end_time && formatTime(svc.end_time)]
          .filter(Boolean)
          .join(' – ')
      : null

  return (
    <div>
      <PageHeader
        title={svc.title}
        backTo="/vendor-services"
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate(`/vendor-services/${id}/edit`)} className="p-2 rounded-full active:bg-slate-100">
              <Edit className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={() => setShowDelete(true)} className="p-2 rounded-full active:bg-slate-100">
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        <div className="flex items-center gap-2">
          <StatusBadge status={svc.status} />
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
          <InfoRow icon={Store} label="Vendor" value={vendor?.name} />
          <InfoRow icon={Calendar} label="Event" value={event?.name} />
          <InfoRow icon={Calendar} label="Service Date" value={svc.service_date && formatDate(svc.service_date)} />
          <InfoRow icon={Clock} label="Time" value={timeRange} />
          <InfoRow icon={IndianRupee} label="Amount" value={svc.amount != null && formatCurrency(svc.amount)} />
          <InfoRow icon={FileText} label="Description" value={svc.description} />
        </div>

        {svc.notes && (
          <div className="p-4 bg-amber-50 rounded-2xl">
            <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
            <p className="text-sm text-amber-800">{svc.notes}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteService.mutate(id, { onSuccess: () => navigate('/vendor-services') })}
        title="Delete Service"
        description={`Remove "${svc.title}"?`}
        loading={deleteService.isPending}
      />
    </div>
  )
}
