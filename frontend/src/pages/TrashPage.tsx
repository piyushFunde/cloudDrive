import React from 'react'
import { Grid, List, Trash } from 'lucide-react'
import { trashService, TrashContents } from '../services/trashService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUIStore } from '../store/uiStore'
import FileGrid from '../components/FileGrid'
import FileList from '../components/FileList'
import EmptyState from '../components/EmptyState'
import { toast } from 'react-hot-toast'

export default function TrashPage() {
  const queryClient = useQueryClient()
  const { viewMode, setViewMode } = useUIStore()

  // Fetch trash contents
  const trashQuery = useQuery<TrashContents>({
    queryKey: ['trash-contents'],
    queryFn: () => trashService.listTrash(),
  })

  // Restore mutations
  const restoreFileMutation = useMutation({
    mutationFn: (id: string) => trashService.restoreFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-contents'] })
      toast.success('File restored successfully')
    },
  })

  const restoreFolderMutation = useMutation({
    mutationFn: (id: string) => trashService.restoreFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-contents'] })
      toast.success('Folder restored successfully')
    },
  })

  // Permanent delete mutations
  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => trashService.permanentDeleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-contents'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('File permanently deleted')
    },
  })

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => trashService.permanentDeleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-contents'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Folder permanently deleted')
    },
  })

  const emptyTrashMutation = useMutation({
    mutationFn: () => trashService.emptyTrash(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-contents'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Trash emptied completely')
    },
    onError: () => {
      toast.error('Failed to empty trash')
    },
  })

  const hasItems = trashQuery.data && (trashQuery.data.files.length > 0 || trashQuery.data.folders.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Trash</h1>
          <p className="text-xs text-text-secondary mt-1">
            Restore items within 30 days before they are automatically deleted
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {hasItems && (
            <button
              onClick={() => emptyTrashMutation.mutate()}
              disabled={emptyTrashMutation.isPending}
              className="btn-danger py-2 px-3 flex items-center gap-1.5"
            >
              <Trash className="h-4 w-4" />
              <span className="text-xs font-semibold">Empty Trash</span>
            </button>
          )}

          <div className="flex bg-surface border border-border p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white'
              }`}
            >
              <Grid className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white'
              }`}
            >
              <List className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {trashQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <div className="spinner" />
        </div>
      ) : hasItems && trashQuery.data ? (
        viewMode === 'grid' ? (
          <FileGrid
            folders={trashQuery.data.folders}
            files={trashQuery.data.files}
            isTrashPage={true}
            onFolderClick={() => {}}
            onFileClick={() => {}}
            onDeleteFile={() => {}}
            onDeleteFolder={() => {}}
            onRestoreFile={restoreFileMutation.mutate}
            onRestoreFolder={restoreFolderMutation.mutate}
            onPermanentDeleteFile={deleteFileMutation.mutate}
            onPermanentDeleteFolder={deleteFolderMutation.mutate}
          />
        ) : (
          <FileList
            folders={trashQuery.data.folders}
            files={trashQuery.data.files}
            isTrashPage={true}
            onFolderClick={() => {}}
            onFileClick={() => {}}
            onDeleteFile={() => {}}
            onDeleteFolder={() => {}}
            onRestoreFile={restoreFileMutation.mutate}
            onRestoreFolder={restoreFolderMutation.mutate}
            onPermanentDeleteFile={deleteFileMutation.mutate}
            onPermanentDeleteFolder={deleteFolderMutation.mutate}
          />
        )
      ) : (
        <EmptyState
          title="Trash is empty"
          description="Deleted files and folders will show up here. You can restore them anytime."
        />
      )}
    </div>
  )
}
