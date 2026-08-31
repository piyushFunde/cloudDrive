import React from 'react'
import { X, FolderPlus } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useFolders } from '../hooks/useFolders'
import { useParams } from 'react-router-dom'

export default function CreateFolderModal() {
  const { createFolderOpen, setCreateFolderOpen } = useUIStore()
  const { folderId } = useParams<{ folderId?: string }>()
  const { createFolder, isCreatingFolder } = useFolders()
  const [folderName, setFolderName] = React.useState('')

  if (!createFolderOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    try {
      await createFolder({ name: folderName.trim(), parentId: folderId })
      setFolderName('')
      setCreateFolderOpen(false)
    } catch {
      // Handled by query notifications
    }
  }

  return (
    <div className="modal-overlay select-none" onClick={() => setCreateFolderOpen(false)}>
      <div className="modal-panel animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-white">New Folder</h2>
          </div>
          <button
            onClick={() => setCreateFolderOpen(false)}
            className="p-1 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Folder Name</label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="input"
              autoFocus
              placeholder="Untitled Folder"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCreateFolderOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingFolder || !folderName.trim()}
              className="btn-primary"
            >
              {isCreatingFolder ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
