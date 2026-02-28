import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import FileDropzone from '../../components/FileDropzone'
import AttachmentList from '../../components/AttachmentList'
import useAuthStore from '../../stores/authStore'
import { useTask, useCreateTask, useUpdateTask, usePatchTask } from '../../hooks/useTasks'
import { useAttachments, useUploadAttachments, useDeleteAttachment } from '../../hooks/useMediaAttachments'
import { useEvents } from '../../hooks/useEvents'
import { useUsers } from '../../hooks/useUsers'
import { TASK_PRIORITIES, TASK_STATUSES } from '../../lib/constants'

const adminSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  event_id: z.coerce.number().optional().nullable(),
  assigned_to_user_id: z.coerce.number().optional().nullable(),
  priority: z.string().default('medium'),
  status: z.string().default('pending'),
  due_date: z.string().optional(),
})

const userSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  event_id: z.coerce.number().optional().nullable(),
  assigned_to_user_id: z.coerce.number().optional().nullable(),
  priority: z.string().default('medium'),
  status: z.string().default('pending'),
  due_date: z.string().optional(),
})

export default function TaskFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { user: currentUser } = useAuthStore()
  const isAdmin = ['admin', 'manager'].includes(currentUser?.role)

  const { data: task, isLoading } = useTask(id)
  const { data: eventsData } = useEvents()
  const { data: usersData } = useUsers()
  const events = eventsData?.items || eventsData || []
  const allUsers = usersData?.items || usersData || []

  // Admin/manager see all users; regular users can only reassign to admins/managers
  const assignableUsers = isAdmin
    ? allUsers
    : allUsers.filter((u) => ['admin', 'manager'].includes(u.role))

  const create = useCreateTask()
  const update = useUpdateTask()
  const patch = usePatchTask()
  const { data: attachments } = useAttachments('task', id)
  const uploadAttachments = useUploadAttachments('task', id)
  const deleteAttachment = useDeleteAttachment('task', id)

  const schema = isAdmin ? adminSchema : userSchema

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', status: 'pending' },
  })

  useEffect(() => {
    if (task) {
      reset({
        ...task,
        event_id: task.event_id || '',
        assigned_to_user_id: task.assigned_to_user_id || '',
      })
    }
  }, [task, reset])

  const onSubmit = (data) => {
    if (isAdmin) {
      const payload = {
        ...data,
        event_id: data.event_id || null,
        assigned_to_user_id: data.assigned_to_user_id || null,
        description: data.description || null,
        due_date: data.due_date || null,
      }
      if (isEdit) {
        update.mutate({ id, data: payload }, { onSuccess: () => navigate('/tasks') })
      } else {
        create.mutate(payload, { onSuccess: (res) => navigate(`/tasks/${res.id}/edit`) })
      }
    } else {
      if (isEdit) {
        // Users can only update status and reassign (PATCH)
        const patchPayload = {
          status: data.status,
          assigned_to_user_id: data.assigned_to_user_id || null,
        }
        patch.mutate({ id, data: patchPayload }, { onSuccess: () => navigate('/tasks') })
      } else {
        const payload = {
          title: data.title,
          description: data.description || null,
          event_id: data.event_id || null,
          assigned_to_user_id: data.assigned_to_user_id || null,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date || null,
        }
        create.mutate(payload, { onSuccess: (res) => navigate(`/tasks/${res.id}/edit`) })
      }
    }
  }

  if (isEdit && (isLoading || !eventsData || !usersData)) return <LoadingScreen />

  const saving = create.isPending || update.isPending || patch.isPending
  const error = create.error || update.error || patch.error

  // Check if current user owns this task (for edit restrictions)
  const isOwnTask = !isEdit || task?.assigned_to_user_id === currentUser?.id
  const canEditFields = isAdmin || !isEdit // Admin can edit all, non-admin can only edit when creating

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Task' : 'New Task'}
        backTo="/tasks"
        action={
          <button form="task-form" type="submit" disabled={saving} className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input
            {...register('title')}
            disabled={!canEditFields}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
            placeholder="e.g. Book photographer"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            {...register('description')}
            disabled={!canEditFields}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select
              {...register('priority')}
              disabled={!canEditFields}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select {...register('status')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
          <select
            {...register('assigned_to_user_id')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{isAdmin ? 'Unassigned' : 'Select user'}</option>
            {assignableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email}
                {u.role === 'admin' ? ' (Admin)' : u.role === 'manager' ? ' (Manager)' : ''}
              </option>
            ))}
          </select>
          {!isAdmin && isEdit && (
            <p className="text-[10px] text-slate-400 mt-1">You can reassign this task to an admin or manager</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
          <input
            {...register('due_date')}
            type="date"
            disabled={!canEditFields}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Related Event</label>
          <select
            {...register('event_id')}
            disabled={!canEditFields}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
          >
            <option value="">None</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {isEdit && task && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400">
              Created by: User #{task.created_by_user_id}
              {task.completed_at && ` · Completed: ${new Date(task.completed_at).toLocaleDateString()}`}
            </p>
          </div>
        )}
      </form>

      {isEdit && (
        <div className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
          <h3 className="text-sm font-medium text-slate-700">Attachments</h3>
          <FileDropzone
            onUpload={(files) => uploadAttachments.mutateAsync(files)}
            uploading={uploadAttachments.isPending}
          />
          <AttachmentList
            attachments={attachments}
            onDelete={(attId) => deleteAttachment.mutate(attId)}
            deleting={deleteAttachment.isPending}
          />
        </div>
      )}
    </div>
  )
}
