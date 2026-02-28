import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Circle, CheckCircle2, Clock, AlertTriangle, User, Download } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FloatingButton from '../../components/FloatingButton'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import useAuthStore from '../../stores/authStore'
import { useTasks, useMyTasks, useUpdateTask, usePatchTask } from '../../hooks/useTasks'
import { exportTasks } from '../../api/tasks'
import { useUsers } from '../../hooks/useUsers'
import { formatDate, cn, downloadBlob } from '../../lib/utils'
import { TASK_STATUSES, PRIORITY_COLORS } from '../../lib/constants'

export default function TasksPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const role = user?.role || 'guest'
  const isAdmin = role === 'admin'
  const isAdminOrManager = ['admin', 'manager'].includes(role)
  const isGuest = role === 'guest'

  const [view, setView] = useState(isAdminOrManager ? 'all' : 'my')
  const [statusFilter, setStatusFilter] = useState('')
  const [exporting, setExporting] = useState(false)

  const params = statusFilter ? { status: statusFilter } : undefined
  const { data: allData, isLoading: loadingAll } = useTasks(view === 'all' ? params : undefined)
  const { data: myData, isLoading: loadingMy } = useMyTasks()
  const { data: usersData } = useUsers()
  const updateTask = useUpdateTask()
  const patchTask = usePatchTask()

  const users = usersData?.items || usersData || []
  const usersMap = {}
  users.forEach((u) => { usersMap[u.id] = u })

  const allTasks = allData?.items || allData || []
  const myTasks = myData || []

  const tasks = view === 'my' ? myTasks : allTasks
  const isLoading = view === 'my' ? loadingMy : loadingAll

  const filteredTasks = statusFilter && view === 'my'
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks

  const toggleComplete = (task, e) => {
    e.stopPropagation()
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    if (isAdminOrManager) {
      updateTask.mutate({ id: task.id, data: { status: newStatus } })
    } else {
      patchTask.mutate({ id: task.id, data: { status: newStatus } })
    }
  }

  const isOverdue = (task) =>
    task.due_date &&
    task.status !== 'completed' &&
    task.status !== 'cancelled' &&
    new Date(task.due_date) < new Date()

  const getUserName = (userId) => {
    if (!userId) return null
    const u = usersMap[userId]
    if (!u) return `User #${userId}`
    return u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        action={
          isAdminOrManager && (
            <button
              onClick={async () => {
                setExporting(true)
                try {
                  const blob = await exportTasks(statusFilter ? { status: statusFilter } : undefined)
                  downloadBlob(blob, 'tasks.xlsx')
                } finally {
                  setExporting(false)
                }
              }}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium active:bg-slate-200 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          )
        }
      />

      {/* View toggle */}
      {!isGuest && (
        <div className="px-4 md:px-6 lg:px-8 py-2 flex gap-2">
          {isAdminOrManager && (
            <button
              onClick={() => setView('all')}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium', view === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600')}
            >
              All Tasks
            </button>
          )}
          <button
            onClick={() => setView('my')}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium', view === 'my' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600')}
          >
            My Tasks
          </button>
        </div>
      )}

      {/* Status filter */}
      <div className="px-4 md:px-6 lg:px-8 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setStatusFilter('')}
          className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap', !statusFilter ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600')}
        >
          All
        </button>
        {TASK_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize', statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600')}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : filteredTasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks yet" description="Add tasks to track your wedding planning" />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 pb-6 grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => !isGuest && navigate(`/tasks/${task.id}/edit`)}
              className={cn('flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100', !isGuest && 'active:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-shadow cursor-pointer')}
            >
              <button
                onClick={(e) => toggleComplete(task, e)}
                className="mt-0.5 flex-shrink-0"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900')}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize', PRIORITY_COLORS[task.priority] || 'bg-slate-100 text-slate-600')}>
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span className={cn('flex items-center gap-0.5 text-[10px]', isOverdue(task) ? 'text-red-600 font-medium' : 'text-slate-400')}>
                      {isOverdue(task) ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {formatDate(task.due_date)}
                    </span>
                  )}
                  {task.assigned_to_user_id && (
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      <User className="w-3 h-3" />
                      {getUserName(task.assigned_to_user_id)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isGuest && <FloatingButton onClick={() => navigate('/tasks/new')} label="New Task" />}
    </div>
  )
}
