import React from 'react'
import { Grid, List } from 'lucide-react'
import { useFiles } from '../hooks/useFiles'
import { useUIStore } from '../store/uiStore'
import FileGrid from '../components/FileGrid'
import FileList from '../components/FileList'
import EmptyState from '../components/EmptyState'
import ShareModal from '../components/ShareModal'

export default function StarredPage() {
  const { starredFiles, isLoadingStarred, deleteFile, toggleStar } = useFiles()
  const { viewMode, setViewMode } = useUIStore()

  const hasItems = starredFiles.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Starred files</h1>
          <p className="text-xs text-text-secondary mt-1">
            Keep track of your most important files in one quick folder view
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

      {isLoadingStarred ? (
        <div className="flex justify-center py-20">
          <div className="spinner" />
        </div>
      ) : hasItems ? (
        viewMode === 'grid' ? (
          <FileGrid
            folders={[]}
            files={starredFiles}
            onFolderClick={() => {}}
            onFileClick={() => {}}
            onDeleteFile={deleteFile}
            onDeleteFolder={() => {}}
            onToggleStar={toggleStar}
          />
        ) : (
          <FileList
            folders={[]}
            files={starredFiles}
            onFolderClick={() => {}}
            onFileClick={() => {}}
            onDeleteFile={deleteFile}
            onDeleteFolder={() => {}}
            onToggleStar={toggleStar}
          />
        )
      ) : (
        <EmptyState
          title="No starred files"
          description="Add stars to files from their options menu to easily reference them here."
        />
      )}

      <ShareModal />
    </div>
  )
}
