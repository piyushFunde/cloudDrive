import React from 'react'
import FileCard from './FileCard'

interface FileGridProps {
  folders: any[]
  files: any[]
  isSharedPage?: boolean
  isTrashPage?: boolean
  onFolderClick: (id: string) => void
  onFileClick: (id: string) => void
  onDeleteFile: (id: string) => void
  onDeleteFolder: (id: string) => void
  onRestoreFile?: (id: string) => void
  onRestoreFolder?: (id: string) => void
  onPermanentDeleteFile?: (id: string) => void
  onPermanentDeleteFolder?: (id: string) => void
  onToggleStar?: (id: string) => void
}

export default function FileGrid({
  folders,
  files,
  isSharedPage = false,
  isTrashPage = false,
  onFolderClick,
  onFileClick,
  onDeleteFile,
  onDeleteFolder,
  onRestoreFile,
  onRestoreFolder,
  onPermanentDeleteFile,
  onPermanentDeleteFolder,
  onToggleStar,
}: FileGridProps) {
  return (
    <div className="space-y-8 select-none">
      {/* Folders block */}
      {folders.length > 0 && (
        <div className="space-y-3.5">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Folders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map((folder) => (
              <FileCard
                key={folder.id}
                item={folder}
                type="FOLDER"
                isSharedPage={isSharedPage}
                isTrashPage={isTrashPage}
                onClick={() => onFolderClick(folder.id)}
                onDoubleClick={() => onFolderClick(folder.id)}
                onDelete={() => onDeleteFolder(folder.id)}
                onRestore={() => onRestoreFolder?.(folder.id)}
                onPermanentDelete={() => onPermanentDeleteFolder?.(folder.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files block */}
      {files.length > 0 && (
        <div className="space-y-3.5">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Files
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                item={file}
                type="FILE"
                isSharedPage={isSharedPage}
                isTrashPage={isTrashPage}
                onClick={() => onFileClick(file.id)}
                onDelete={() => onDeleteFile(file.id)}
                onRestore={() => onRestoreFile?.(file.id)}
                onPermanentDelete={() => onPermanentDeleteFile?.(file.id)}
                onToggleStar={() => onToggleStar?.(file.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
