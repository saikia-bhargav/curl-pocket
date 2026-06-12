import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HistoryEntry } from '@/types/history';
import type { ApiRequest, ApiResponse } from '@/types/request';
import { generateId } from '@/utils';

const MAX_ENTRIES = 200;
const STORAGE_KEY = 'history-store-v1';

interface HistoryState {
  entries: HistoryEntry[];
}

interface HistoryActions {
  addEntry: (request: ApiRequest, response: ApiResponse) => void;
  deleteEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;
  markSaved: (id: string, collectionId: string) => void;
  clearAll: () => void;
  clearOlderThan: (days: number) => void;
}

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  persist(
    immer((set) => ({
      entries: [],

      addEntry: (request, response) => {
        set(state => {
          const entry: HistoryEntry = {
            id: generateId(),
            request,
            response,
            timestamp: Date.now(),
            isFavorite: false,
          };

          state.entries.unshift(entry);

          if (state.entries.length > MAX_ENTRIES) {
            const favorites = state.entries.filter(e => e.isFavorite);
            const nonFavorites = state.entries
              .filter(e => !e.isFavorite)
              .slice(0, MAX_ENTRIES - favorites.length);
            state.entries = [...favorites, ...nonFavorites].sort(
              (a, b) => b.timestamp - a.timestamp,
            );
          }
        });
      },

      deleteEntry: (id) => {
        set(state => {
          const idx = state.entries.findIndex(e => e.id === id);
          if (idx !== -1) { state.entries.splice(idx, 1); }
        });
      },

      toggleFavorite: (id) => {
        set(state => {
          const entry = state.entries.find(e => e.id === id);
          if (entry !== undefined) { entry.isFavorite = !entry.isFavorite; }
        });
      },

      markSaved: (id, collectionId) => {
        set(state => {
          const entry = state.entries.find(e => e.id === id);
          if (entry !== undefined) { entry.collectionId = collectionId; }
        });
      },

      clearAll: () => {
        set(state => {
          state.entries = state.entries.filter(e => e.isFavorite);
        });
      },

      clearOlderThan: (days) => {
        set(state => {
          const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
          state.entries = state.entries.filter(
            e => e.isFavorite || e.timestamp >= cutoff,
          );
        });
      },
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): HistoryState => ({ entries: state.entries }),
    },
  ),
);

// ── Selectors ──────────────────────────────────────────────────
export const selectAllEntries = (s: HistoryState) => s.entries;
export const selectFavorites  = (s: HistoryState) => s.entries.filter(e => e.isFavorite);
export const selectEntryById  = (id: string) => (s: HistoryState) =>
  s.entries.find(e => e.id === id);
