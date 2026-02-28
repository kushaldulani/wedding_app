import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Check, UserPlus } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import { useGuests } from '../../hooks/useGuests'
import { useEvents } from '../../hooks/useEvents'
import { useAllInvitations, useBulkInvite } from '../../hooks/useInvitations'
import { cn, getInitials } from '../../lib/utils'

export default function InviteGuestsPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const { data: eventsData, isLoading: eventsLoading } = useEvents()
  const events = eventsData?.items || eventsData || []

  const { data: guestData, isLoading: guestsLoading } = useGuests({ page_size: 100 })
  const guests = guestData?.items || guestData || []

  const { data: invData } = useAllInvitations()
  const allInvitations = invData || []

  // Build a set of "guestId-eventId" for already invited
  const invitedSet = useMemo(() => {
    const set = new Set()
    for (const inv of allInvitations) {
      set.add(`${inv.guest_id}-${inv.event_id}`)
    }
    return set
  }, [allInvitations])

  // Event selection (multi-select)
  const [selectedEventIds, setSelectedEventIds] = useState(() => {
    if (eventId) return new Set([Number(eventId)])
    return new Set()
  })
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState('')
  const [inviting, setInviting] = useState(false)
  const bulkInvite = useBulkInvite()

  const toggleEvent = (id) => {
    setSelectedEventIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSelected(new Set())
  }

  const selectAllEvents = () => {
    if (selectedEventIds.size === events.length) {
      setSelectedEventIds(new Set())
    } else {
      setSelectedEventIds(new Set(events.map((e) => e.id)))
    }
    setSelected(new Set())
  }

  // A guest is "already invited" if invited to ALL selected events
  // A guest is "available" if NOT invited to at least one selected event
  const { availableGuests, alreadyInvitedGuests } = useMemo(() => {
    const eventIds = [...selectedEventIds]
    if (eventIds.length === 0) return { availableGuests: [], alreadyInvitedGuests: [] }

    let list = guests
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((g) =>
        `${g.first_name} ${g.last_name}`.toLowerCase().includes(q)
      )
    }

    const available = []
    const invited = []
    for (const g of list) {
      const invitedToAll = eventIds.every((eid) => invitedSet.has(`${g.id}-${eid}`))
      if (invitedToAll) {
        invited.push(g)
      } else {
        available.push(g)
      }
    }
    return { availableGuests: available, alreadyInvitedGuests: invited }
  }, [guests, search, selectedEventIds, invitedSet])

  const toggleSelect = (guestId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(guestId)) next.delete(guestId)
      else next.add(guestId)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === availableGuests.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(availableGuests.map((g) => g.id)))
    }
  }

  const handleInvite = async () => {
    if (selected.size === 0 || selectedEventIds.size === 0) return
    setInviting(true)
    const guestIds = [...selected]
    const eventIds = [...selectedEventIds]

    try {
      for (const eid of eventIds) {
        // Filter out guests already invited to this specific event
        const toInvite = guestIds.filter((gid) => !invitedSet.has(`${gid}-${eid}`))
        if (toInvite.length > 0) {
          await bulkInvite.mutateAsync({ event_id: eid, guest_ids: toInvite })
        }
      }
      navigate('/invitations')
    } finally {
      setInviting(false)
    }
  }

  const isLoading = eventsLoading || guestsLoading

  return (
    <div>
      <PageHeader
        title="Invite Guests"
        backTo="/invitations"
        action={
          selected.size > 0 && selectedEventIds.size > 0 && (
            <button
              onClick={handleInvite}
              disabled={inviting}
              className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {inviting ? 'Inviting...' : `Invite (${selected.size})`}
            </button>
          )
        }
      />

      {isLoading ? (
        <LoadingScreen />
      ) : events.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No events yet"
          description="Create events first, then invite guests"
        />
      ) : (
        <>
          {/* Event selection */}
          <div className="px-4 md:px-6 lg:px-8 pt-2 pb-1">
            <p className="text-xs text-slate-500 mb-2">Select events to invite to</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={selectAllEvents}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                  selectedEventIds.size === events.length
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                All Events
              </button>
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => toggleEvent(event.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                    selectedEventIds.has(event.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {event.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-4 md:px-6 lg:px-8 pt-2 pb-2">
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

          {selectedEventIds.size === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Select events"
              description="Choose one or more events above to see available guests"
            />
          ) : guests.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No guests yet"
              description="Add guests first, then invite them to events"
            />
          ) : (
            <div className="px-4 md:px-6 lg:px-8 py-2 pb-6 space-y-3">
              {/* Select all toggle */}
              {availableGuests.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {availableGuests.length} guest{availableGuests.length !== 1 ? 's' : ''} available
                  </span>
                  <button
                    onClick={toggleAll}
                    className="text-xs font-medium text-primary-600 active:text-primary-800"
                  >
                    {selected.size === availableGuests.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              )}

              {/* Available guests */}
              {availableGuests.length > 0 ? (
                <div className="space-y-1.5">
                  {availableGuests.map((guest) => {
                    const isSelected = selected.has(guest.id)
                    return (
                      <button
                        key={guest.id}
                        onClick={() => toggleSelect(guest.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                          isSelected
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-slate-100 bg-white active:bg-slate-50'
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold flex-shrink-0',
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : 'bg-primary-100 text-primary-700'
                          )}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            getInitials(guest.first_name, guest.last_name)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {guest.first_name} {guest.last_name}
                          </p>
                          {guest.side && (
                            <p className="text-xs text-slate-500 capitalize">{guest.side}</p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-slate-500">
                    All guests are already invited to the selected event{selectedEventIds.size > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Already invited */}
              {alreadyInvitedGuests.length > 0 && (
                <>
                  <div className="pt-2">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Already Invited ({alreadyInvitedGuests.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {alreadyInvitedGuests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 opacity-50"
                      >
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex-shrink-0">
                          {getInitials(guest.first_name, guest.last_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-600 truncate">
                            {guest.first_name} {guest.last_name}
                          </p>
                          {guest.side && (
                            <p className="text-xs text-slate-400 capitalize">{guest.side}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">
                          Invited
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
