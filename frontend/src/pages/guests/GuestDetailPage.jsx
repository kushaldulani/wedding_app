import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Trash2, Phone, Mail, Star, Users as UsersIcon } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useGuest, useDeleteGuest } from '../../hooks/useGuests'
import { getInitials } from '../../lib/utils'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700">{value || '-'}</p>
      </div>
    </div>
  )
}

export default function GuestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: guest, isLoading } = useGuest(id)
  const deleteGuest = useDeleteGuest()
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading) return <LoadingScreen />
  if (!guest) return null

  const handleDelete = () => {
    deleteGuest.mutate(id, {
      onSuccess: () => navigate('/guests'),
    })
  }

  return (
    <div>
      <PageHeader
        title="Guest Details"
        backTo="/guests"
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate(`/guests/${id}/edit`)} className="p-2 rounded-full active:bg-slate-100">
              <Edit className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={() => setShowDelete(true)} className="p-2 rounded-full active:bg-slate-100">
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6 max-w-2xl">
        {/* Profile card */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold mb-3">
            {getInitials(guest.first_name, guest.last_name)}
          </div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            {guest.first_name} {guest.last_name}
            {guest.is_vip && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
          </h2>
          <span className="text-sm text-primary-600 capitalize font-medium">{guest.side} side</span>
        </div>

        {/* Info */}
        <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
          <InfoRow icon={Phone} label="Phone" value={guest.phone} />
          <InfoRow icon={Mail} label="Email" value={guest.email} />
          <InfoRow icon={UsersIcon} label="Family Group" value={guest.family_group_name} />
          <InfoRow icon={UsersIcon} label="Age Group" value={guest.age_group} />
        </div>

        {guest.notes && (
          <div className="mt-4 p-4 bg-amber-50 rounded-2xl">
            <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
            <p className="text-sm text-amber-800">{guest.notes}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Guest"
        description={`Remove ${guest.first_name} ${guest.last_name} from the guest list?`}
        loading={deleteGuest.isPending}
      />
    </div>
  )
}
