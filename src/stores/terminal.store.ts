import { create } from 'zustand';

export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  exitCode: number | null;
  timestamp: number;
  status: 'pending' | 'running' | 'complete' | 'error';
  requiresApproval: boolean;
  approved: boolean;
}

export interface TerminalState {
  // Terminal state
  isOpen: boolean;
  isConnected: boolean;
  currentDirectory: string;
  
  // Command history
  commands: TerminalCommand[];
  commandHistory: string[];
  historyIndex: number;
  
  // Pending approvals
  pendingCommands: TerminalCommand[];
  
  // Settings
  autoApprove: boolean;
  fontSize: number;
  
  // Actions
  setOpen: (isOpen: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  setCurrentDirectory: (dir: string) => void;
  addCommand: (command: string, requiresApproval: boolean) => string;
  updateCommand: (id: string, updates: Partial<TerminalCommand>) => void;
  approveCommand: (id: string) => void;
  rejectCommand: (id: string) => void;
  addToHistory: (command: string) => void;
  navigateHistory: (direction: 'up' | 'down') => string | null;
  setAutoApprove: (value: boolean) => void;
  setFontSize: (size: number) => void;
  clearCommands: () => void;
  reset: () => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  // Initial state
  isOpen: false,
  isConnected: false,
  currentDirectory: '~',
  commands: [],
  commandHistory: [],
  historyIndex: -1,
  pendingCommands: [],
  autoApprove: false,
  fontSize: 14,

  // Actions
  setOpen: (isOpen) => {
    set({ isOpen });
  },

  setConnected: (isConnected) => {
    set({ isConnected });
  },

  setCurrentDirectory: (dir) => {
    set({ currentDirectory: dir });
  },

  addCommand: (command, requiresApproval) => {
    const id = `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newCommand: TerminalCommand = {
      id,
      command,
      output: '',
      exitCode: null,
      timestamp: Date.now(),
      status: requiresApproval ? 'pending' : 'running',
      requiresApproval,
      approved: !requiresApproval,
    };

    set(state => ({
      commands: [...state.commands, newCommand],
      pendingCommands: requiresApproval
        ? [...state.pendingCommands, newCommand]
        : state.pendingCommands,
    }));

    return id;
  },

  updateCommand: (id, updates) => {
    set(state => ({
      commands: state.commands.map(cmd =>
        cmd.id === id ? { ...cmd, ...updates } : cmd
      ),
    }));
  },

  approveCommand: (id) => {
    set(state => ({
      commands: state.commands.map(cmd =>
        cmd.id === id
          ? { ...cmd, approved: true, status: 'running' as const }
          : cmd
      ),
      pendingCommands: state.pendingCommands.filter(cmd => cmd.id !== id),
    }));
  },

  rejectCommand: (id) => {
    set(state => ({
      commands: state.commands.map(cmd =>
        cmd.id === id
          ? { ...cmd, approved: false, status: 'error' as const, output: 'Command rejected by user' }
          : cmd
      ),
      pendingCommands: state.pendingCommands.filter(cmd => cmd.id !== id),
    }));
  },

  addToHistory: (command) => {
    set(state => ({
      commandHistory: [...state.commandHistory, command],
      historyIndex: -1,
    }));
  },

  navigateHistory: (direction) => {
    const { commandHistory, historyIndex } = get();
    
    if (commandHistory.length === 0) return null;

    let newIndex = historyIndex;
    
    if (direction === 'up') {
      newIndex = historyIndex === -1
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1);
    } else {
      newIndex = historyIndex === -1
        ? -1
        : Math.min(commandHistory.length - 1, historyIndex + 1);
    }

    set({ historyIndex: newIndex });
    
    return newIndex === -1 ? '' : commandHistory[newIndex];
  },

  setAutoApprove: (value) => {
    set({ autoApprove: value });
  },

  setFontSize: (size) => {
    set({ fontSize: Math.max(10, Math.min(24, size)) });
  },

  clearCommands: () => {
    set({ commands: [] });
  },

  reset: () => {
    set({
      isOpen: false,
      isConnected: false,
      currentDirectory: '~',
      commands: [],
      pendingCommands: [],
    });
  },
}));

// Made with Bob
