import api from './api'

export interface FileDto {
  id: string
  name: string
  mimeType: string
  size: number
  downloadUrl: string
  isStarred: boolean
  folderId?: string
  folderName?: string
  owner: { id: string; name: string; email: string }
  createdAt: string
  deletedAt?: string
}

export interface UploadInitResponse {
  fileId: string
  uploadUrl: string
  storageKey: string
  storageProvider: 'local' | 's3'
}

export const fileService = {
  async initUpload(data: { fileName: string; mimeType: string; size: number; folderId?: string }): Promise<UploadInitResponse> {
    const res = await api.post('/files/init-upload', data)
    return res.data.data
  },

  async completeUpload(fileId: string): Promise<FileDto> {
    const res = await api.post('/files/complete-upload', { fileId })
    return res.data.data
  },

  async getFile(id: string): Promise<FileDto> {
    const res = await api.get(`/files/${id}`)
    return res.data.data
  },

  async deleteFile(id: string): Promise<void> {
    await api.delete(`/files/${id}`)
  },

  async renameFile(id: string, name: string): Promise<FileDto> {
    const res = await api.patch(`/files/${id}/rename`, { name })
    return res.data.data
  },

  async moveFile(id: string, targetFolderId?: string): Promise<FileDto> {
    const res = await api.patch(`/files/${id}/move`, { targetFolderId })
    return res.data.data
  },

  async toggleStar(id: string): Promise<FileDto> {
    const res = await api.patch(`/files/${id}/star`)
    return res.data.data
  },

  async getStarred(): Promise<FileDto[]> {
    const res = await api.get('/files/starred')
    return res.data.data
  },

  // Upload file to local storage (dev) or handle S3 upload
  async uploadToPresignedUrl(uploadUrl: string, file: File, storageProvider: string,
    onProgress?: (pct: number) => void): Promise<void> {
    if (storageProvider === 'local') {
      // Upload to our backend local endpoint
      const formData = new FormData()
      formData.append('file', file)
      const key = new URL(uploadUrl).searchParams.get('key') || ''
      await api.post(`/files/local/upload?key=${encodeURIComponent(key)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
    } else {
      // S3 presigned PUT upload
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error('Upload failed')))
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(file)
      })
    }
  },
}
