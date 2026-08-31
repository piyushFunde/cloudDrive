import React from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useFiles } from '../hooks/useFiles'
import { useFolders } from '../hooks/useFolders'

export default function RenameModal() {
  const { renameTarget, setRenameTarget } = useUIStore()
  const { renameFile } = useFiles()
  const { renameFolder } = useFolders()
  const [name, setName] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (renameTarget) {
      setName(renameTarget.name)
    }
  }, [renameTarget])

  if (!renameTarget) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      if (renameTarget.type === 'FILE') {
        await renameFile({ id: renameTarget.id, name: name.trim() })
      } else {
        await renameFolder({ id: renameTarget.id, name: name.trim() })
      }
      setRenameTarget(null)
    } catch {
      // Handled by hook toasts
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay select-none" onClick={() => setRenameTarget(null)}>
      <div className="modal-panel animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Rename</h2>
          <button
            onClick={() => setRenameTarget(null)}
            className="p-1 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Enter a new name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              autoFocus
              placeholder="Name"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setRenameTarget(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn-primary"
            >
              {isSubmitting ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
