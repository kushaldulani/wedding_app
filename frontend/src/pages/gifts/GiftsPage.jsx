import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Heart, Download } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import { useGifts, useGiftsSummary } from '../../hooks/useGifts'
import { exportGifts } from '../../api/gifts'
import { formatCurrency, formatDate, cn, downloadBlob } from '../../lib/utils'

export default function GiftsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [exporting, setExporting] = useState(false)
  const { data, isLoading } = useGifts()
  const { data: summary } = useGiftsSummary()

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportGifts()
      downloadBlob(blob, 'gifts.xlsx')
    } finally {
      setExporting(false)
    }
  }
  const gifts = data?.items || data || []

  const filtered =
    tab === 'pending'
      ? gifts.filter((g) => !g.thank_you_sent)
      : gifts

  return (
    <div>
      <PageHeader
        title="Gifts / Shagun"
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

      {/* Summary bar */}
      {summary && (
        <div className="px-4 md:px-6 lg:px-8 py-3">
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-green-50 rounded-xl text-center">
              <p className="text-[10px] text-green-600 font-medium">Total Cash</p>
              <p className="text-sm font-bold text-green-700">{formatCurrency(summary.total_cash_amount)}</p>
            </div>
            <div className="flex-1 p-3 bg-purple-50 rounded-xl text-center">
              <p className="text-[10px] text-purple-600 font-medium">Total Gifts</p>
              <p className="text-sm font-bold text-purple-700">{summary.total_gifts}</p>
            </div>
            <div className="flex-1 p-3 bg-amber-50 rounded-xl text-center">
              <p className="text-[10px] text-amber-600 font-medium">Thank You Pending</p>
              <p className="text-sm font-bold text-amber-700">{summary.thank_you_pending}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 py-2 flex gap-2">
        {['all', 'pending'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium capitalize',
              tab === t ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {t === 'pending' ? 'Thank You Pending' : 'All Gifts'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Gift} title="No gifts recorded" description="Track shagun and gifts received" />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((gift) => (
            <button
              key={gift.id}
              onClick={() => navigate(`/gifts/${gift.id}/edit`)}
              className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex-shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {gift.description || `Gift #${gift.id}`}
                </p>
                <p className="text-xs text-slate-500">
                  Guest #{gift.guest_id}
                  {gift.received_at && ` · ${formatDate(gift.received_at)}`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {gift.amount && (
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(gift.amount)}</p>
                )}
                {!gift.thank_you_sent && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                    <Heart className="w-3 h-3" /> pending
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <FloatingButton onClick={() => navigate('/gifts/new')} label="New Gift" />
    </div>
  )
}
