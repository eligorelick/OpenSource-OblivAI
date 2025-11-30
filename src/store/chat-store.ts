/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: 'any' types are used for window.gc() and browser extension APIs

import { create } from 'zustand';
import type { ChatMessage } from '../lib/webllm-service';
import type { ModelConfig } from '../lib/model-config';

export interface ChatState {
  messages: ChatMessage[];
  selectedModel: ModelConfig | null;
  isGenerating: boolean;
  modelLoadingProgress: number;
  modelLoadingStatus: string;
  isDarkMode: boolean;
  autoDeleteChats: boolean;
  systemInstruction: string;
  storageEnabled: boolean;
  contextTokenCount: number;
  showContextWarning: boolean;

  // Actions
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  clearAllHistory: () => void;
  setSelectedModel: (model: ModelConfig) => void;
  setGenerating: (isGenerating: boolean) => void;
  setModelLoadingProgress: (progress: number, status: string) => void;
  toggleDarkMode: () => void;
  setAutoDeleteChats: (autoDelete: boolean) => void;
  setSystemInstruction: (instruction: string) => void;
  enableStorage: () => void;
  disableStorage: () => void;
  exportChat: () => string;
  updateContextTokenCount: (count: number) => void;
  dismissContextWarning: () => void;
}

// Privacy-first theme storage key (localStorage only, never leaves device)
const THEME_KEY = 'oblivai-theme';

// Initialize dark mode from DOM (set by set-theme.js before React mounts)
const getInitialDarkMode = (): boolean => {
  // Check what set-theme.js already determined
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return true; // Default to dark
};

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  selectedModel: null,
  isGenerating: false,
  modelLoadingProgress: 0,
  modelLoadingStatus: '',
  isDarkMode: getInitialDarkMode(),
  autoDeleteChats: false,
  systemInstruction: '',
  storageEnabled: false,
  contextTokenCount: 0,
  showContextWarning: false,

  addMessage: (message: ChatMessage) => {
    set((state) => {
      const newMessages = [...state.messages, { ...message, timestamp: new Date() }];

      // Estimate token count (rough: ~4 chars per token)
      const totalChars = newMessages.reduce((sum, msg) => sum + msg.content.length, 0);
      const estimatedTokens = Math.ceil(totalChars / 4);

      // Show warning if context > 2048 tokens (consumer GPUs struggle with long context)
      const showWarning = estimatedTokens > 2048;

      return {
        messages: newMessages,
        contextTokenCount: estimatedTokens,
        showContextWarning: showWarning
      };
    });
  },

  clearMessages: () => {
    set({
      messages: [],
      contextTokenCount: 0,
      showContextWarning: false
    });
  },

  clearAllHistory: () => {
    // SECURE WIPE: Overwrite message content before clearing
    // This helps prevent memory forensics from recovering chat data
    const state = get();
    state.messages.forEach(msg => {
      // Overwrite string content with random data before GC
      const len = msg.content.length;
      (msg as any).content = crypto.getRandomValues(new Uint8Array(len)).toString();
      (msg as any).role = '';
    });

    // Clear the messages array
    set({
      messages: [],
      contextTokenCount: 0,
      showContextWarning: false,
      systemInstruction: '' // Also clear system instruction for privacy
    });

    // Clear any potential browser storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Storage clearing not available
    }

    // Clear all caches except model cache
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          // Keep WebLLM/MLC model caches, delete everything else
          if (!cacheName.includes('mlc') && !cacheName.includes('webllm') && !cacheName.includes('oblivai-static')) {
            caches.delete(cacheName);
          }
        });
      }).catch(() => {
        // Cache clearing not available
      });
    }

    // Clear user data from IndexedDB (preserve model cache)
    if ('indexedDB' in window) {
      try {
        // List of databases to preserve (model cache only)
        const preserveDatabases = ['webllm', 'mlc-wasm-cache', 'mlc-chat-config', 'tvmjs'];

        if ('databases' in indexedDB) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => {
              const dbName = db.name || '';
              // Delete any database NOT in the preserve list
              if (!preserveDatabases.some(p => dbName.includes(p))) {
                indexedDB.deleteDatabase(dbName);
              }
            });
          }).catch(() => {});
        }
      } catch {
        // IndexedDB clearing not available
      }
    }

    // Trigger garbage collection hint (helps with memory cleanup)
    // Only available in debug mode with --expose-gc flag
    const win = window as typeof window & { gc?: () => void };
    if (win.gc) {
      try { win.gc(); } catch { /* GC not available */ }
    }
  },

  setSelectedModel: (model: ModelConfig) => {
    set({ selectedModel: model });
  },

  setGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },

  setModelLoadingProgress: (progress: number, status: string) => {
    set({ modelLoadingProgress: progress, modelLoadingStatus: status });
  },

  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      if (newMode) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      // Persist preference to localStorage (privacy-safe: stays on device)
      try {
        localStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
      } catch {
        // localStorage not available (private browsing, etc.) - gracefully ignore
      }
      return { isDarkMode: newMode };
    });
  },

  setAutoDeleteChats: (autoDelete: boolean) => {
    set({ autoDeleteChats: autoDelete });
  },

  setSystemInstruction: (instruction: string) => {
    set({ systemInstruction: instruction });
  },

  // Note: Storage is always disabled for privacy - these functions are no-ops
  enableStorage: () => {
    // Intentionally does nothing - storage always disabled for privacy
    set({ storageEnabled: false });
  },

  disableStorage: () => {
    set({ storageEnabled: false });
  },

  exportChat: () => {
    const state = get();
    const markdown = state.messages
      .map(msg => `**${msg.role === 'user' ? 'You' : 'AI'}**: ${msg.content}`)
      .join('\n\n');

    const header = `# OBLIVAI Chat Export\n\nExported: ${new Date().toISOString()}\nModel: ${state.selectedModel?.name || 'Unknown'}\n\n---\n\n`;

    return header + markdown;
  },

  updateContextTokenCount: (count: number) => {
    set({
      contextTokenCount: count,
      showContextWarning: count > 2048
    });
  },

  dismissContextWarning: () => {
    set({ showContextWarning: false });
  }
}));