import { create } from 'zustand';

interface BrowseStore {
  filePaths: string[];
  updateFilePaths: (newPaths: string[]) => void;
  addFilePath: (path: string) => void;
  clearFilePaths: () => void;
}

export const useBrowseStore = create<BrowseStore>((set) => ({
  filePaths: [],

  updateFilePaths: (newPaths) => set((state) => ({ filePaths: [...new Set([...state.filePaths, ...newPaths])] })),

  addFilePath: (path) => set((state) => ({ filePaths: [...new Set([...state.filePaths, ...path])] })),

  clearFilePaths: () => set({ filePaths: [] })
}));
