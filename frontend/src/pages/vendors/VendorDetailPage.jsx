import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Trash2, Phone, Mail, Globe, MapPin, Store, CheckCircle, Wrench } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import ConfirmDialog from '../../components/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge'
import { useVendor, useDeleteVendor } from '../../hooks/useVendors'
import { useVendorServices } from '../../hooks/useVendorServices'
import { formatDate, formatCurrency } from '../../lib/utils'

function InfoRow({ icon: Icon, label, value, isLink }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        {value && isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm text-slate-700">{value || '-'}</p>
        )}
      </div>
    </div>
  )
}

export default function VendorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: vendor, isLoading } = useVendor(id)
  const { data: servicesData, isLoading: servicesLoading } = useVendorServices({ vendor_id: id })
  const deleteVendor = useDeleteVendor()
  const [showDelete, setShowDelete] = useState(false)

  const services = servicesData?.items || servicesData || []

  if (isLoading) return <LoadingScreen />
  if (!vendor) return null

  return (
    <div>
      <PageHeader
        title={vendor.name}
        backTo="/vendors"
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate(`/vendors/${id}/edit`)} className="p-2 rounded-full active:bg-slate-100">
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
          {vendor.is_booked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Booked
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              Not Booked
            </span>
          )}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
          <InfoRow icon={Store} label="Contact Person" value={vendor.contact_person} />
          <InfoRow icon={Phone} label="Phone" value={vendor.phone} />
          <InfoRow icon={Mail} label="Email" value={vendor.email} />
          <InfoRow icon={Globe} label="Website" value={vendor.website} isLink />
          <InfoRow icon={MapPin} label="Address" value={vendor.address} />
        </div>

        {vendor.notes && (
          <div className="p-4 bg-amber-50 rounded-2xl">
            <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
            <p className="text-sm text-amber-800">{vendor.notes}</p>
          </div>
        )}

        {/* Associated Services */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Services</h3>
          {servicesLoading ? (
            <p className="text-xs text-slate-400">Loading services...</p>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center py-6 bg-slate-50 rounded-2xl">
              <Wrench className="w-6 h-6 text-slate-300 mb-1.5" />
              <p className="text-xs text-slate-400">No services linked to this vendor</p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => navigate(`/vendor-services/${svc.id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow text-left"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{svc.title}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {svc.service_date ? formatDate(svc.service_date) : 'No date set'}
                      {svc.amount != null && ` · ${formatCurrency(svc.amount)}`}
                    </p>
                  </div>
                  <StatusBadge status={svc.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteVendor.mutate(id, { onSuccess: () => navigate('/vendors') })}
        title="Delete Vendor"
        description={`Remove "${vendor.name}"?`}
        loading={deleteVendor.isPending}
      />
    </div>
  )
}
