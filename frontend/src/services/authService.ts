import api from './api'

export interface RegisterData { name: string; email: string; password: string }
export interface LoginData { email: string; password: string }
export interface AuthUser { id: string; email: string; name: string; avatarUrl?: string; role: string; storageUsed: number }

export const authService = {
  async register(data: RegisterData) {
    const res = await api.post('/auth/register', data)
    return res.data.data
  },
  async login(data: LoginData) {
    const res = await api.post('/auth/login', data)
    return res.data.data
  },
  async getMe(): Promise<AuthUser> {
    const res = await api.get('/auth/me')
    return res.data.data
  },
}
