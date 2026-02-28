import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Phone, CheckCircle, Circle, Download } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import { useVendors } from '../../hooks/useVendors'
import { exportVendors } from '../../api/vendors'
import { cn, downloadBlob } from '../../lib/utils'

export default function VendorsPage() {
  const navigate = useNavigate()
  const [bookedFilter, setBookedFilter] = useState('')
  const [exporting, setExporting] = useState(false)
  const params = {}
  if (bookedFilter !== '') params.is_booked = bookedFilter

  const { data, isLoading } = useVendors(params)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportVendors(bookedFilter !== '' ? { is_booked: bookedFilter } : undefined)
      downloadBlob(blob, 'vendors.xlsx')
    } finally {
      setExporting(false)
    }
  }
  const vendors = data?.items || data || []

  return (
    <div>
      <PageHeader
        title="Vendors"
        action={
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium active:bg-slate-200 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-3 flex gap-2">
        {[
          { label: 'All', value: '' },
          { label: 'Booked', value: 'true' },
          { label: 'Not Booked', value: 'false' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setBookedFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium',
              bookedFilter === f.value ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : vendors.length === 0 ? (
        <EmptyState icon={Store} title="No vendors yet" description="Add vendors for your wedding" />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {vendors.map((vendor) => (
            <button
              key={vendor.id}
              onClick={() => navigate(`/vendors/${vendor.id}`)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{vendor.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {vendor.contact_person || 'No contact person'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {vendor.is_booked ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <FloatingButton onClick={() => navigate('/vendors/new')} label="New Vendor" />
    </div>
  )
}
