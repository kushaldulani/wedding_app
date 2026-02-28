import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Phone, Star, Search, Download } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import { useGuests } from '../../hooks/useGuests'
import { exportGuests } from '../../api/guests'
import { cn, getInitials, downloadBlob } from '../../lib/utils'
import { GUEST_SIDES } from '../../lib/constants'

export default function GuestsPage() {
  const navigate = useNavigate()
  const [sideFilter, setSideFilter] = useState('')
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  const params = {}
  if (sideFilter) params.side = sideFilter

  const { data, isLoading } = useGuests(params)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportGuests(sideFilter ? { side: sideFilter } : undefined)
      downloadBlob(blob, 'guests.xlsx')
    } finally {
      setExporting(false)
    }
  }
  const guests = data?.items || data || []

  const filtered = search
    ? guests.filter(
        (g) =>
          `${g.first_name} ${g.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
          g.phone?.includes(search)
      )
    : guests

  return (
    <div>
      <PageHeader
        title="Guests"
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

      {/* Search */}
      <div className="px-4 md:px-6 lg:px-8 pt-2 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Side filter */}
      <div className="px-4 md:px-6 lg:px-8 py-2 flex gap-2">
        <button
          onClick={() => setSideFilter('')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium',
            !sideFilter ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
          )}
        >
          All
        </button>
        {GUEST_SIDES.map((s) => (
          <button
            key={s}
            onClick={() => setSideFilter(s)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium capitalize',
              sideFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests yet"
          description="Add guests to your wedding list"
        />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((guest) => (
            <button
              key={guest.id}
              onClick={() => navigate(`/guests/${guest.id}`)}
              className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex-shrink-0">
                {getInitials(guest.first_name, guest.last_name)}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {guest.first_name} {guest.last_name}
                  </p>
                  {guest.is_vip && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="capitalize">{guest.side}</span>
                  {guest.family_group_name && (
                    <>
                      <span>·</span>
                      <span className="truncate">{guest.family_group_name}</span>
                    </>
                  )}
                </div>
              </div>
              {guest.phone && (
                <Phone className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      <FloatingButton onClick={() => navigate('/guests/new')} label="New Guest" />
    </div>
  )
}
