import React from 'react'

interface StorageBarProps {
  usage: number
  limit: number
}

export default function StorageBar({ usage, limit }: StorageBarProps) {
  const percentage = Math.min((usage / limit) * 100, 100)

  return (
    <div className="storage-bar">
      <div
        className="storage-bar-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
