import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fileService } from '../services/fileService'
import { useUploadStore } from '../store/uploadStore'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'

export function useUpload() {
  const queryClient = useQueryClient()
  const { addUpload, updateProgress, setStatus } = useUploadStore()
  const { updateUser, user } = useAuthStore()

  const uploadMutation = useMutation({
    mutationFn: async ({ file, folderId }: { file: File; folderId?: string }) => {
      const uploadId = Math.random().toString(36).substring(7)
      
      addUpload({
        id: uploadId,
        fileName: file.name,
        progress: 0,
        status: 'pending',
        folderId,
      })

      try {
        // Step 1: Initialize upload on backend
        const initData = await fileService.initUpload({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          folderId,
        })

        // Step 2: Upload to storage provider directly
        setStatus(uploadId, 'uploading')
        await fileService.uploadToPresignedUrl(
          initData.uploadUrl,
          file,
          initData.storageProvider,
          (progress) => {
            updateProgress(uploadId, progress)
          }
        )

        // Step 3: Complete upload on backend
        const completedFile = await fileService.completeUpload(initData.fileId)
        setStatus(uploadId, 'completed')

        // Update user storage locally
        if (user) {
          updateUser({ storageUsed: user.storageUsed + file.size })
        }

        return completedFile
      } catch (err: any) {
        setStatus(uploadId, 'error', err.message || 'Upload failed')
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Upload completed successfully!')
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`)
    },
  })

  return {
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
  }
}
