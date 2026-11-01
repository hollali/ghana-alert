import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SavedEntry, SavedStatus } from '@/src/types';

interface SavedState {
  entries: SavedEntry[];
  save: (id: string, status?: SavedStatus) => void;
  remove: (id: string) => void;
  toggleSaved: (id: string) => boolean;
  setStatus: (id: string, status: SavedStatus) => void;
  getEntry: (id: string) => SavedEntry | undefined;
  restore: (entry: SavedEntry) => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      entries: [],
      save: (id, status = 'saved') =>
        set((state) => {
          if (state.entries.some((entry) => entry.id === id)) {
            return {
              entries: state.entries.map((entry) =>
                entry.id === id ? { ...entry, status } : entry,
              ),
            };
          }
          return {
            entries: [
              { id, status, savedAt: new Date().toISOString() },
              ...state.entries,
            ],
          };
        }),
      remove: (id) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
      toggleSaved: (id) => {
        const existing = get().entries.find((entry) => entry.id === id);
        if (existing) {
          get().remove(id);
          return false;
        }
        get().save(id, 'saved');
        return true;
      },
      setStatus: (id, status) =>
        set((state) => ({
          entries: state.entries.some((entry) => entry.id === id)
            ? state.entries.map((entry) =>
                entry.id === id ? { ...entry, status } : entry,
              )
            : [{ id, status, savedAt: new Date().toISOString() }, ...state.entries],
        })),
      getEntry: (id) => get().entries.find((entry) => entry.id === id),
      restore: (entry) =>
        set((state) => ({
          entries: state.entries.some((item) => item.id === entry.id)
            ? state.entries
            : [entry, ...state.entries],
        })),
    }),
    {
      name: 'ghanaalert-saved',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
