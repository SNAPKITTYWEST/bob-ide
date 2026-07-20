import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  status?: 'pending' | 'streaming' | 'complete' | 'error';
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'complete' | 'error';
  requiresApproval: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AgentState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  
  // Current state
  isStreaming: boolean;
  pendingApprovals: ToolCall[];
  
  // Settings
  autoApproveRead: boolean;
  autoApproveWrite: boolean;
  
  // Actions
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  addToolCall: (conversationId: string, messageId: string, toolCall: ToolCall) => void;
  approveToolCall: (toolCallId: string) => void;
  rejectToolCall: (toolCallId: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearConversation: (id: string) => void;
  setAutoApproveRead: (value: boolean) => void;
  setAutoApproveWrite: (value: boolean) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      // Initial state
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      pendingApprovals: [],
      autoApproveRead: true,
      autoApproveWrite: false,

      // Actions
      createConversation: (title = 'New Conversation') => {
        const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const conversation: Conversation = {
          id,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set(state => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));

        return id;
      },

      deleteConversation: (id) => {
        set(state => ({
          conversations: state.conversations.filter(c => c.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      addMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      updateMessage: (conversationId, messageId, updates) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      addToolCall: (conversationId, messageId, toolCall) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          toolCalls: [...(msg.toolCalls || []), toolCall],
                        }
                      : msg
                  ),
                }
              : conv
          ),
          pendingApprovals: toolCall.requiresApproval
            ? [...state.pendingApprovals, toolCall]
            : state.pendingApprovals,
        }));
      },

      approveToolCall: (toolCallId) => {
        set(state => ({
          conversations: state.conversations.map(conv => ({
            ...conv,
            messages: conv.messages.map(msg => ({
              ...msg,
              toolCalls: msg.toolCalls?.map(tc =>
                tc.id === toolCallId ? { ...tc, status: 'approved' as const } : tc
              ),
            })),
          })),
          pendingApprovals: state.pendingApprovals.filter(tc => tc.id !== toolCallId),
        }));
      },

      rejectToolCall: (toolCallId) => {
        set(state => ({
          conversations: state.conversations.map(conv => ({
            ...conv,
            messages: conv.messages.map(msg => ({
              ...msg,
              toolCalls: msg.toolCalls?.map(tc =>
                tc.id === toolCallId ? { ...tc, status: 'rejected' as const } : tc
              ),
            })),
          })),
          pendingApprovals: state.pendingApprovals.filter(tc => tc.id !== toolCallId),
        }));
      },

      setStreaming: (isStreaming) => {
        set({ isStreaming });
      },

      clearConversation: (id) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === id
              ? { ...conv, messages: [], updatedAt: Date.now() }
              : conv
          ),
        }));
      },

      setAutoApproveRead: (value) => {
        set({ autoApproveRead: value });
      },

      setAutoApproveWrite: (value) => {
        set({ autoApproveWrite: value });
      },
    }),
    {
      name: 'bob-agent-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        autoApproveRead: state.autoApproveRead,
        autoApproveWrite: state.autoApproveWrite,
      }),
    }
  )
);

// Made with Bob
