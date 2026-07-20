import { create } from 'zustand';

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ModelState {
  // Model info
  modelId: string;
  status: ModelStatus;
  error: string | null;
  
  // Loading progress
  loadingProgress: number;
  loadingPhase: string;
  
  // Capabilities
  supportsWebGPU: boolean;
  maxTokens: number;
  temperature: number;
  
  // Actions
  setModelId: (modelId: string) => void;
  setStatus: (status: ModelStatus) => void;
  setError: (error: string | null) => void;
  setLoadingProgress: (progress: number, phase: string) => void;
  setSupportsWebGPU: (supports: boolean) => void;
  setTemperature: (temperature: number) => void;
  setMaxTokens: (maxTokens: number) => void;
  reset: () => void;
}

const DEFAULT_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

export const useModelStore = create<ModelState>((set) => ({
  // Initial state
  modelId: DEFAULT_MODEL,
  status: 'idle',
  error: null,
  loadingProgress: 0,
  loadingPhase: '',
  supportsWebGPU: false,
  maxTokens: 2048,
  temperature: 0.7,

  // Actions
  setModelId: (modelId) => {
    set({ modelId, status: 'idle', error: null });
  },

  setStatus: (status) => {
    set({ status });
  },

  setError: (error) => {
    set({ error, status: 'error' });
  },

  setLoadingProgress: (progress, phase) => {
    set({ loadingProgress: progress, loadingPhase: phase });
  },

  setSupportsWebGPU: (supports) => {
    set({ supportsWebGPU: supports });
  },

  setTemperature: (temperature) => {
    set({ temperature: Math.max(0, Math.min(2, temperature)) });
  },

  setMaxTokens: (maxTokens) => {
    set({ maxTokens: Math.max(1, Math.min(4096, maxTokens)) });
  },

  reset: () => {
    set({
      modelId: DEFAULT_MODEL,
      status: 'idle',
      error: null,
      loadingProgress: 0,
      loadingPhase: '',
    });
  },
}));

// Made with Bob
