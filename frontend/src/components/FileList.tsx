import React from 'react'
import { Folder, File, Star, MoreVertical, Trash2, ShieldAlert } from 'lucide-react'
import { formatBytes } from './layout/Sidebar'
import { useUIStore } from '../store/uiStore'
import FileContextMenu from './FileContextMenu'

interface FileListProps {
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

export default function FileList({
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
}: FileListProps) {
  const { openShareModal, setRenameTarget } = useUIStore()
  const [contextMenu, setContextMenu] = React.useState<{ id: string; type: 'FILE' | 'FOLDER'; x: number; y: number; item: any } | null>(null)

  const handleRowContextMenu = (e: React.MouseEvent, item: any, type: 'FILE' | 'FOLDER') => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ id: item.id, type, x: e.clientX, y: e.clientY, item })
  }

  const handleMoreClick = (e: React.MouseEvent, item: any, type: 'FILE' | 'FOLDER') => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setContextMenu({ id: item.id, type, x: rect.left, y: rect.bottom + 5, item })
  }

  const itemsList = [
    ...folders.map((f) => ({ ...f, $type: 'FOLDER' })),
    ...files.map((f) => ({ ...f, $type: 'FILE' })),
  ]

  if (itemsList.length === 0) return null

  return (
    <div className="w-full bg-surface border border-border rounded-xl overflow-hidden select-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-surface-elevated text-text-secondary font-semibold border-b border-border uppercase">
          <tr>
            <th className="p-4 w-2/5">Name</th>
            <th className="p-4">Type</th>
            <th className="p-4">Size</th>
            <th className="p-4">Created At</th>
            <th className="p-4 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {itemsList.map((item) => {
            const isFolder = item.$type === 'FOLDER'
            return (
              <tr
                key={item.id}
                onContextMenu={(e) => handleRowContextMenu(e, item, isFolder ? 'FOLDER' : 'FILE')}
                onClick={() => (isFolder ? onFolderClick(item.id) : onFileClick(item.id))}
                className="hover:bg-white/5 cursor-pointer transition-colors group"
              >
                {/* Name */}
                <td className="p-4 font-medium flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg shrink-0 border border-white/5">
                    {isFolder ? (
                      <Folder className="h-4 w-4 text-primary" />
                    ) : (
                      <File className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <span className="text-white truncate font-medium max-w-sm block" title={item.name}>
                    {item.name}
                  </span>
                  {item.isStarred && (
                    <Star className="h-3.5 w-3.5 text-warning fill-warning shrink-0" />
                  )}
                </td>

                {/* Type */}
                <td className="p-4 text-text-secondary">
                  {isFolder ? 'Folder' : item.mimeType ? item.mimeType.split('/')[1]?.toUpperCase() : 'File'}
                </td>

                {/* Size */}
                <td className="p-4 text-text-secondary">
                  {isFolder ? '—' : formatBytes(item.size || 0)}
                </td>

                {/* Created At */}
                <td className="p-4 text-text-secondary">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>

                {/* Action dropdown */}
                <td className="p-4 relative">
                  <button
                    onClick={(e) => handleMoreClick(e, item, isFolder ? 'FOLDER' : 'FILE')}
                    className="p-1 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Row context menu mapping */}
      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          isStarred={contextMenu.item.isStarred}
          isSharedPage={isSharedPage}
          isTrashPage={isTrashPage}
          onClose={() => setContextMenu(null)}
          onDownload={() => contextMenu.item.downloadUrl && window.open(contextMenu.item.downloadUrl, '_blank')}
          onShare={() => openShareModal(contextMenu.id, contextMenu.type)}
          onStar={() => onToggleStar?.(contextMenu.id)}
          onRename={() => setRenameTarget({ id: contextMenu.id, type: contextMenu.type, name: contextMenu.item.name })}
          onDelete={() => (contextMenu.type === 'FILE' ? onDeleteFile(contextMenu.id) : onDeleteFolder(contextMenu.id))}
          onRestore={() => (contextMenu.type === 'FILE' ? onRestoreFile?.(contextMenu.id) : onRestoreFolder?.(contextMenu.id))}
          onPermanentDelete={() => (contextMenu.type === 'FILE' ? onPermanentDeleteFile?.(contextMenu.id) : onPermanentDeleteFolder?.(contextMenu.id))}
        />
      )}
    </div>
  )
}
