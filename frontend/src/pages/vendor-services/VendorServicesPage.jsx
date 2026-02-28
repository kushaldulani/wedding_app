import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Download, Search } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import { useVendorServices } from '../../hooks/useVendorServices'
import { useEvents } from '../../hooks/useEvents'
import { exportVendorServices } from '../../api/vendor-services'
import { cn, downloadBlob, formatDate, formatCurrency } from '../../lib/utils'
import { VENDOR_SERVICE_STATUSES } from '../../lib/constants'

export default function VendorServicesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  const { data: eventsData } = useEvents({ page_size: 100 })
  const events = eventsData?.items || eventsData || []

  const { data, isLoading } = useVendorServices({ page_size: 1000, refetchOnWindowFocus: true })

  const allServices = data?.items || data || []

  const filteredServices = useMemo(() => {
    let result = allServices
    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter)
    }
    if (eventFilter) {
      result = result.filter((s) => String(s.event_id) === eventFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q)
      )
    }
    return result
  }, [allServices, statusFilter, eventFilter, search])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportVendorServices(statusFilter ? { status: statusFilter } : undefined)
      downloadBlob(blob, 'vendor_services.xlsx')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Vendor Services"
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

      <div className="px-4 md:px-6 lg:px-8 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 py-2 flex items-center gap-3">
        <div className="flex gap-2 overflow-x-auto flex-1">
          <button
            onClick={() => setStatusFilter('')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
              statusFilter === '' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            All
          </button>
          {VENDOR_SERVICE_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap',
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
              )}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[130px]"
        >
          <option value="">All Events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : filteredServices.length === 0 ? (
        <EmptyState icon={Wrench} title="No vendor services yet" description="Add services needed for your wedding" />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 pb-6 grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredServices.map((svc) => (
            <button
              key={svc.id}
              onClick={() => navigate(`/vendor-services/${svc.id}`)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex-shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{svc.title}</p>
                <p className="text-xs text-slate-500">
                  {svc.service_date ? formatDate(svc.service_date) : 'No date set'}
                  {svc.amount != null && svc.amount !== 0 && ` · ${formatCurrency(svc.amount)}`}
                </p>
              </div>
              <StatusBadge status={svc.status} />
            </button>
          ))}
        </div>
      )}

      <FloatingButton onClick={() => navigate('/vendor-services/new')} label="New Service" />
    </div>
  )
}
