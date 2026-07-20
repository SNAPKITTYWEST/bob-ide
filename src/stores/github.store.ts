import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GitHubFile {
  path: string;
  name: string;
  type: 'file' | 'dir';
  sha: string;
  size?: number;
  url?: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubState {
  // Repository info
  owner: string | null;
  repo: string | null;
  branch: string;
  
  // File tree
  files: GitHubFile[];
  currentPath: string;
  
  // Commits
  commits: GitHubCommit[];
  
  // Branches
  branches: GitHubBranch[];
  
  // Loading states
  isLoadingFiles: boolean;
  isLoadingCommits: boolean;
  isLoadingBranches: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  setRepository: (owner: string, repo: string) => void;
  setBranch: (branch: string) => void;
  setFiles: (files: GitHubFile[]) => void;
  setCurrentPath: (path: string) => void;
  setCommits: (commits: GitHubCommit[]) => void;
  setBranches: (branches: GitHubBranch[]) => void;
  setLoadingFiles: (loading: boolean) => void;
  setLoadingCommits: (loading: boolean) => void;
  setLoadingBranches: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGitHubStore = create<GitHubState>()(
  persist(
    (set) => ({
      // Initial state
      owner: null,
      repo: null,
      branch: 'main',
      files: [],
      currentPath: '',
      commits: [],
      branches: [],
      isLoadingFiles: false,
      isLoadingCommits: false,
      isLoadingBranches: false,
      error: null,

      // Actions
      setRepository: (owner, repo) => {
        set({
          owner,
          repo,
          files: [],
          currentPath: '',
          commits: [],
          branches: [],
          error: null,
        });
      },

      setBranch: (branch) => {
        set({ branch, files: [], currentPath: '' });
      },

      setFiles: (files) => {
        set({ files, isLoadingFiles: false });
      },

      setCurrentPath: (path) => {
        set({ currentPath: path });
      },

      setCommits: (commits) => {
        set({ commits, isLoadingCommits: false });
      },

      setBranches: (branches) => {
        set({ branches, isLoadingBranches: false });
      },

      setLoadingFiles: (loading) => {
        set({ isLoadingFiles: loading });
      },

      setLoadingCommits: (loading) => {
        set({ isLoadingCommits: loading });
      },

      setLoadingBranches: (loading) => {
        set({ isLoadingBranches: loading });
      },

      setError: (error) => {
        set({ error });
      },

      reset: () => {
        set({
          owner: null,
          repo: null,
          branch: 'main',
          files: [],
          currentPath: '',
          commits: [],
          branches: [],
          isLoadingFiles: false,
          isLoadingCommits: false,
          isLoadingBranches: false,
          error: null,
        });
      },
    }),
    {
      name: 'bob-github-storage',
      partialize: (state) => ({
        owner: state.owner,
        repo: state.repo,
        branch: state.branch,
      }),
    }
  )
);

// Made with Bob
