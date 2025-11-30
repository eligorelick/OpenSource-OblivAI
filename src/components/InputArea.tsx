import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, AlertCircle } from 'lucide-react';
import { RateLimiter } from '../lib/security';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  disabled = false
}) => {
  const [input, setInput] = useState('');
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rateLimiter = useRef(new RateLimiter(10, 60000));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || disabled || isGenerating) return;

    if (!rateLimiter.current.canProceed()) {
      setRateLimitWarning(true);
      setTimeout(() => setRateLimitWarning(false), 3000);
      return;
    }

    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter without Shift or Ctrl+Enter to send
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Ctrl+Enter as alternative send shortcut
    else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Escape to stop generation
    else if (e.key === 'Escape' && isGenerating) {
      e.preventDefault();
      onStopGeneration();
    }
  };

  return (
    <div className="border-t border-theme p-3 sm:p-4 bg-theme">
      {rateLimitWarning && (
        <div className="mb-3 glass rounded-lg p-3 border-yellow-500/50 bg-yellow-500/10">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-yellow-500 font-medium">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Please slow down. Too many messages sent.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? 'Please select a model first...'
                : 'Type your message... (Enter to send, Shift+Enter for new line, Escape to stop)'
            }
            aria-label="Message input"
            aria-describedby="input-help"
            disabled={disabled || isGenerating}
            className="w-full glass rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-theme-primary placeholder-theme-muted
                     focus:outline-none focus:ring-2 focus:ring-primary resize-none
                     disabled:opacity-50 disabled:cursor-not-allowed min-h-[2.5rem]"
            rows={1}
            maxLength={4000}
          />

          <div className="absolute bottom-1 right-2 text-xs text-theme-muted">
            {input.length}/4000
          </div>
        </div>

        {isGenerating ? (
          <button
            type="button"
            onClick={onStopGeneration}
            className="glass px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-theme-primary hover:bg-red-500/20
                     transition-colors flex items-center gap-1 sm:gap-2 flex-shrink-0"
            aria-label="Stop generation"
          >
            <Square className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="gradient-primary px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-white
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:opacity-90 transition-opacity flex items-center gap-1 sm:gap-2 flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        )}
      </form>

      <div id="input-help" className="mt-2 text-xs text-theme-muted text-center px-2">
        All messages are processed locally • No data leaves your device
        <span className="hidden sm:inline"> • Shortcuts: Enter (send), Ctrl+Enter (send), Escape (stop)</span>
      </div>
    </div>
  );
};