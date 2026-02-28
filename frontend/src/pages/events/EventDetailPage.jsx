import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Trash2, Calendar, MapPin, Clock, Wrench, CheckSquare } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useEvent, useDeleteEvent } from '../../hooks/useEvents'
import { useVendorServices } from '../../hooks/useVendorServices'
import { useTasks } from '../../hooks/useTasks'
import { formatDate, formatTime, formatCurrency } from '../../lib/utils'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: event, isLoading } = useEvent(id)
  const { data: servicesData, isLoading: servicesLoading } = useVendorServices({ event_id: id })
  const { data: tasksData, isLoading: tasksLoading } = useTasks({ event_id: id })
  const deleteEvent = useDeleteEvent()
  const [showDelete, setShowDelete] = useState(false)

  const services = servicesData?.items || servicesData || []
  const tasks = tasksData?.items || tasksData || []

  if (isLoading) return <LoadingScreen />
  if (!event) return null

  const handleDelete = () => {
    deleteEvent.mutate(id, {
      onSuccess: () => navigate('/events'),
    })
  }

  return (
    <div>
      <PageHeader
        title={event.name}
        backTo="/events"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/events/${id}/edit`)}
              className="p-2 rounded-full active:bg-slate-100"
            >
              <Edit className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-2 rounded-full active:bg-slate-100"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        <div className="flex items-center gap-2">
          <StatusBadge status={event.status} />
          <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full">
            {event.event_type_name || '-'}
          </span>
        </div>

        <p className="text-sm text-slate-600">{event.description || '-'}</p>

        <div className="space-y-3 bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700">{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700">
              {event.start_time || event.end_time
                ? `${event.start_time ? formatTime(event.start_time) : ''}${event.end_time ? ` - ${formatTime(event.end_time)}` : ''}`
                : '-'}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-700">{event.venue_name || '-'}</p>
              {event.venue_address && (
                <p className="text-xs text-slate-500">{event.venue_address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Services</h3>
          {servicesLoading ? (
            <p className="text-xs text-slate-400">Loading...</p>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center py-6 bg-slate-50 rounded-2xl">
              <Wrench className="w-6 h-6 text-slate-300 mb-1.5" />
              <p className="text-xs text-slate-400">No services linked to this event</p>
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
        </div>

        {/* Tasks */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Tasks</h3>
          {tasksLoading ? (
            <p className="text-xs text-slate-400">Loading...</p>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center py-6 bg-slate-50 rounded-2xl">
              <CheckSquare className="w-6 h-6 text-slate-300 mb-1.5" />
              <p className="text-xs text-slate-400">No tasks linked to this event</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow text-left"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex-shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{task.priority} priority</p>
                  </div>
                  <StatusBadge status={task.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        description={`Are you sure you want to delete "${event.name}"?`}
        loading={deleteEvent.isPending}
      />
    </div>
  )
}
