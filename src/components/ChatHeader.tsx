import React from 'react';
import {
  Trash2,
  Download,
  Moon,
  Sun,
  Shield,
  Settings,
  X
} from 'lucide-react';
import { useChatStore } from '../store/chat-store';

interface ChatHeaderProps {
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack }) => {
  const {
    messages,
    selectedModel,
    isDarkMode,
    autoDeleteChats,
    clearAllHistory,
    toggleDarkMode,
    setAutoDeleteChats,
    exportChat,
    contextTokenCount
  } = useChatStore();

  const [showSettings, setShowSettings] = React.useState(false);
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const systemInstruction = useChatStore(state => state.systemInstruction);
  const setSystemInstruction = useChatStore(state => state.setSystemInstruction);
  const [tempInstruction, setTempInstruction] = React.useState(systemInstruction || '');
  const [showExamples, setShowExamples] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  // Storage is intentionally disabled in this build; in-memory only.

  // Sync temp instruction when system instruction changes from store
  React.useEffect(() => {
    setTempInstruction(systemInstruction || '');
  }, [systemInstruction]);

  const PRESETS: { id: string; label: string; text: string }[] = [
    {
      id: 'concise',
      label: 'Concise',
      text: 'Answer succinctly and directly. Keep responses short and to the point.'
    },
    {
      id: 'detailed',
      label: 'Detailed',
      text: 'Provide thorough and detailed answers. Explain reasoning and include examples when helpful.'
    },
    {
      id: 'clarify',
      label: 'Ask for clarification',
      text: 'When the user query is ambiguous, ask clarifying questions before answering.'
    }
  ];

  const handleExport = () => {
    const markdown = exportChat();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oblivai-chat-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    clearAllHistory();
    setShowClearConfirm(false);
  };

  return (
    <>
      <header className="glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {onBack && (
                <button onClick={onBack} className="glass p-2 rounded-lg glass-hover mr-2">
                  ←
                </button>
              )}
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src="/Whitelogotransparentbg.png"
                  alt="OBLIVAI"
                  className="w-4 h-4 sm:w-6 sm:h-6 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-theme-primary">OBLIVAI</h1>
                <p className="text-xs text-theme-secondary truncate">
                  {selectedModel ? selectedModel.name : 'No model selected'} •{' '}
                  <span className="hidden sm:inline">{messages.length} msgs • </span>
                  {contextTokenCount > 0 && (
                    <span className={`${contextTokenCount > 3072 ? 'text-red-400' : contextTokenCount > 2048 ? 'text-yellow-400' : 'text-theme-secondary'}`}>
                      {contextTokenCount} tokens •{' '}
                    </span>
                  )}
                  100% Private
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={toggleDarkMode}
                className="glass p-2 rounded-lg glass-hover"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-theme-secondary" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-theme-secondary" />
                )}
              </button>

              {messages.length > 0 && (
                <>
                  <button
                    onClick={handleExport}
                    className="glass p-2 rounded-lg glass-hover"
                    aria-label="Export chat"
                  >
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 text-theme-secondary" />
                  </button>

                  <button
                    onClick={handleClear}
                    className="glass p-2 rounded-lg glass-hover"
                    aria-label="Clear chat"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-theme-secondary" />
                  </button>
                </>
              )}

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="glass p-2 rounded-lg glass-hover"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-theme-secondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full bg-theme">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-theme-primary">Privacy Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="glass p-2 rounded-lg glass-hover"
              >
                <X className="h-4 w-4 text-theme-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-theme-primary font-medium mb-2">Assistant Instructions</label>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setTempInstruction(p.text)}
                      className="glass px-2 py-1 rounded-md text-sm text-theme-primary"
                    >
                      {p.label}
                    </button>
                  ))}

                  <div className="ml-auto relative">
                    <button
                      onClick={() => setShowExamples(!showExamples)}
                      className="glass px-2 py-1 rounded-md text-sm text-theme-primary"
                    >
                      Examples
                    </button>

                    {showExamples && (
                      <div className="absolute right-0 mt-2 w-64 glass rounded-md p-3 z-50 bg-theme">
                        <p className="text-xs text-theme-secondary mb-2">Try these examples:</p>
                        <ul className="space-y-2 text-sm text-theme-primary">
                          <li>
                            <button onClick={() => setTempInstruction('You are an expert assistant. Provide concise and accurate answers.')}
                              className="text-left w-full hover:text-primary">
                              Expert concise helper
                            </button>
                          </li>
                          <li>
                            <button onClick={() => setTempInstruction('You are an assistant that always asks clarifying questions when intent is unclear.')}
                              className="text-left w-full hover:text-primary">
                              Clarify intent
                            </button>
                          </li>
                          <li>
                            <button onClick={() => setTempInstruction('Always provide step-by-step instructions when explaining how to perform tasks.')}
                              className="text-left w-full hover:text-primary">
                              Step-by-step instructions
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <textarea
                  value={tempInstruction}
                  onChange={(e) => setTempInstruction(e.target.value)}
                  className="w-full glass rounded-md p-3 text-sm text-theme-primary placeholder-theme-muted h-28"
                  placeholder="Give initial directions to the assistant, e.g. 'Answer all user questions succinctly and ask clarifying questions when needed.'"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setSystemInstruction(tempInstruction || '');
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2000);
                    }}
                    className="glass px-3 py-2 rounded-md text-theme-primary hover:bg-primary/20 transition-colors"
                  >
                    {saveSuccess ? '✓ Saved!' : 'Save Instructions'}
                  </button>
                  <button
                    onClick={() => {
                      setTempInstruction('');
                      setSystemInstruction('');
                      setSaveSuccess(false);
                    }}
                    className="glass px-3 py-2 rounded-md text-theme-primary hover:bg-red-500/20 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {systemInstruction && !saveSuccess && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-green-500">
                      ✓ Instructions active: Will apply to new messages
                    </p>
                    <p className="text-xs text-theme-muted">
                      Note: Larger models (3B+) follow instructions better than smaller ones
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-theme-primary font-medium">Auto-delete chats</p>
                    <p className="text-xs text-theme-secondary">Clear chat history on session end</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDeleteChats}
                    onChange={(e) => setAutoDeleteChats(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-theme-primary font-medium">Storage disabled (privacy)</p>
                      <p className="text-xs text-theme-secondary">This build enforces in-memory only operation; no localStorage, Cache, or IndexedDB writes occur.</p>
                    </div>
                  </div>
              </div>

              <div className="glass rounded-lg p-4 border-green-500/30 bg-green-500/10">
                <p className="text-sm text-green-500 font-medium">
                  ✓ All data stays in your browser
                </p>
                <p className="text-sm text-green-500 font-medium mt-1">
                  ✓ No server connections
                </p>
                <p className="text-sm text-green-500 font-medium mt-1">
                  ✓ No tracking or analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full bg-theme">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Clear all messages?</h3>
            <p className="text-theme-secondary text-sm mb-6">
              This will permanently delete all messages in the current chat. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 glass px-4 py-2 rounded-lg glass-hover text-theme-primary"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="flex-1 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 text-white"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};