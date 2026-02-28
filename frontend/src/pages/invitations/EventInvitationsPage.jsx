import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Trash2, SquarePen, Star, Users, UserPlus } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import useAuthStore from '../../stores/authStore'
import { useEvent } from '../../hooks/useEvents'
import {
  useInvitationsByEvent,
  useRsvpSummary,
  useUpdateInvitation,
  useDeleteInvitation,
} from '../../hooks/useInvitations'
import { cn } from '../../lib/utils'
import { INVITATION_STATUSES } from '../../lib/constants'

function RsvpBar({ summary }) {
  if (!summary) return null
  const total = summary.total_invited || 1
  const segments = [
    { key: 'confirmed', count: summary.confirmed, color: 'bg-green-500' },
    { key: 'declined', count: summary.declined, color: 'bg-red-400' },
    { key: 'maybe', count: summary.maybe, color: 'bg-orange-400' },
    { key: 'sent', count: summary.sent, color: 'bg-blue-400' },
    { key: 'pending', count: summary.pending, color: 'bg-slate-300' },
  ]

  return (
    <div className="space-y-2">
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
        {segments.map((s) =>
          s.count > 0 ? (
            <div key={s.key} className={s.color} style={{ width: `${(s.count / total) * 100}%` }} />
          ) : null
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {segments.map(
          (s) =>
            s.count > 0 && (
              <span key={s.key} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className={cn('w-2 h-2 rounded-full', s.color)} />
                {s.key}: {s.count}
              </span>
            )
        )}
      </div>
    </div>
  )
}

function StatusSelector({ invitation, onSelect, onClose }) {
  if (!invitation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl w-full max-w-sm p-5 pb-8 space-y-3 safe-bottom">
        <p className="text-sm font-medium text-slate-900">
          Update status for {invitation.guest?.first_name} {invitation.guest?.last_name || `Guest #${invitation.guest_id}`}
        </p>
        <div className="flex flex-wrap gap-2">
          {INVITATION_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => onSelect(invitation.id, status)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all',
                invitation.status === status
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

function InvitationEditSheet({ invitation, onSave, onClose, loading }) {
  if (!invitation) return null
  const [plusOnes, setPlusOnes] = useState(invitation.plus_ones || 0)
  const [notes, setNotes] = useState(invitation.notes || '')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl w-full max-w-sm p-5 pb-8 space-y-4 safe-bottom">
        <h3 className="text-lg font-semibold text-slate-900">Edit Invitation</h3>
        <p className="text-sm text-slate-500">
          {invitation.guest?.first_name} {invitation.guest?.last_name || `Guest #${invitation.guest_id}`}
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Plus Ones</label>
          <input
            type="number"
            min="0"
            value={plusOnes}
            onChange={(e) => setPlusOnes(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Special notes..."
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 active:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(invitation.id, { plus_ones: plusOnes, notes: notes || null })}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EventInvitationsPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const canManage = ['admin', 'manager'].includes(user?.role)
  const canDelete = user?.role === 'admin'

  const { data: event } = useEvent(eventId)
  const { data: summary } = useRsvpSummary(eventId)
  const { data, isLoading } = useInvitationsByEvent(eventId)
  const invitations = data?.items || data || []

  const updateInvitation = useUpdateInvitation()
  const deleteInvitation = useDeleteInvitation()

  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedInv, setSelectedInv] = useState(null)
  const [editingInv, setEditingInv] = useState(null)
  const [deletingInv, setDeletingInv] = useState(null)

  const filtered = invitations
    .filter((inv) => !statusFilter || inv.status === statusFilter)
    .filter((inv) => {
      if (!search) return true
      const name = `${inv.guest?.first_name || ''} ${inv.guest?.last_name || ''}`.toLowerCase()
      return name.includes(search.toLowerCase())
    })

  const handleStatusChange = (invId, newStatus) => {
    updateInvitation.mutate(
      { id: invId, data: { status: newStatus } },
      { onSuccess: () => setSelectedInv(null) }
    )
  }

  const handleEditSave = (invId, data) => {
    updateInvitation.mutate(
      { id: invId, data },
      { onSuccess: () => setEditingInv(null) }
    )
  }

  const handleDelete = () => {
    deleteInvitation.mutate(deletingInv.id, {
      onSuccess: () => setDeletingInv(null),
    })
  }

  return (
    <div>
      <PageHeader
        title={event?.name || 'Invitations'}
        backTo="/invitations"
      />

      {/* RSVP Summary */}
      {summary && summary.total_invited > 0 && (
        <div className="px-4 md:px-6 lg:px-8 py-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">RSVP Overview</span>
              <span className="text-xs font-semibold text-slate-700">
                {summary.total_invited} invited · {summary.total_expected_attendees} expected
              </span>
            </div>
            <RsvpBar summary={summary} />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 md:px-6 lg:px-8 pt-1 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guest name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Status filter */}
      <div className="px-4 md:px-6 lg:px-8 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setStatusFilter('')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
            !statusFilter ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
          )}
        >
          All
        </button>
        {INVITATION_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize',
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Invitation list */}
      {isLoading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={invitations.length === 0 ? 'No invitations yet' : 'No matching invitations'}
          description={invitations.length === 0 ? 'Invite guests to this event' : 'Try a different filter'}
        />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 py-3 pb-6 space-y-2">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {inv.guest?.first_name} {inv.guest?.last_name || `Guest #${inv.guest_id}`}
                  </p>
                  {inv.guest?.is_vip && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {inv.plus_ones > 0 && (
                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                      <Users className="w-3 h-3" /> +{inv.plus_ones}
                    </span>
                  )}
                  {inv.notes && (
                    <span className="text-xs text-slate-400 truncate max-w-[140px]">{inv.notes}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => setSelectedInv(inv)}>
                  <StatusBadge status={inv.status} />
                </button>
                {canManage && (
                  <button
                    onClick={() => setEditingInv(inv)}
                    className="p-1.5 rounded-full active:bg-slate-100"
                  >
                    <SquarePen className="w-4 h-4 text-slate-400" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setDeletingInv(inv)}
                    className="p-1.5 rounded-full active:bg-slate-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status selector bottom sheet */}
      {selectedInv && (
        <StatusSelector
          invitation={selectedInv}
          onSelect={handleStatusChange}
          onClose={() => setSelectedInv(null)}
        />
      )}

      {/* Edit bottom sheet */}
      {editingInv && (
        <InvitationEditSheet
          invitation={editingInv}
          onSave={handleEditSave}
          onClose={() => setEditingInv(null)}
          loading={updateInvitation.isPending}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingInv}
        onClose={() => setDeletingInv(null)}
        onConfirm={handleDelete}
        title="Remove Invitation"
        description={`Remove invitation for ${deletingInv?.guest?.first_name || 'this guest'}?`}
        loading={deleteInvitation.isPending}
      />

      {/* Invite guests FAB */}
      {canManage && (
        <FloatingButton
          onClick={() => navigate(`/invitations/event/${eventId}/invite`)}
          label="Invite Guests"
        />
      )}
    </div>
  )
}
