import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Grid, List } from 'lucide-react'
import { useSearch } from '../hooks/useSearch'
import { useUIStore } from '../store/uiStore'
import { useFiles } from '../hooks/useFiles'
import { useFolders } from '../hooks/useFolders'
import FileGrid from '../components/FileGrid'
import FileList from '../components/FileList'
import EmptyState from '../components/EmptyState'
import ShareModal from '../components/ShareModal'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryParam = searchParams.get('q') || ''

  const { query, setQuery, results, isSearching } = useSearch(queryParam)
  const { deleteFile, toggleStar } = useFiles()
  const { deleteFolder } = useFolders()
  const { viewMode, setViewMode } = useUIStore()

  // Sync state query with URL parameters on entry
  React.useEffect(() => {
    if (query !== queryParam) {
      setSearchParams({ q: query })
    }
  }, [query, setSearchParams])

  const hasItems = results.folders.length > 0 || results.files.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Search Center</h1>
          <p className="text-xs text-text-secondary mt-1">
            Instantly search files and folders across your drive
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

      {/* Inline Search Panel Input */}
      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-10"
          placeholder="Type at least 2 characters to search..."
        />
      </div>

      {isSearching ? (
        <div className="flex justify-center py-20">
          <div className="spinner" />
        </div>
      ) : hasItems ? (
        viewMode === 'grid' ? (
          <FileGrid
            folders={results.folders}
            files={results.files}
            onFolderClick={() => {}}
            onFileClick={() => {}}
            onDeleteFile={deleteFile}
            onDeleteFolder={deleteFolder}
            onToggleStar={toggleStar}
          />
        ) : (
          <FileList
            folders={results.folders}
            files={results.files}
            onFolderClick={() => {}}
            onFileClick={() => {}}
            onDeleteFile={deleteFile}
            onDeleteFolder={deleteFolder}
            onToggleStar={toggleStar}
          />
        )
      ) : (
        <EmptyState
          title="No search results"
          description={
            query.trim().length < 2
              ? 'Enter search queries to locate files and folders instantly.'
              : `We couldn't find anything matching "${query}"`
          }
        />
      )}

      <ShareModal />
    </div>
  )
}
