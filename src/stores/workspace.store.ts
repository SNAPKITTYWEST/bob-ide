import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Repository {
  owner: string;
  name: string;
  branch: string;
  url: string;
}

interface WorkspaceState {
  // State
  workspaceId: string | null;
  repository: Repository | null;
  rootPath: string | null;
  isOpen: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  openWorkspace: (repo: Repository) => Promise<void>;
  closeWorkspace: () => void;
  setRepository: (repo: Repository) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      workspaceId: null,
      repository: null,
      rootPath: null,
      isOpen: false,
      
      // Initialize from storage
      initialize: async () => {
        const state = get();
        if (state.workspaceId && state.repository) {
          set({ isOpen: true });
        }
      },
      
      // Open a workspace
      openWorkspace: async (repo: Repository) => {
        const workspaceId = `${repo.owner}/${repo.name}`;
        set({
          workspaceId,
          repository: repo,
          rootPath: `/${repo.owner}/${repo.name}`,
          isOpen: true
        });
      },
      
      // Close workspace
      closeWorkspace: () => {
        set({
          workspaceId: null,
          repository: null,
          rootPath: null,
          isOpen: false
        });
      },
      
      // Update repository
      setRepository: (repo: Repository) => {
        set({ repository: repo });
      }
    }),
    {
      name: 'bob-workspace',
      partialize: (state) => ({
        workspaceId: state.workspaceId,
        repository: state.repository,
        rootPath: state.rootPath
      })
    }
  )
);

// Made with Bob
