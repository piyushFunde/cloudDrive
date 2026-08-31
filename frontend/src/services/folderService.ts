import api from './api'
import type { FileDto } from './fileService'

export interface FolderDto {
  id: string
  name: string
  parentFolderId?: string
  parentFolderName?: string
  fileCount: number
  subFolderCount: number
  breadcrumb: { id: string; name: string }[]
  createdAt: string
}

export interface FolderContentsDto {
  currentFolder: FolderDto | null
  folders: FolderDto[]
  files: FileDto[]
}

export const folderService = {
  async createFolder(name: string, parentFolderId?: string): Promise<FolderDto> {
    const res = await api.post('/folders', { name, parentFolderId })
    return res.data.data
  },

  async getRootContents(): Promise<FolderContentsDto> {
    const res = await api.get('/folders/root')
    return res.data.data
  },

  async getFolderContents(folderId: string): Promise<FolderContentsDto> {
    const res = await api.get(`/folders/${folderId}/contents`)
    return res.data.data
  },

  async renameFolder(id: string, name: string): Promise<FolderDto> {
    const res = await api.patch(`/folders/${id}/rename`, { name })
    return res.data.data
  },

  async moveFolder(id: string, targetFolderId?: string): Promise<FolderDto> {
    const res = await api.patch(`/folders/${id}/move`, { targetFolderId })
    return res.data.data
  },

  async deleteFolder(id: string): Promise<void> {
    await api.delete(`/folders/${id}`)
  },
}
