import React from 'react'
import { Folder, File, Star, MoreVertical } from 'lucide-react'
import { formatBytes } from './layout/Sidebar'
import FileContextMenu from './FileContextMenu'
import { useUIStore } from '../store/uiStore'

interface FileCardProps {
  item: {
    id: string
    name: string
    mimeType?: string
    size?: number
    isStarred?: boolean
    downloadUrl?: string
    createdAt: string
  }
  type: 'FILE' | 'FOLDER'
  isSharedPage?: boolean
  isTrashPage?: boolean
  onClick: () => void
  onDoubleClick?: () => void
  onDelete: () => void
  onRestore?: () => void
  onPermanentDelete?: () => void
  onToggleStar?: () => void
}

export default function FileCard({
  item,
  type,
  isSharedPage = false,
  isTrashPage = false,
  onClick,
  onDoubleClick,
  onDelete,
  onRestore,
  onPermanentDelete,
  onToggleStar,
}: FileCardProps) {
  const { openShareModal, setRenameTarget } = useUIStore()
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number } | null>(null)

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setContextMenu({ x: rect.left, y: rect.bottom + 5 })
  }

  const handleDownload = () => {
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank')
    }
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={handleRightClick}
      className="file-card select-none"
    >
      <div className="flex items-start justify-between">
        {/* Icon representation */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 mb-3 group-hover:border-white/10 transition-colors">
          {type === 'FOLDER' ? (
            <Folder className="h-6 w-6 text-primary" />
          ) : (
            <File className="h-6 w-6 text-accent" />
          )}
        </div>

        {/* Right Star & Options trigger */}
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {item.isStarred && (
            <Star className="h-4 w-4 text-warning fill-warning shrink-0" />
          )}
          <button
            onClick={handleDropdownClick}
            className="p-1 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="overflow-hidden">
        <h3 className="text-sm font-semibold text-white truncate" title={item.name}>
          {item.name}
        </h3>
        <p className="text-[11px] text-text-muted mt-1 font-medium">
          {type === 'FOLDER' ? 'Folder' : formatBytes(item.size || 0)}
        </p>
      </div>

      {/* Context Menu overlay */}
      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={type}
          isStarred={item.isStarred}
          isSharedPage={isSharedPage}
          isTrashPage={isTrashPage}
          onClose={() => setContextMenu(null)}
          onDownload={handleDownload}
          onShare={() => openShareModal(item.id, type)}
          onStar={onToggleStar}
          onRename={() => setRenameTarget({ id: item.id, type, name: item.name })}
          onDelete={onDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
        />
      )}
    </div>
  )
}
