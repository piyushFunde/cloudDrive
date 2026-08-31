import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService, RegisterData, LoginData } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'

export function useAuth() {
  const queryClient = useQueryClient()
  const { setAuth, logout, user } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      toast.success('Successfully logged in!')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Login failed'
      toast.error(msg)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      toast.success('Registration successful!')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
    },
  })

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => authService.getMe(),
    enabled: !!useAuthStore.getState().token,
  })

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    user: meQuery.data || user,
    isLoadingUser: meQuery.isLoading,
    logout,
  }
}
