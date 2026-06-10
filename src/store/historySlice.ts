import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { generateId } from '@/utils';
import type { ApiRequest, ApiResponse } from '@/types/request';

export interface HistoryEntry {
  id: string;
  request: ApiRequest;
  response: ApiResponse;
  timestamp: number;
}

interface HistoryState {
  entries: HistoryEntry[];
}

interface HistoryActions {
  addEntry: (request: ApiRequest, response: ApiResponse) => void;
  clearHistory: () => void;
  removeEntry: (id: string) => void;
}

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  immer(set => ({
    entries: [],

    addEntry: (request, response) => {
      set(state => {
        state.entries.unshift({
          id: generateId(),
          request,
          response,
          timestamp: Date.now(),
        });
        // Cap to 200 entries
        if (state.entries.length > 200) {
          state.entries.splice(200);
        }
      });
    },

    clearHistory: () => set(state => { state.entries = []; }),

    removeEntry: (id) => set(state => {
      const idx = state.entries.findIndex(e => e.id === id);
      if (idx !== -1) { state.entries.splice(idx, 1); }
    }),
  })),
);

export const selectHistory = (s: HistoryState & HistoryActions) => s.entries;
