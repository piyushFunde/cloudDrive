import { create } from 'zustand'

export interface UploadItem {
  id: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  folderId?: string
}

interface UploadState {
  uploads: UploadItem[]
  isVisible: boolean
  addUpload: (item: UploadItem) => void
  updateProgress: (id: string, progress: number) => void
  setStatus: (id: string, status: UploadItem['status'], error?: string) => void
  removeUpload: (id: string) => void
  clearCompleted: () => void
  setVisible: (visible: boolean) => void
}

export const useUploadStore = create<UploadState>((set) => ({
  uploads: [],
  isVisible: false,
  addUpload: (item) =>
    set((state) => ({
      uploads: [...state.uploads, item],
      isVisible: true,
    })),
  updateProgress: (id, progress) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, progress, status: 'uploading' } : u
      ),
    })),
  setStatus: (id, status, error) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, status, error, progress: status === 'completed' ? 100 : u.progress } : u
      ),
    })),
  removeUpload: (id) =>
    set((state) => ({ uploads: state.uploads.filter((u) => u.id !== id) })),
  clearCompleted: () =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== 'completed'),
    })),
  setVisible: (visible) => set({ isVisible: visible }),
}))
