import React from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet } from 'lucide-react'
import { useUpload } from '../hooks/useUpload'
import { useParams } from 'react-router-dom'

export default function UploadDropzone() {
  const { folderId } = useParams<{ folderId?: string }>()
  const { uploadFile } = useUpload()

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadFile({ file, folderId })
      })
    },
    [uploadFile, folderId]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })

  return (
    <div
      {...getRootProps()}
      className={`relative w-full border-2 border-dashed rounded-xl2 transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer ${
        isDragActive
          ? 'border-primary bg-primary/5 shadow-glow-sm'
          : 'border-border hover:border-white/20 bg-surface/30'
      }`}
    >
      <input {...getInputProps()} />
      <div className="p-4 bg-white/5 rounded-full border border-white/5 mb-3">
        <UploadCloud className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-text-secondary animate-pulse-soft'}`} />
      </div>
      <p className="text-xs font-semibold text-white mb-1">
        {isDragActive ? 'Drop files here...' : 'Click or drag & drop files to upload'}
      </p>
      <p className="text-[10px] text-text-muted">
        Direct upload limit of 500MB per file
      </p>
    </div>
  )
}
export { UploadCloud }
