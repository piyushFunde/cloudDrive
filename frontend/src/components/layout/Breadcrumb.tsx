import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Folder } from 'lucide-react'

interface BreadcrumbProps {
  items: { id: string; name: string }[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 py-2 text-sm text-text-secondary select-none">
      {/* Root My Drive link */}
      <Link
        to="/drive"
        className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer font-medium"
      >
        <Folder className="h-4 w-4 text-primary" />
        <span>My Drive</span>
      </Link>

      {/* Subfolder hierarchy trail */}
      {items.map((item) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
          <Link
            to={`/drive/folder/${item.id}`}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {item.name}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  )
}
