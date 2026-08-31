import api from './api'
import type { FileDto } from './fileService'
import type { FolderDto } from './folderService'

export interface SearchResult {
  files: FileDto[]
  folders: FolderDto[]
}

export const searchService = {
  async search(query: string, type?: string, page = 0, size = 20): Promise<SearchResult> {
    const params = new URLSearchParams({ q: query, page: String(page), size: String(size) })
    if (type) params.append('type', type)
    const res = await api.get(`/search?${params.toString()}`)
    return res.data.data
  },
}
