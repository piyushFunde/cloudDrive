import api from './api'

export interface ShareDto {
  id: string
  resource: { id: string; name: string; type: string }
  sharedWith: { id: string; name: string; email: string; avatarUrl?: string }
  sharedBy: { id: string; name: string; email: string }
  role: 'VIEWER' | 'EDITOR'
  createdAt: string
}

export interface LinkShareDto {
  id: string
  token: string
  shareUrl: string
  role: 'VIEWER' | 'EDITOR'
  hasPassword: boolean
  expiresAt?: string
  accessCount: number
  resource: { id: string; name: string; type: string }
  createdAt: string
}

export const shareService = {
  async shareWithUser(data: {
    resourceId: string
    resourceType: 'FILE' | 'FOLDER'
    targetEmail: string
    role: 'VIEWER' | 'EDITOR'
  }): Promise<ShareDto> {
    const res = await api.post('/shares', data)
    return res.data.data
  },

  async getMyShares(): Promise<ShareDto[]> {
    const res = await api.get('/shares')
    return res.data.data
  },

  async revokeShare(id: string): Promise<void> {
    await api.delete(`/shares/${id}`)
  },

  async createPublicLink(data: {
    resourceId: string
    resourceType: 'FILE' | 'FOLDER'
    role: 'VIEWER' | 'EDITOR'
    expiresAt?: string
    password?: string
  }): Promise<LinkShareDto> {
    const res = await api.post('/public-links', data)
    return res.data.data
  },

  async accessPublicLink(token: string, password?: string): Promise<LinkShareDto> {
    const params = password ? `?password=${encodeURIComponent(password)}` : ''
    const res = await api.get(`/public-links/${token}${params}`)
    return res.data.data
  },

  async revokeLink(id: string): Promise<void> {
    await api.delete(`/public-links/${id}`)
  },
}
