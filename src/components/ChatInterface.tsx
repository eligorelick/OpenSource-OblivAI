import React, { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ChatHeader } from './ChatHeader';
import { sanitizeInput } from '../lib/security';
import { useChatStore } from '../store/chat-store';
import { WebLLMService } from '../lib/webllm-service';
import type { ChatMessage } from '../lib/webllm-service';
import { AlertCircle, X, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  webllmService: WebLLMService;
  onBack?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ webllmService, onBack }) => {
  const {
    messages,
    isGenerating,
    addMessage,
    setGenerating,
    selectedModel,
    clearMessages,
    contextTokenCount,
    showContextWarning: storeShowContextWarning,
    dismissContextWarning,
    systemInstruction
  } = useChatStore();
  const [localShowWarning, setLocalShowWarning] = useState(true);

  // Auto-focus input when chat interface mounts
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const textarea = document.querySelector('textarea[aria-label="Message input"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);

    // Cleanup timeout to prevent memory leaks
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!selectedModel || !webllmService.isModelLoaded()) {
      return;
    }

    // Sanitize user input before sending to the model
    const cleaned = sanitizeInput(content).slice(0, 4000);

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: cleaned,
      timestamp: new Date()
    };
    addMessage(userMessage);
    setGenerating(true);

    try {
      // Prepare messages for the model
      // Limit context for consumer GPUs - prevents VRAM overload
      // Keep fewer messages if context is getting large
      const maxContextMessages = contextTokenCount > 2048 ? 6 : 10;
      const contextMessages = messages.slice(-maxContextMessages);
      const allMessages = [...contextMessages, userMessage];

      // Generate response
      let assistantContent = '';
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      // Add empty assistant message that will be updated
      addMessage(assistantMessage);

      await webllmService.generateResponse(
        allMessages,
        (token) => {
          assistantContent += token;
          // Update the last message in the store
          useChatStore.setState((state) => ({
            messages: [
              ...state.messages.slice(0, -1),
              { ...assistantMessage, content: assistantContent }
            ]
          }));
        },
        undefined,
        systemInstruction
      );
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate response';

      // Check for GPU device loss - provide helpful recovery message
      if (errorMsg.includes('GPU_DEVICE_LOST')) {
        addMessage({
          role: 'assistant',
          content: '⚠️ **GPU Memory Error**\n\nThe GPU ran out of memory. This can happen with larger models or long conversations.\n\n**To fix:**\n1. Click the back arrow (←) to return to model selection\n2. Try a smaller model, or\n3. Clear your chat history and reload the same model',
          timestamp: new Date()
        });
      } else {
        addMessage({
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: new Date()
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleStopGeneration = () => {
    webllmService.cancelGeneration();
    setGenerating(false);
  };

  // Show context warning based on token count
  const shouldShowContextWarning = storeShowContextWarning && localShowWarning;
  const contextPercentage = Math.min(100, Math.round((contextTokenCount / 4096) * 100));

  // Determine warning severity (critical at 75% of 4K limit)
  const isContextCritical = contextTokenCount > 3072;

  return (
    <div id="main-content" className="flex flex-col h-screen bg-dark" role="main" aria-label="Chat interface">
      <ChatHeader onBack={onBack} />

      {/* Context Warning Banner */}
      {shouldShowContextWarning && (
        <div className={`${isContextCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} border-b px-4 py-3`}>
          <div className="max-w-6xl mx-auto flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 ${isContextCritical ? 'text-red-400' : 'text-yellow-400'} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 text-sm">
              <p className={`${isContextCritical ? 'text-red-200' : 'text-yellow-200'} font-medium mb-1`}>
                {isContextCritical ? '🔴 Critical: Context too long!' : '⚠️ Long conversation detected'}
                <span className="ml-2 text-xs opacity-80">
                  (~{contextTokenCount.toLocaleString()} tokens, {contextPercentage}% of limit)
                </span>
              </p>
              <p className={`${isContextCritical ? 'text-red-300/80' : 'text-yellow-300/80'} text-xs`}>
                {isContextCritical ? (
                  <>
                    <strong>Consumer GPUs struggle with long context.</strong> Responses may be slow, degraded, or cause crashes.
                    <button
                      onClick={() => { clearMessages(); setLocalShowWarning(false); }}
                      className={`ml-1 underline ${isContextCritical ? 'hover:text-red-200' : 'hover:text-yellow-200'} font-semibold`}
                    >
                      Clear chat now
                    </button> (recommended)
                  </>
                ) : (
                  <>
                    Large context uses more VRAM and may slow down responses on consumer GPUs (RTX 4050/3060/etc).
                    <button
                      onClick={() => { clearMessages(); setLocalShowWarning(false); }}
                      className="ml-1 underline hover:text-yellow-200 font-medium"
                    >
                      Clear chat
                    </button> to improve performance, or continue if your GPU can handle it.
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => { dismissContextWarning(); setLocalShowWarning(false); }}
              className={`${isContextCritical ? 'text-red-400/60 hover:text-red-400' : 'text-yellow-400/60 hover:text-yellow-400'} transition-colors`}
              aria-label="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col max-w-6xl mx-auto w-full px-2 sm:px-4">
        <MessageList messages={messages} isGenerating={isGenerating} />

        {/* System Instruction Indicator */}
        {systemInstruction && systemInstruction.trim() && (
          <div className="px-2 py-1.5 bg-purple-500/10 border-t border-purple-500/20">
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span className="truncate">
                Custom instructions active: "{systemInstruction.slice(0, 50)}{systemInstruction.length > 50 ? '...' : ''}"
              </span>
            </div>
          </div>
        )}

        <InputArea
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
          disabled={!selectedModel || !webllmService.isModelLoaded()}
        />
      </div>
    </div>
  );
};