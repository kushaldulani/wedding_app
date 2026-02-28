import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mail, Calendar, Star, Users } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import useAuthStore from '../../stores/authStore'
import { useEvents } from '../../hooks/useEvents'
import {
  useAllInvitations,
  useMyInvitations,
  useUpdateInvitation,
  useCreateInvitation,
} from '../../hooks/useInvitations'
import { cn, formatDate } from '../../lib/utils'
import { INVITATION_STATUSES } from '../../lib/constants'

function StatusSelector({ invitation, guestId, eventId, onUpdate, onCreate, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 mb-16 sm:mb-0">
        <p className="text-base font-semibold text-slate-900">
          {invitation ? 'Update status' : 'Invite with status'}
        </p>
        <div className="flex flex-wrap gap-2">
          {INVITATION_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => {
                if (invitation) {
                  onUpdate(invitation.id, status)
                } else {
                  onCreate(guestId, eventId, status)
                }
              }}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all',
                invitation?.status === status
                  ? 'ring-2 ring-primary-500 bg-primary-50 text-primary-700'
                  : 'bg-slate-100 text-slate-600 active:bg-slate-200'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


function GuestInvitationsView() {
  const { data, isLoading } = useMyInvitations()
  const invitations = data?.items || data || []

  if (isLoading) return <LoadingScreen />

  if (invitations.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No invitations"
        description="You don't have any invitations yet"
      />
    )
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-4 space-y-3 pb-6">
      <p className="text-xs text-slate-500">Your invitations to wedding events</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {invitations.map((inv) => (
          <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {inv.event?.name || `Event #${inv.event_id}`}
                </p>
                {inv.event?.event_date && (
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(inv.event.event_date)}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={inv.status} />
                  {inv.plus_ones > 0 && (
                    <span className="text-xs text-slate-400">+{inv.plus_ones} guests</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InvitationsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isGuest = user?.role === 'guest'
  const canManage = ['admin', 'manager'].includes(user?.role)

  const { data: eventsData, isLoading: eventsLoading } = useEvents()
  const events = eventsData?.items || eventsData || []

  const { data: invData, isLoading: invLoading } = useAllInvitations()
  const invitations = invData || []

  // Derive unique guests from invitations (guest data is embedded in each invitation)
  const guests = useMemo(() => {
    const guestMap = new Map()
    for (const inv of invitations) {
      if (inv.guest && !guestMap.has(inv.guest.id)) {
        guestMap.set(inv.guest.id, inv.guest)
      }
    }
    return Array.from(guestMap.values())
  }, [invitations])

  const updateInvitation = useUpdateInvitation()
  const createInvitation = useCreateInvitation()

  const [selectedEvents, setSelectedEvents] = useState(null) // null = all
  const [search, setSearch] = useState('')
  const [statusSheet, setStatusSheet] = useState(null)

  // Derive selected event IDs (null = all events)
  const activeEventIds = useMemo(() => {
    if (selectedEvents === null) return events.map((e) => e.id)
    return selectedEvents
  }, [selectedEvents, events])

  const allSelected = selectedEvents === null || (events.length > 0 && selectedEvents?.length === events.length)

  // Build invitation lookup: "guestId-eventId" → invitation
  const invMap = useMemo(() => {
    const map = {}
    for (const inv of invitations) {
      map[`${inv.guest_id}-${inv.event_id}`] = inv
    }
    return map
  }, [invitations])

  // Filter guests
  const filteredGuests = useMemo(() => {
    let list = guests

    // Search by name
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((g) => {
        const name = `${g.first_name || ''} ${g.last_name || ''}`.toLowerCase()
        return name.includes(q)
      })
    }

    // Sort: guests with invitations for selected events first, then alphabetically
    list = [...list].sort((a, b) => {
      const aHas = activeEventIds.some((eid) => invMap[`${a.id}-${eid}`])
      const bHas = activeEventIds.some((eid) => invMap[`${b.id}-${eid}`])
      if (aHas && !bHas) return -1
      if (!aHas && bHas) return 1
      const aName = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase()
      const bName = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase()
      return aName.localeCompare(bName)
    })

    return list
  }, [guests, search, activeEventIds, invMap])

  const toggleEvent = (eventId) => {
    setSelectedEvents((prev) => {
      if (prev === null) {
        // Was "all" - now deselect this one
        return events.filter((e) => e.id !== eventId).map((e) => e.id)
      }
      const has = prev.includes(eventId)
      const next = has ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      // If all events selected, go back to null (All)
      if (next.length === events.length) return null
      return next
    })
  }

  const toggleAll = () => {
    setSelectedEvents(allSelected ? [] : null)
  }

  const handleStatusUpdate = (invId, newStatus) => {
    updateInvitation.mutate(
      { id: invId, data: { status: newStatus } },
      { onSuccess: () => setStatusSheet(null) }
    )
  }

  const handleCreateInvitation = (guestId, eventId, status) => {
    createInvitation.mutate(
      { guest_id: guestId, event_id: eventId, status },
      { onSuccess: () => setStatusSheet(null) }
    )
  }

  if (isGuest) {
    return (
      <div>
        <PageHeader title="My Invitations" />
        <GuestInvitationsView />
      </div>
    )
  }

  const isLoading = eventsLoading || invLoading

  return (
    <div>
      <PageHeader title="Invitations" />

      {isLoading ? (
        <LoadingScreen />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No events yet"
          description="Create events first, then manage invitations"
        />
      ) : (
        <>
          {/* Event multi-select filter */}
          <div className="px-4 md:px-6 lg:px-8 pt-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={toggleAll}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                allSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
              )}
            >
              All
            </button>
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => toggleEvent(event.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                  activeEventIds.includes(event.id)
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {event.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-4 md:px-6 lg:px-8 pt-2 pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guests..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Guest list */}
          {filteredGuests.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No guests found"
              description={search ? 'Try a different search' : 'Use the + button to invite guests'}
            />
          ) : (
            <div className="px-4 md:px-6 lg:px-8 py-3 pb-24 space-y-2">
              {filteredGuests.map((guest) => {
                const hasAnyInvitation = activeEventIds.some(
                  (eid) => invMap[`${guest.id}-${eid}`]
                )
                return (
                  <div
                    key={guest.id}
                    className="bg-white rounded-xl border border-slate-100 p-3"
                  >
                    {/* Guest header */}
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate flex-1">
                        {guest.first_name} {guest.last_name}
                      </p>
                      {guest.is_vip && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                      {guest.side && (
                        <span className="text-[10px] text-slate-400 capitalize flex-shrink-0">
                          {guest.side}
                        </span>
                      )}
                    </div>

                    {/* Event status rows */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {activeEventIds.map((eventId) => {
                        const inv = invMap[`${guest.id}-${eventId}`]
                        const eventObj = events.find((e) => e.id === eventId)
                        if (!eventObj) return null

                        return (
                          <button
                            key={eventId}
                            onClick={() => {
                              if (canManage) {
                                setStatusSheet({ invitation: inv, guestId: guest.id, eventId })
                              }
                            }}
                            disabled={!canManage}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all',
                              inv
                                ? 'bg-slate-50 active:bg-slate-100'
                                : 'bg-slate-50 active:bg-slate-100',
                              !canManage && 'cursor-default'
                            )}
                          >
                            <span className="text-slate-500 truncate max-w-[80px]">
                              {eventObj.name}:
                            </span>
                            {inv ? (
                              <StatusBadge status={inv.status} className="text-[10px] px-1.5 py-0" />
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Not Invited
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Status selector bottom sheet */}
      {statusSheet && (
        <StatusSelector
          invitation={statusSheet.invitation}
          guestId={statusSheet.guestId}
          eventId={statusSheet.eventId}
          onUpdate={handleStatusUpdate}
          onCreate={handleCreateInvitation}
          onClose={() => setStatusSheet(null)}
        />
      )}

      {/* FAB for bulk invite */}
      {canManage && events.length > 0 && (
        <FloatingButton
          onClick={() => navigate('/invitations/invite')}
          label="Invite Guests"
        />
      )}
    </div>
  )
}
