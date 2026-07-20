import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorTab {
  id: string;
  path: string;
  label: string;
  language: string;
  isDirty: boolean;
  content?: string;
}

export interface EditorState {
  // Tabs
  tabs: EditorTab[];
  activeTabId: string | null;
  
  // Editor state
  cursorPosition: { line: number; column: number };
  selection: { start: number; end: number } | null;
  
  // Layout
  splitMode: 'single' | 'horizontal' | 'vertical';
  secondaryTabId: string | null;
  
  // Actions
  openFile: (path: string, content: string, language: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  setCursorPosition: (line: number, column: number) => void;
  setSelection: (start: number, end: number) => void;
  setSplitMode: (mode: 'single' | 'horizontal' | 'vertical') => void;
  closeAllTabs: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [],
      activeTabId: null,
      cursorPosition: { line: 1, column: 1 },
      selection: null,
      splitMode: 'single',
      secondaryTabId: null,

      // Actions
      openFile: (path, content, language) => {
        const existingTab = get().tabs.find(t => t.path === path);
        
        if (existingTab) {
          set({ activeTabId: existingTab.id });
          return;
        }

        const newTab: EditorTab = {
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          path,
          label: path.split('/').pop() || path,
          language,
          isDirty: false,
          content,
        };

        set(state => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));
      },

      closeTab: (tabId) => {
        const { tabs, activeTabId, secondaryTabId } = get();
        const newTabs = tabs.filter(t => t.id !== tabId);
        
        let newActiveId = activeTabId;
        let newSecondaryId = secondaryTabId;

        if (activeTabId === tabId) {
          newActiveId = newTabs.length > 0 ? newTabs[0].id : null;
        }

        if (secondaryTabId === tabId) {
          newSecondaryId = null;
        }

        set({
          tabs: newTabs,
          activeTabId: newActiveId,
          secondaryTabId: newSecondaryId,
        });
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId });
      },

      updateTabContent: (tabId, content) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId ? { ...tab, content } : tab
          ),
        }));
      },

      markTabDirty: (tabId, isDirty) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId ? { ...tab, isDirty } : tab
          ),
        }));
      },

      setCursorPosition: (line, column) => {
        set({ cursorPosition: { line, column } });
      },

      setSelection: (start, end) => {
        set({ selection: { start, end } });
      },

      setSplitMode: (mode) => {
        set({ splitMode: mode });
        if (mode === 'single') {
          set({ secondaryTabId: null });
        }
      },

      closeAllTabs: () => {
        set({
          tabs: [],
          activeTabId: null,
          secondaryTabId: null,
        });
      },
    }),
    {
      name: 'bob-editor-storage',
      partialize: (state) => ({
        tabs: state.tabs.map(t => ({ ...t, content: undefined })), // Don't persist content
        activeTabId: state.activeTabId,
        splitMode: state.splitMode,
      }),
    }
  )
);

// Made with Bob
