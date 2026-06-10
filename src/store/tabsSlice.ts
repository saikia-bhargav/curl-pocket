// Zustand slice for open request tabs (browser-style multi-tab).
// Lives here so RequestTabsBar and RequestBuilderScreen share state.

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { generateId } from '@/utils';
import type { HttpMethod } from '@/types/request';

export interface RequestTab {
  id: string;
  method: HttpMethod;
  title: string;       // display name — URL hostname or custom name
  url: string;
  isDirty: boolean;    // unsaved changes indicator
}

interface TabsState {
  tabs: RequestTab[];
  activeTabId: string;
}

interface TabsActions {
  newTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, partial: Partial<Omit<RequestTab, 'id'>>) => void;
  setDirty: (id: string, dirty: boolean) => void;
}

const DEFAULT_TAB: RequestTab = {
  id: 'tab-default',
  method: 'GET',
  title: 'New request',
  url: '',
  isDirty: false,
};

export const useTabsStore = create<TabsState & TabsActions>()(
  immer((set, _get) => ({
    tabs: [DEFAULT_TAB],
    activeTabId: DEFAULT_TAB.id,

    newTab: () => {
      const id = generateId();
      const tab: RequestTab = {
        id,
        method: 'GET',
        title: 'New request',
        url: '',
        isDirty: false,
      };
      set(state => {
        state.tabs.push(tab);
        state.activeTabId = id;
      });
    },

    closeTab: (id: string) => {
      set(state => {
        const idx = state.tabs.findIndex(t => t.id === id);
        if (idx === -1) { return; }

        // If closing the active tab, switch to adjacent tab
        if (state.activeTabId === id) {
          const next = state.tabs[idx + 1] ?? state.tabs[idx - 1];
          if (next !== undefined) {
            state.activeTabId = next.id;
          } else {
            // Last tab closed — create a fresh one
            const newId = generateId();
            state.tabs = [{
              id: newId,
              method: 'GET',
              title: 'New request',
              url: '',
              isDirty: false,
            }];
            state.activeTabId = newId;
            return;
          }
        }

        state.tabs.splice(idx, 1);
      });
    },

    setActiveTab: (id: string) => {
      set(state => { state.activeTabId = id; });
    },

    updateTab: (id: string, partial: Partial<Omit<RequestTab, 'id'>>) => {
      set(state => {
        const tab = state.tabs.find(t => t.id === id);
        if (tab !== undefined) {
          Object.assign(tab, partial);
        }
      });
    },

    setDirty: (id: string, dirty: boolean) => {
      set(state => {
        const tab = state.tabs.find(t => t.id === id);
        if (tab !== undefined) {
          tab.isDirty = dirty;
        }
      });
    },
  })),
);

// Selectors (use these in components to avoid full re-renders)
export const selectTabs = (s: TabsState) => s.tabs;
export const selectActiveTabId = (s: TabsState) => s.activeTabId;
export const selectActiveTab = (s: TabsState & TabsActions) =>
  s.tabs.find(t => t.id === s.activeTabId);
