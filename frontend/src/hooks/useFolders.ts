import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { folderService, FolderContentsDto } from '../services/folderService'
import { toast } from 'react-hot-toast'

export function useFolders(folderId?: string) {
  const queryClient = useQueryClient()

  const contentsQuery = useQuery<FolderContentsDto>({
    queryKey: ['folder-contents', folderId || 'root'],
    queryFn: () => (folderId ? folderService.getFolderContents(folderId) : folderService.getRootContents()),
  })

  const createFolderMutation = useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
      folderService.createFolder(name, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      toast.success('Folder created successfully')
    },
    onError: () => {
      toast.error('Failed to create folder')
    },
  })

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => folderService.renameFolder(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      toast.success('Folder renamed')
    },
    onError: () => {
      toast.error('Failed to rename folder')
    },
  })

  const moveFolderMutation = useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId?: string }) =>
      folderService.moveFolder(id, targetFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      toast.success('Folder moved')
    },
    onError: () => {
      toast.error('Failed to move folder')
    },
  })

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => folderService.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] })
      toast.success('Folder moved to Trash')
    },
    onError: () => {
      toast.error('Failed to delete folder')
    },
  })

  return {
    contents: contentsQuery.data,
    isLoadingContents: contentsQuery.isLoading,
    errorContents: contentsQuery.error,
    createFolder: createFolderMutation.mutateAsync,
    isCreatingFolder: createFolderMutation.isPending,
    renameFolder: renameFolderMutation.mutateAsync,
    moveFolder: moveFolderMutation.mutateAsync,
    deleteFolder: deleteFolderMutation.mutateAsync,
  }
}
