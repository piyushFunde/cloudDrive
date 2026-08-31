import React from 'react'
import { Download, Share2, Star, Edit3, Trash2, FolderInput, Link } from 'lucide-react'

interface FileContextMenuProps {
  x: number
  y: number
  type: 'FILE' | 'FOLDER'
  isStarred?: boolean
  isSharedPage?: boolean
  isTrashPage?: boolean
  onClose: () => void
  onDownload?: () => void
  onShare?: () => void
  onStar?: () => void
  onRename?: () => void
  onMove?: () => void
  onDelete?: () => void
  onRestore?: () => void
  onPermanentDelete?: () => void
}

export default function FileContextMenu({
  x,
  y,
  type,
  isStarred,
  isSharedPage = false,
  isTrashPage = false,
  onClose,
  onDownload,
  onShare,
  onStar,
  onRename,
  onMove,
  onDelete,
  onRestore,
  onPermanentDelete,
}: FileContextMenuProps) {
  // Auto-dismiss context menu when clicked outside
  React.useEffect(() => {
    const handleDismiss = () => onClose()
    document.addEventListener('click', handleDismiss)
    return () => document.removeEventListener('click', handleDismiss)
  }, [onClose])

  const menuStyle: React.CSSProperties = {
    top: `${y}px`,
    left: `${x}px`,
    position: 'fixed',
  }

  // Adjust coordinates if menu would render off-screen
  const menuRef = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const screenW = window.innerWidth
      const screenH = window.innerHeight

      if (rect.right > screenW) {
        menuRef.current.style.left = `${x - rect.width}px`
      }
      if (rect.bottom > screenH) {
        menuRef.current.style.top = `${y - rect.height}px`
      }
    }
  }, [x, y])

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="context-menu animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      {isTrashPage ? (
        <>
          <button onClick={onRestore} className="context-menu-item w-full">
            <FolderInput className="h-4 w-4" />
            <span>Restore</span>
          </button>
          <div className="context-menu-separator" />
          <button onClick={onPermanentDelete} className="context-menu-item context-menu-item-danger w-full">
            <Trash2 className="h-4 w-4" />
            <span>Delete Permanently</span>
          </button>
        </>
      ) : (
        <>
          {type === 'FILE' && onDownload && (
            <button onClick={onDownload} className="context-menu-item w-full">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          )}

          {!isSharedPage && onShare && (
            <button onClick={onShare} className="context-menu-item w-full">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          )}

          {type === 'FILE' && onStar && (
            <button onClick={onStar} className="context-menu-item w-full">
              <Star className="h-4 w-4 text-warning" />
              <span>{isStarred ? 'Unstar' : 'Add to Starred'}</span>
            </button>
          )}

          {!isSharedPage && onRename && (
            <button onClick={onRename} className="context-menu-item w-full">
              <Edit3 className="h-4 w-4" />
              <span>Rename</span>
            </button>
          )}

          {!isSharedPage && onMove && (
            <button onClick={onMove} className="context-menu-item w-full">
              <FolderInput className="h-4 w-4" />
              <span>Move</span>
            </button>
          )}

          {!isSharedPage && onDelete && (
            <>
              <div className="context-menu-separator" />
              <button onClick={onDelete} className="context-menu-item context-menu-item-danger w-full">
                <Trash2 className="h-4 w-4" />
                <span>Move to Trash</span>
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
