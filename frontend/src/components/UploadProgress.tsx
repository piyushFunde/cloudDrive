import React from 'react'
import { CheckCircle2, XCircle, AlertCircle, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useUploadStore, UploadItem } from '../store/uploadStore'

export default function UploadProgress() {
  const { uploads, isVisible, setVisible, clearCompleted } = useUploadStore()
  const [isMinimized, setIsMinimized] = React.useState(false)

  if (!isVisible || uploads.length === 0) return null

  const completedCount = uploads.filter((u: UploadItem) => u.status === 'completed').length
  const activeUploads = uploads.filter((u: UploadItem) => u.status === 'uploading' || u.status === 'pending')

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-surface border border-border rounded-xl shadow-card overflow-hidden transition-all duration-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-elevated border-b border-border select-none">
        <span className="text-xs font-semibold text-white">
          {activeUploads.length > 0
            ? `Uploading ${activeUploads.length} item${activeUploads.length > 1 ? 's' : ''}`
            : `Completed ${completedCount} upload${completedCount !== 1 ? 's' : ''}`}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {activeUploads.length === 0 && (
            <button
              onClick={() => {
                clearCompleted()
                setVisible(false)
              }}
              className="p-1 rounded text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Items Queue */}
      {!isMinimized && (
        <div className="max-h-60 overflow-y-auto divide-y divide-border no-scrollbar bg-background/50">
          {uploads.map((item: UploadItem) => (
            <div key={item.id} className="p-3 space-y-2">
              <div className="flex items-center justify-between text-xs overflow-hidden">
                <span className="text-white font-medium truncate pr-3">{item.fileName}</span>
                <span className="shrink-0 text-text-secondary">
                  {item.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {item.status === 'error' && (
                    <span title={item.error}>
                      <XCircle className="h-4 w-4 text-error" />
                    </span>
                  )}
                  {item.status === 'uploading' && `${item.progress}%`}
                  {item.status === 'pending' && 'Queued'}
                </span>
              </div>

              {/* Progress Slider */}
              {item.status === 'uploading' && (
                <div className="upload-progress-bar">
                  <div className="upload-progress-fill" style={{ width: `${item.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

