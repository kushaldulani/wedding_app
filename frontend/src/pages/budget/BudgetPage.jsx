import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, Plus, Trash2, Download } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useBudgetOverview, useExpenses, useDeleteCategory, useDeleteExpense } from '../../hooks/useBudget'
import { exportCategories, exportExpenses } from '../../api/budget'
import { formatCurrency, formatDate, downloadBlob } from '../../lib/utils'
import { cn } from '../../lib/utils'

export default function BudgetPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const { data: overview, isLoading: loadingOverview } = useBudgetOverview()
  const { data: expensesData, isLoading: loadingExpenses } = useExpenses()
  const deleteCategory = useDeleteCategory()
  const deleteExpense = useDeleteExpense()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      if (tab === 'overview') {
        const blob = await exportCategories()
        downloadBlob(blob, 'budget_categories.xlsx')
      } else {
        const blob = await exportExpenses()
        downloadBlob(blob, 'expenses.xlsx')
      }
    } finally {
      setExporting(false)
    }
  }

  const expenses = expensesData?.items || expensesData || []

  return (
    <div>
      <PageHeader
        title="Budget"
        action={
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium active:bg-slate-200 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'Exporting...' : `Export ${tab === 'overview' ? 'Categories' : 'Expenses'}`}
          </button>
        }
      />

      {/* Tabs */}
      <div className="px-4 md:px-6 lg:px-8 py-3 flex gap-2">
        {['overview', 'expenses'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium capitalize',
              tab === t ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="px-4 md:px-6 lg:px-8 space-y-4 pb-6">
          {loadingOverview ? (
            <LoadingScreen />
          ) : !overview ? (
            <EmptyState icon={Wallet} title="No budget set" description="Add budget categories to track spending" />
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-[10px] text-green-600 font-medium">Estimated</p>
                  <p className="text-sm font-bold text-green-700">{formatCurrency(overview.total_estimated)}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <p className="text-[10px] text-red-600 font-medium">Spent</p>
                  <p className="text-sm font-bold text-red-700">{formatCurrency(overview.total_spent)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-[10px] text-blue-600 font-medium">Remaining</p>
                  <p className="text-sm font-bold text-blue-700">{formatCurrency(overview.remaining)}</p>
                </div>
              </div>

              {/* Category breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Categories</h3>
                  <button
                    onClick={() => navigate('/budget/categories/new')}
                    className="text-xs text-primary-600 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(overview.categories || []).map((cat) => {
                  const percent = cat.estimated_amount > 0
                    ? Math.min(100, (cat.total_spent / cat.estimated_amount) * 100)
                    : 0
                  return (
                    <div key={cat.id} className="p-3 bg-white rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-slate-900 truncate flex-1">{cat.category}</p>
                        <button
                          onClick={() => setDeleteTarget({ type: 'category', id: cat.id, name: cat.category })}
                          className="p-1 rounded active:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{formatCurrency(cat.total_spent)} / {formatCurrency(cat.estimated_amount)}</span>
                        <span>{percent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', percent > 90 ? 'bg-red-500' : 'bg-primary-500')}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="px-4 md:px-6 lg:px-8 space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">All Expenses</h3>
            <button
              onClick={() => navigate('/budget/expenses/new')}
              className="text-xs text-primary-600 font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {loadingExpenses ? (
            <LoadingScreen />
          ) : expenses.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No expenses yet" description="Track your wedding spending" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {expenses.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => navigate(`/budget/expenses/${exp.id}/edit`)}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 text-left active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{exp.description}</p>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      <StatusBadge status={exp.payment_status} />
                      <span>{exp.payment_method?.replace(/_/g, ' ')}</span>
                      {exp.payment_date && <span>· {formatDate(exp.payment_date)}</span>}
                      {exp.paid_by_name && <span>· {exp.paid_by_name}</span>}
                      {exp.side && <span className="capitalize">· {exp.side}</span>}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                    {formatCurrency(exp.amount)}
                  </p>
                  <Trash2
                    className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget({ type: 'expense', id: exp.id, name: exp.description })
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?.type === 'category') {
            deleteCategory.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
          } else {
            deleteExpense.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
          }
        }}
        title={`Delete ${deleteTarget?.type || ''}`}
        description={`Remove "${deleteTarget?.name}"?`}
        loading={deleteCategory.isPending || deleteExpense.isPending}
      />
    </div>
  )
}
