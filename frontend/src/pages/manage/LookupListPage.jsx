import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import {
  useLookup,
  useCreateLookup,
  useUpdateLookup,
  useDeleteLookup,
} from '../../hooks/useLookups'

const TITLES = {
  'event-types': 'Event Types',
  'vendor-categories': 'Vendor Categories',
  'dietary-preferences': 'Dietary Preferences',
  'gift-types': 'Gift Types',
  'relation-types': 'Relation Types',
}

export default function LookupListPage() {
  const { type } = useParams()
  const title = TITLES[type] || type

  const { data, isLoading } = useLookup(type)
  const createMutation = useCreateLookup(type)
  const updateMutation = useUpdateLookup(type)
  const deleteMutation = useDeleteLookup(type)

  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const items = Array.isArray(data) ? data : data?.items || []

  const handleAdd = () => {
    if (!addForm.name.trim()) return
    createMutation.mutate(
      { name: addForm.name.trim(), description: addForm.description.trim() || null },
      {
        onSuccess: () => {
          setAddForm({ name: '', description: '' })
          setShowAdd(false)
        },
      }
    )
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({ name: item.name, description: item.description || '' })
  }

  const handleUpdate = () => {
    if (!editForm.name.trim()) return
    updateMutation.mutate(
      {
        id: editingId,
        data: { name: editForm.name.trim(), description: editForm.description.trim() || null },
      },
      { onSuccess: () => setEditingId(null) }
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <PageHeader
        title={title}
        backTo="/manage"
        action={
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-600 text-white text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        }
      />

      {/* Add form */}
      {showAdd && (
        <div className="px-4 md:px-6 lg:px-8 pt-3">
          <div className="p-4 bg-primary-50 rounded-2xl space-y-3">
            <input
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="Name *"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <input
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAdd(false)
                  setAddForm({ name: '', description: '' })
                }}
                className="flex-1 py-2 rounded-xl bg-white text-sm font-medium text-slate-600 border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!addForm.name.trim() || createMutation.isPending}
                className="flex-1 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
            {createMutation.isError && (
              <p className="text-xs text-red-600">
                {createMutation.error?.response?.data?.detail || 'Failed to add'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingScreen />
      ) : items.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} yet`} description="Tap Add to create one" />
      ) : (
        <div className="px-4 md:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden"
            >
              {editingId === item.id ? (
                /* Inline edit form */
                <div className="p-3 space-y-2 bg-blue-50">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                  />
                  <input
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center justify-center gap-1 flex-1 py-1.5 rounded-lg bg-white text-xs font-medium text-slate-600 border border-slate-200"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={!editForm.name.trim() || updateMutation.isPending}
                      className="flex items-center justify-center gap-1 flex-1 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {updateMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {updateMutation.isError && (
                    <p className="text-xs text-red-600">
                      {updateMutation.error?.response?.data?.detail || 'Failed to update'}
                    </p>
                  )}
                </div>
              ) : (
                /* Display row */
                <div className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 truncate">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 rounded-lg active:bg-slate-100"
                    >
                      <Pencil className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 rounded-lg active:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will remove it from all dropdowns. Items already using it won't be affected."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
