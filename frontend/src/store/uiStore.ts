import { create } from 'zustand'

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'createdAt' | 'size' | 'type'

interface UIState {
  viewMode: ViewMode
  sortBy: SortBy
  sortAsc: boolean
  selectedIds: string[]
  shareModalOpen: boolean
  shareModalResourceId: string | null
  shareModalResourceType: 'FILE' | 'FOLDER' | null
  createFolderOpen: boolean
  renameTarget: { id: string; type: 'FILE' | 'FOLDER'; name: string } | null
  setViewMode: (mode: ViewMode) => void
  setSortBy: (sort: SortBy) => void
  toggleSortDir: () => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
  openShareModal: (id: string, type: 'FILE' | 'FOLDER') => void
  closeShareModal: () => void
  setCreateFolderOpen: (open: boolean) => void
  setRenameTarget: (target: UIState['renameTarget']) => void
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'grid',
  sortBy: 'createdAt',
  sortAsc: false,
  selectedIds: [],
  shareModalOpen: false,
  shareModalResourceId: null,
  shareModalResourceType: null,
  createFolderOpen: false,
  renameTarget: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  toggleSortDir: () => set((state) => ({ sortAsc: !state.sortAsc })),
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((s) => s !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),
  openShareModal: (id, type) =>
    set({ shareModalOpen: true, shareModalResourceId: id, shareModalResourceType: type }),
  closeShareModal: () =>
    set({ shareModalOpen: false, shareModalResourceId: null, shareModalResourceType: null }),
  setCreateFolderOpen: (open) => set({ createFolderOpen: open }),
  setRenameTarget: (target) => set({ renameTarget: target }),
}))
