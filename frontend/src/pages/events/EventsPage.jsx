import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Download } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import useAuthStore from '../../stores/authStore'
import { useEvents } from '../../hooks/useEvents'
import { exportEvents } from '../../api/events'
import { formatDate, formatTime, downloadBlob } from '../../lib/utils'
import { EVENT_STATUSES } from '../../lib/constants'

export default function EventsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isGuest = user?.role === 'guest'
  const [statusFilter, setStatusFilter] = useState('')
  const [exporting, setExporting] = useState(false)
  const { data, isLoading } = useEvents(
    statusFilter ? { status: statusFilter } : undefined
  )

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportEvents(statusFilter ? { status: statusFilter } : undefined)
      downloadBlob(blob, 'events.xlsx')
    } finally {
      setExporting(false)
    }
  }

  const events = data?.items || data || []

  return (
    <div>
      <PageHeader
        title="Events"
        action={
          !isGuest && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium active:bg-slate-200 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          )
        }
      />

      {/* Filter chips */}
      <div className="px-4 md:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            !statusFilter
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          All
        </button>
        {EVENT_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Create your first event to get started"
        />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="w-full p-4 bg-white rounded-2xl border border-slate-100 text-left active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 text-sm">{event.name}</h3>
                <StatusBadge status={event.status} />
              </div>
              {event.event_type_name && (
                <p className="text-xs text-primary-600 font-medium mb-1">
                  {event.event_type_name}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(event.event_date)}
                  {event.start_time && ` at ${formatTime(event.start_time)}`}
                </span>
                {event.venue_name && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {event.venue_name}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {!isGuest && <FloatingButton onClick={() => navigate('/events/new')} label="New Event" />}
    </div>
  )
}
