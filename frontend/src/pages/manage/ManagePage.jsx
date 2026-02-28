import { useNavigate } from 'react-router-dom'
import { Calendar, Store, UtensilsCrossed, Gift, UsersRound, Home, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/PageHeader'

const lookupTypes = [
  {
    slug: 'event-types',
    label: 'Event Types',
    description: 'Mehendi, Haldi, Sangeet, Reception...',
    icon: Calendar,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    slug: 'vendor-categories',
    label: 'Vendor Categories',
    description: 'Photographer, Caterer, Decorator...',
    icon: Store,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    slug: 'dietary-preferences',
    label: 'Dietary Preferences',
    description: 'Veg, Non-Veg, Jain, Vegan...',
    icon: UtensilsCrossed,
    color: 'bg-green-100 text-green-600',
  },
  {
    slug: 'gift-types',
    label: 'Gift Types',
    description: 'Cash, Gold, Silver, Item...',
    icon: Gift,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    slug: 'relation-types',
    label: 'Relation Types',
    description: 'Father, Mother, Mama, Friend...',
    icon: UsersRound,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    slug: 'family-groups',
    label: 'Family Groups',
    description: 'Sharma Family, Patel Family...',
    icon: Home,
    color: 'bg-cyan-100 text-cyan-600',
  },
]

export default function ManagePage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader title="Manage Categories" />

      <div className="px-4 md:px-6 lg:px-8 py-4">
        <p className="text-xs text-slate-500 mb-3">
          Add, edit, or remove dropdown options used across the app.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {lookupTypes.map((item) => (
          <button
            key={item.slug}
            onClick={() => navigate(`/manage/${item.slug}`)}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow text-left"
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl ${item.color} flex-shrink-0`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500 truncate">{item.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
        ))}
        </div>
      </div>
    </div>
  )
}
