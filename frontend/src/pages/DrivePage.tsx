import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Grid, List, Plus, FolderPlus, UploadCloud, ChevronDown } from 'lucide-react'
import { useFolders } from '../hooks/useFolders'
import { useFiles } from '../hooks/useFiles'
import { useUIStore } from '../store/uiStore'
import Breadcrumb from '../components/layout/Breadcrumb'
import FileGrid from '../components/FileGrid'
import FileList from '../components/FileList'
import EmptyState from '../components/EmptyState'
import CreateFolderModal from '../components/CreateFolderModal'
import RenameModal from '../components/RenameModal'
import ShareModal from '../components/ShareModal'
import UploadDropzone from '../components/UploadDropzone'

export default function DrivePage() {
  const { folderId } = useParams<{ folderId?: string }>()
  const navigate = useNavigate()

  const { contents, isLoadingContents, deleteFolder } = useFolders(folderId)
  const { deleteFile, toggleStar } = useFiles()
  const { viewMode, setViewMode, setCreateFolderOpen } = useUIStore()

  // Click handler to open upload file picker
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Simulate drop action manually to leverage useUpload logic
      const dropzoneInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (dropzoneInput) {
        const dataTransfer = new DataTransfer()
        Array.from(files).forEach((f) => dataTransfer.items.add(f))
        dropzoneInput.files = dataTransfer.files
        dropzoneInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  }

  const handleFolderClick = (id: string) => {
    navigate(`/drive/folder/${id}`)
  }

  const handleFileClick = (id: string) => {
    // Optional details panel click handler placeholder
  }

  const hasItems = contents && (contents.folders.length > 0 || contents.files.length > 0)

  return (
    <div className="space-y-6">
      {/* Header controls toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">My Drive</h1>
          {contents?.currentFolder && (
            <Breadcrumb items={contents.currentFolder.breadcrumb} />
          )}
        </div>

        {/* Action button bar */}
        <div className="flex items-center gap-2.5">
          {/* Layout switches */}
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

          <button onClick={() => setCreateFolderOpen(true)} className="btn-secondary py-2 px-3">
            <FolderPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Folder</span>
          </button>

          <button onClick={handleUploadClick} className="btn-primary py-2 px-3.5">
            <UploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Files</span>
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload drop zone container */}
      <UploadDropzone />

      {/* Main Files view */}
      {isLoadingContents ? (
        <div className="flex justify-center py-20">
          <div className="spinner" />
        </div>
      ) : hasItems && contents ? (
        viewMode === 'grid' ? (
          <FileGrid
            folders={contents.folders}
            files={contents.files}
            onFolderClick={handleFolderClick}
            onFileClick={handleFileClick}
            onDeleteFile={deleteFile}
            onDeleteFolder={deleteFolder}
            onToggleStar={toggleStar}
          />
        ) : (
          <FileList
            folders={contents.folders}
            files={contents.files}
            onFolderClick={handleFolderClick}
            onFileClick={handleFileClick}
            onDeleteFile={deleteFile}
            onDeleteFolder={deleteFolder}
            onToggleStar={toggleStar}
          />
        )
      ) : (
        <EmptyState
          title="This folder is empty"
          description="Drag and drop files here, or use the buttons above to create subfolders or upload files."
        />
      )}

      {/* Overlay modals */}
      <CreateFolderModal />
      <RenameModal />
      <ShareModal />
    </div>
  )
}
