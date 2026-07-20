import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'webllm' | 'openrouter' | 'ollama';

export interface SettingsState {
  // AI Provider
  aiProvider: AIProvider;
  
  // API Keys (stored in localStorage - user's responsibility)
  openRouterApiKey: string;
  ollamaBaseUrl: string;
  
  // Model selection per provider
  openRouterModel: string;
  ollamaModel: string;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Editor
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  
  // Actions
  setAIProvider: (provider: AIProvider) => void;
  setOpenRouterApiKey: (key: string) => void;
  setOllamaBaseUrl: (url: string) => void;
  setOpenRouterModel: (model: string) => void;
  setOllamaModel: (model: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setWordWrap: (wrap: boolean) => void;
  clearApiKeys: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      aiProvider: 'webllm',
      openRouterApiKey: '',
      ollamaBaseUrl: 'http://localhost:11434',
      openRouterModel: 'anthropic/claude-3.5-sonnet',
      ollamaModel: 'llama3.2',
      theme: 'system',
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,

      // Actions
      setAIProvider: (provider) => {
        set({ aiProvider: provider });
      },

      setOpenRouterApiKey: (key) => {
        set({ openRouterApiKey: key });
      },

      setOllamaBaseUrl: (url) => {
        set({ ollamaBaseUrl: url });
      },

      setOpenRouterModel: (model) => {
        set({ openRouterModel: model });
      },

      setOllamaModel: (model) => {
        set({ ollamaModel: model });
      },

      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme immediately
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      setFontSize: (size) => {
        set({ fontSize: Math.max(10, Math.min(24, size)) });
      },

      setTabSize: (size) => {
        set({ tabSize: Math.max(2, Math.min(8, size)) });
      },

      setWordWrap: (wrap) => {
        set({ wordWrap: wrap });
      },

      clearApiKeys: () => {
        set({
          openRouterApiKey: '',
          ollamaBaseUrl: 'http://localhost:11434',
        });
      },
    }),
    {
      name: 'bob-settings-storage',
    }
  )
);

// Made with Bob
