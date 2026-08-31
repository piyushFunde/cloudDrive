import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fileService } from '../services/fileService'
import { toast } from 'react-hot-toast'

export function useFiles(folderId?: string) {
  const queryClient = useQueryClient()

  const starredQuery = useQuery({
    queryKey: ['files', 'starred'],
    queryFn: () => fileService.getStarred(),
  })

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => fileService.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('File moved to Trash')
    },
    onError: () => {
      toast.error('Failed to delete file')
    },
  })

  const renameFileMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => fileService.renameFile(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('File renamed')
    },
    onError: () => {
      toast.error('Failed to rename file')
    },
  })

  const moveFileMutation = useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId?: string }) =>
      fileService.moveFile(id, targetFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('File moved')
    },
    onError: () => {
      toast.error('Failed to move file')
    },
  })

  const toggleStarMutation = useMutation({
    mutationFn: (id: string) => fileService.toggleStar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
    onError: () => {
      toast.error('Failed to toggle star')
    },
  })

  return {
    starredFiles: starredQuery.data || [],
    isLoadingStarred: starredQuery.isLoading,
    deleteFile: deleteFileMutation.mutateAsync,
    renameFile: renameFileMutation.mutateAsync,
    moveFile: moveFileMutation.mutateAsync,
    toggleStar: toggleStarMutation.mutateAsync,
  }
}
