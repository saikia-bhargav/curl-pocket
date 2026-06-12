import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils';
import type { Collection, CollectionFolder, CollectionRequest } from '@/types/collection';
import type { ApiRequest } from '@/types/request';

interface CollectionsState {
  collections: Record<string, Collection>;
  folders: Record<string, CollectionFolder>;
  requests: Record<string, CollectionRequest>;
}

interface CollectionsActions {
  // Collections
  addCollection: (name: string, color: string) => string;
  updateCollection: (id: string, updates: Partial<Omit<Collection, 'id'>>) => void;
  deleteCollection: (id: string) => void;

  // Folders
  addFolder: (collectionId: string, name: string, parentId?: string) => string;
  updateFolder: (id: string, updates: Partial<Omit<CollectionFolder, 'id'>>) => void;
  deleteFolder: (id: string) => void;

  // Requests
  addRequest: (collectionId: string, request: ApiRequest, folderId?: string) => string;
  updateRequest: (id: string, updates: Partial<Omit<CollectionRequest, 'id'>>) => void;
  deleteRequest: (id: string) => void;
  moveRequest: (id: string, targetCollectionId: string, targetFolderId?: string) => void;
}

export const useCollectionsStore = create<CollectionsState & CollectionsActions>()(
  persist(
    immer((set, get) => ({
      collections: {},
      folders: {},
      requests: {},

      // ── Collections ──────────────────────────────────────────
      addCollection: (name, color) => {
        const id = generateId();
        const now = Date.now();
        set(state => {
          state.collections[id] = { id, name, color, createdAt: now, updatedAt: now };
        });
        return id;
      },

      updateCollection: (id, updates) => {
        set(state => {
          if (state.collections[id]) {
            Object.assign(state.collections[id], updates);
            state.collections[id].updatedAt = Date.now();
          }
        });
      },

      deleteCollection: (id) => {
        set(state => {
          delete state.collections[id];
          // Cascading delete for folders
          for (const [folderId, folder] of Object.entries(state.folders)) {
            if (folder.collectionId === id) {
              delete state.folders[folderId];
            }
          }
          // Cascading delete for requests
          for (const [reqId, req] of Object.entries(state.requests)) {
            if (req.collectionId === id) {
              delete state.requests[reqId];
            }
          }
        });
      },

      // ── Folders ──────────────────────────────────────────────
      addFolder: (collectionId, name, parentId) => {
        const id = generateId();
        const now = Date.now();
        set(state => {
          state.folders[id] = { id, collectionId, name, parentId, createdAt: now, updatedAt: now };
        });
        return id;
      },

      updateFolder: (id, updates) => {
        set(state => {
          if (state.folders[id]) {
            Object.assign(state.folders[id], updates);
            state.folders[id].updatedAt = Date.now();
          }
        });
      },

      deleteFolder: (id) => {
        set(state => {
          // Recursive cascading delete helper
          const deleteRecursive = (folderId: string) => {
            delete state.folders[folderId];
            // Delete child folders
            for (const [childId, child] of Object.entries(state.folders)) {
              if (child.parentId === folderId) {
                deleteRecursive(childId);
              }
            }
            // Delete child requests
            for (const [reqId, req] of Object.entries(state.requests)) {
              if (req.folderId === folderId) {
                delete state.requests[reqId];
              }
            }
          };
          deleteRecursive(id);
        });
      },

      // ── Requests ─────────────────────────────────────────────
      addRequest: (collectionId, request, folderId) => {
        const id = generateId();
        const now = Date.now();
        set(state => {
          state.requests[id] = {
            ...request,
            id,
            collectionId,
            folderId,
            createdAt: now,
            updatedAt: now,
          };
        });
        return id;
      },

      updateRequest: (id, updates) => {
        set(state => {
          if (state.requests[id]) {
            Object.assign(state.requests[id], updates);
            state.requests[id].updatedAt = Date.now();
          }
        });
      },

      deleteRequest: (id) => {
        set(state => {
          delete state.requests[id];
        });
      },

      moveRequest: (id, targetCollectionId, targetFolderId) => {
        set(state => {
          if (state.requests[id]) {
            state.requests[id].collectionId = targetCollectionId;
            state.requests[id].folderId = targetFolderId;
            state.requests[id].updatedAt = Date.now();
          }
        });
      },
    })),
    {
      name: 'collections-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
