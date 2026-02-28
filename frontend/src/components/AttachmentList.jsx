import { useState, useEffect } from 'react'
import { Trash2, Download, FileText, Image as ImageIcon, File } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import { getFileUrl } from '../api/media'
import useAuthStore from '../stores/authStore'

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return ImageIcon
  if (mimeType === 'application/pdf') return FileText
  return File
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType) {
  return mimeType?.startsWith('image/')
}

function AuthImage({ attachmentId, alt, className }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    const token = useAuthStore.getState().token
    const url = getFileUrl(attachmentId)
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => setSrc(URL.createObjectURL(blob)))
      .catch(() => {})

    return () => {
      if (src) URL.revokeObjectURL(src)
    }
  }, [attachmentId])

  if (!src) return <div className={`${className} bg-slate-100 animate-pulse`} />
  return <img src={src} alt={alt} className={className} />
}

async function downloadWithAuth(attachmentId, filename) {
  const token = useAuthStore.getState().token
  const url = getFileUrl(attachmentId)
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}

export default function AttachmentList({ attachments, onDelete, deleting }) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const user = useAuthStore((s) => s.user)
  const canDelete = ['admin', 'manager'].includes(user?.role)

  if (!attachments || attachments.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">
        Attachments ({attachments.length})
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {attachments.map((att) => {
          const Icon = getFileIcon(att.mime_type)

          return (
            <div
              key={att.id}
              className="relative group border border-slate-100 rounded-xl overflow-hidden bg-white"
            >
              {isImage(att.mime_type) ? (
                <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                  <AuthImage
                    attachmentId={att.id}
                    alt={att.original_filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-slate-50 flex flex-col items-center justify-center gap-1">
                  <Icon className="w-8 h-8 text-slate-300" />
                  <span className="text-[10px] text-slate-400 uppercase font-medium">
                    {att.original_filename.split('.').pop()}
                  </span>
                </div>
              )}

              <div className="p-2">
                <p className="text-xs text-slate-700 truncate">{att.original_filename}</p>
                <p className="text-[10px] text-slate-400">{formatFileSize(att.file_size)}</p>
              </div>

              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => downloadWithAuth(att.id, att.original_filename)}
                  className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(att)}
                    className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          onDelete(deleteTarget.id)
          setDeleteTarget(null)
        }}
        title="Delete Attachment"
        description={`Remove "${deleteTarget?.original_filename}"?`}
        loading={deleting}
      />
    </div>
  )
}
