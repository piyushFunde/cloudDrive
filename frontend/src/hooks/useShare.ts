import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shareService } from '../services/shareService'
import { toast } from 'react-hot-toast'

export function useShare() {
  const queryClient = useQueryClient()

  const mySharesQuery = useQuery({
    queryKey: ['shared-with-me'],
    queryFn: () => shareService.getMyShares(),
  })

  const shareMutation = useMutation({
    mutationFn: (data: {
      resourceId: string
      resourceType: 'FILE' | 'FOLDER'
      targetEmail: string
      role: 'VIEWER' | 'EDITOR'
    }) => shareService.shareWithUser(data),
    onSuccess: () => {
      toast.success('Successfully shared resource!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to share resource')
    },
  })

  const createPublicLinkMutation = useMutation({
    mutationFn: (data: {
      resourceId: string
      resourceType: 'FILE' | 'FOLDER'
      role: 'VIEWER' | 'EDITOR'
      expiresAt?: string
      password?: string
    }) => shareService.createPublicLink(data),
    onSuccess: () => {
      toast.success('Public share link created!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create link')
    },
  })

  const revokeShareMutation = useMutation({
    mutationFn: (shareId: string) => shareService.revokeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-with-me'] })
      toast.success('Revoked access')
    },
    onError: () => {
      toast.error('Failed to revoke access')
    },
  })

  return {
    sharedWithMe: mySharesQuery.data || [],
    isLoadingShared: mySharesQuery.isLoading,
    shareWithUser: shareMutation.mutateAsync,
    isSharing: shareMutation.isPending,
    createPublicLink: createPublicLinkMutation.mutateAsync,
    isCreatingLink: createPublicLinkMutation.isPending,
    revokeShare: revokeShareMutation.mutateAsync,
  }
}
