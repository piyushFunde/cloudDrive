import React from 'react'
import { Grid, List } from 'lucide-react'
import { useShare } from '../hooks/useShare'
import { useUIStore } from '../store/uiStore'
import FileGrid from '../components/FileGrid'
import FileList from '../components/FileList'
import EmptyState from '../components/EmptyState'
import ShareModal from '../components/ShareModal'

export default function SharedPage() {
  const { sharedWithMe, isLoadingShared } = useShare()
  const { viewMode, setViewMode } = useUIStore()

  // Map shared elements into separate lists of files and folders
  const folders = sharedWithMe
    .filter((s) => s.resource.type === 'FOLDER')
    .map((s) => ({
      id: s.resource.id,
      name: s.resource.name,
      createdAt: s.createdAt,
    }))

  const files = sharedWithMe
    .filter((s) => s.resource.type === 'FILE')
    .map((s) => ({
      id: s.resource.id,
      name: s.resource.name,
      createdAt: s.createdAt,
    }))

  const hasItems = folders.length > 0 || files.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Shared with me</h1>
          <p className="text-xs text-text-secondary mt-1">
            Files and folders shared with you by other users
          </p>
        </div>

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

      {isLoadingShared ? (
        <div className="flex justify-center py-20">
          <div className="spinner" />
        </div>
      ) : hasItems ? (
        viewMode === 'grid' ? (
          <FileGrid
            folders={folders}
            files={files}
            isSharedPage={true}
            onFolderClick={() => {}}
            onFileClick={() => {}}
            onDeleteFile={() => {}}
            onDeleteFolder={() => {}}
          />
        ) : (
          <FileList
            folders={folders}
            files={files}
            isSharedPage={true}
            onFolderClick={() => {}}
            onFileClick={() => {}}
            onDeleteFile={() => {}}
            onDeleteFolder={() => {}}
          />
        )
      ) : (
        <EmptyState
          title="No shared items"
          description="When others share files or folders with you, they will show up here."
        />
      )}

      <ShareModal />
    </div>
  )
}
