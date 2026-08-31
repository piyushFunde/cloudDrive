import api from './api'
import type { FileDto } from './fileService'
import type { FolderDto } from './folderService'

export interface TrashContents { files: FileDto[]; folders: FolderDto[] }

export const trashService = {
  async listTrash(): Promise<TrashContents> {
    const res = await api.get('/trash')
    return res.data.data
  },
  async restoreFile(id: string): Promise<FileDto> {
    const res = await api.post(`/trash/files/${id}/restore`)
    return res.data.data
  },
  async restoreFolder(id: string): Promise<FolderDto> {
    const res = await api.post(`/trash/folders/${id}/restore`)
    return res.data.data
  },
  async permanentDeleteFile(id: string): Promise<void> {
    await api.delete(`/trash/files/${id}`)
  },
  async permanentDeleteFolder(id: string): Promise<void> {
    await api.delete(`/trash/folders/${id}`)
  },
  async emptyTrash(): Promise<void> {
    await api.delete('/trash/empty')
  },
}
