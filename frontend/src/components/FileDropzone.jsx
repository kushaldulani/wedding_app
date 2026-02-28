import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, File } from 'lucide-react'
import { cn } from '../lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return Image
  if (mimeType === 'application/pdf') return FileText
  return File
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileDropzone({ onUpload, uploading, disabled }) {
  const [stagedFiles, setStagedFiles] = useState([])
  const [error, setError] = useState(null)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null)
    if (rejectedFiles.length > 0) {
      const reasons = rejectedFiles
        .map((r) => `${r.file.name}: ${r.errors.map((e) => e.message).join(', ')}`)
        .join('; ')
      setError(reasons)
    }
    if (acceptedFiles.length > 0) {
      setStagedFiles((prev) => [...prev, ...acceptedFiles])
    }
  }, [])

  const removeStaged = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (stagedFiles.length === 0) return
    try {
      await onUpload(stagedFiles)
      setStagedFiles([])
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Upload failed')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    disabled: disabled || uploading,
    multiple: true,
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300',
          (disabled || uploading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-sm text-primary-600 font-medium">Drop files here</p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Drag & drop files here, or <span className="text-primary-600 font-medium">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Max 10MB per file</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      {stagedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">
            {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} ready to upload
          </p>
          {stagedFiles.map((file, idx) => {
            const Icon = getFileIcon(file.type)
            return (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-lg"
              >
                <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-700 truncate flex-1">{file.name}</span>
                <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeStaged(idx)}
                  className="p-0.5 rounded hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )
          })}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : `Upload ${stagedFiles.length} file${stagedFiles.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}
