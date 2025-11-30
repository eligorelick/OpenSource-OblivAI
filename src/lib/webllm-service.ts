/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: 'any' types are necessary for WebLLM library integration and browser GPU APIs

import * as webllm from '@mlc-ai/web-llm';
import type { ModelConfig } from './model-config';
import { sanitizeInput } from './security';

// Development-only logging
const log = {
  info: (...args: any[]) => import.meta.env.DEV && console.log(...args),
  warn: (...args: any[]) => import.meta.env.DEV && console.warn(...args),
  error: (...args: any[]) => console.error(...args) // Always log errors
};

/**
 * Represents a chat message in the conversation history.
 */
export interface ChatMessage {
  /** Message role: 'user', 'assistant', or 'system' */
  role: 'user' | 'assistant' | 'system';
  /** Message text content */
  content: string;
  /** Timestamp when the message was created */
  timestamp: Date;
}

/**
 * Progress information during model initialization or response generation.
 */
export interface GenerationProgress {
  /** Progress percentage (0-100) */
  progress: number;
  /** Descriptive status text */
  text: string;
  /** Time elapsed in seconds */
  timeElapsed: number;
}

/**
 * Service wrapper for WebLLM AI inference engine.
 *
 * Provides a simplified interface for:
 * - Loading AI models with progress tracking
 * - Generating chat responses with streaming support
 * - Managing model lifecycle (unloading, switching models)
 *
 * Privacy Notes:
 * - All inference happens in-browser using WebGPU/WebGL/WASM
 * - Models are cached in IndexedDB (whitelisted by SecurityManager)
 * - User input is sanitized with DOMPurify before sending to model
 * - No data ever leaves the device
 *
 * @example
 * ```typescript
 * const service = new WebLLMService();
 *
 * // Load a model with progress tracking
 * await service.initializeModel(modelConfig, (progress, status) => {
 *   console.log(`${progress}%: ${status}`);
 * });
 *
 * // Generate a response
 * const response = await service.generateResponse(
 *   [{ role: 'user', content: 'Hello!', timestamp: new Date() }],
 *   (token) => console.log(token) // Stream tokens as they're generated
 * );
 * ```
 */
export class WebLLMService {
  private engine: webllm.MLCEngine | null = null;
  private currentModel: string | null = null;
  private isLoading = false;
  private loadingProgress = 0;
  private loadingStatus = '';
  private abortController: AbortController | null = null;

  private async cleanup(): Promise<void> {
    if (this.engine) {
      try {
        await this.engine.unload();
      } catch {
        // Silently handle unload errors
      }
      this.engine = null;
    }
    this.currentModel = null;
    this.loadingProgress = 0;
    this.loadingStatus = '';
  }

  /**
   * Initializes and loads an AI model for inference.
   *
   * Downloads model files from HuggingFace CDN (if not cached) and initializes
   * the WebLLM engine. Provides real-time progress updates during download.
   *
   * The model is cached in IndexedDB for offline use after first download.
   * Switching models automatically unloads the previous model to free memory.
   *
   * @param modelConfig - Configuration for the model to load
   * @param onProgress - Optional callback for progress updates (0-100%, status message)
   * @returns Promise that resolves when model is fully loaded
   * @throws Error if model loading fails or if another model is already loading
   *
   * @example
   * ```typescript
   * await service.initializeModel(
   *   { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 1B', ... },
   *   (progress, status) => {
   *     console.log(`${progress}%: ${status}`);
   *   }
   * );
   * ```
   */
  async initializeModel(
    modelConfig: ModelConfig,
    onProgress?: (progress: number, status: string) => void
  ): Promise<void> {
    if (this.isLoading) {
      throw new Error('Model is already loading');
    }

    // Clean up existing engine if switching models
    if (this.engine && this.currentModel !== modelConfig.id) {
      await this.cleanup();
    }

    // If same model is already loaded, return
    if (this.engine && this.currentModel === modelConfig.id) {
      return;
    }

    this.isLoading = true;
    this.loadingProgress = 0;
    this.loadingStatus = 'Initializing model...';
    onProgress?.(this.loadingProgress, this.loadingStatus);

    // Detect if we're on iOS or mobile (WebGPU may not be available)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // AUTOMATIC: Check WebGPU availability (will auto-fallback to WebGL if unavailable)
    let hasWebGPU = false;
    let gpuName = 'Unknown GPU';

    if (!isIOS && 'gpu' in navigator) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (adapter) {
          hasWebGPU = true;

          // Get GPU info
          try {
            const info = await adapter.requestAdapterInfo?.();
            gpuName = info?.description || 'Unknown GPU';
            log.info('[WebLLM] ✓ WebGPU available - using GPU acceleration');
            log.info('[WebLLM] GPU:', gpuName);
          } catch {
            // Fallback to WebGL detection for GPU name
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
            if (gl) {
              const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
              if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                gpuName = renderer || 'Unknown GPU';
                log.info('[WebLLM] GPU (via WebGL):', gpuName);
              }
            }
          }
        } else {
          // No WebGPU adapter - will use WebGL automatically
          log.info('[WebLLM] WebGPU not available - using WebGL (still GPU accelerated)');
        }
      } catch {
        // WebGPU error - will automatically fall back to WebGL
        log.info('[WebLLM] WebGPU not enabled - using WebGL fallback (still works!)');
      }
    }

    // Always try to detect GPU even if WebGPU isn't available
    if (!hasWebGPU) {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            gpuName = renderer || 'Unknown GPU';
            log.info('[WebLLM] Using WebGL with GPU:', gpuName);
          }
        }
      } catch {
        log.info('[WebLLM] GPU detection failed - will use CPU (slower)');
      }
    }

    try {
      // Create the engine with privacy-focused configuration
      this.loadingStatus = hasWebGPU ? 'Initializing WebGPU engine...' : (isIOS ? 'Initializing WebGL engine...' : 'Creating ML engine...');
      onProgress?.(5, this.loadingStatus);

      // Initialize with real-time progress tracking
      // Force WebGL on iOS/mobile since WebGPU is not reliably available
      const engineConfig: any = {
        initProgressCallback: (report: any) => {
          // Update progress in real-time
          if (report.progress !== undefined && report.progress !== null) {
            // Convert progress (0-1) to percentage (0-100)
            const progressPercent = Math.round(report.progress * 100);
            this.loadingProgress = progressPercent;

            // Dynamic status messages based on progress
            const gpuType = hasWebGPU ? 'WebGPU (RTX GPU)' : (isMobile ? 'GPU' : 'WebGPU');
            if (progressPercent < 5) {
              this.loadingStatus = `Initializing ${gpuType}...`;
            } else if (progressPercent < 15) {
              this.loadingStatus = 'Checking model cache...';
            } else if (progressPercent < 25) {
              this.loadingStatus = 'Downloading model metadata...';
            } else if (progressPercent < 40) {
              this.loadingStatus = 'Downloading model weights...';
            } else if (progressPercent < 55) {
              this.loadingStatus = 'Loading model into memory...';
            } else if (progressPercent < 70) {
              this.loadingStatus = `Compiling ${gpuType} shaders...`;
            } else if (progressPercent < 85) {
              this.loadingStatus = 'Optimizing for your device...';
            } else if (progressPercent < 95) {
              this.loadingStatus = 'Finalizing model initialization...';
            } else {
              this.loadingStatus = 'Almost ready...';
            }

            // Include time elapsed if available
            if (report.timeElapsed) {
              const elapsed = Math.round(report.timeElapsed);
              this.loadingStatus += ` (${elapsed}s)`;
            }

            // Include descriptive text if provided
            if (report.text && report.text.length > 0) {
              // Use the actual text from WebLLM for more accuracy
              this.loadingStatus = report.text;
            }

            onProgress?.(this.loadingProgress, this.loadingStatus);
          }
        }
      };

      // Configure backend - WebLLM will auto-select best available (WebGPU > WebGL > CPU)
      engineConfig.logLevel = 'INFO';

      if (hasWebGPU) {
        log.info('[WebLLM] ✓ Ready - WebGPU enabled for maximum performance');
        log.info('[WebLLM] Performance: ~50-150 tokens/sec on', gpuName);
      } else {
        log.info('[WebLLM] ✓ Ready - Using WebGL/CPU fallback');
        log.info('[WebLLM] Performance: ~5-20 tokens/sec (slower but works!)');
        log.info('[WebLLM] 💡 Tip: For 10x faster performance, enable WebGPU in chrome://flags');
      }

      this.engine = new webllm.MLCEngine(engineConfig);

      this.loadingStatus = hasWebGPU ? 'Starting GPU-accelerated download...' : 'Starting model download...';
      onProgress?.(10, this.loadingStatus);

      // Load the model with progress tracking
      await this.engine.reload(modelConfig.id);

      // Update progress to 100% when loading is complete
      this.loadingProgress = 100;
      this.loadingStatus = 'Model loaded successfully';
      onProgress?.(this.loadingProgress, this.loadingStatus);

      this.currentModel = modelConfig.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('[WebLLM] Model loading failed:', errorMessage, error);
      this.loadingStatus = `Error loading model: ${errorMessage}`;
      onProgress?.(0, this.loadingStatus);

      // Provide user-friendly error messages for common issues
      let userFriendlyMessage = errorMessage;

      if (errorMessage.toLowerCase().includes('webgpu') || errorMessage.toLowerCase().includes('gpu')) {
        // Special message for mobile devices
        if (isMobile) {
          userFriendlyMessage = 'GPU initialization failed on your mobile device. This usually means:\n\n' +
            '1. Your browser needs WebGL enabled (check browser settings)\n' +
            '2. Your device might be low on memory (close other apps)\n' +
            '3. Try a smaller model (Qwen2 0.5B or Llama 3.2 1B work best on mobile)\n\n' +
            'Check browser console for more details.';
        } else {
          userFriendlyMessage = 'GPU acceleration not available. Your browser or device may not support it. Try Chrome/Edge on desktop, or select a smaller model.';
        }
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch') || errorMessage.toLowerCase().includes('download')) {
        userFriendlyMessage = 'Network error while downloading model. Check your internet connection and try again.';
      } else if (errorMessage.toLowerCase().includes('memory') || errorMessage.toLowerCase().includes('oom') || errorMessage.toLowerCase().includes('out of memory')) {
        if (isMobile) {
          userFriendlyMessage = 'Out of memory on your mobile device. Try:\n\n' +
            '1. Close other apps and browser tabs\n' +
            '2. Restart your browser\n' +
            '3. Use a smaller model (Qwen2 0.5B only needs 2GB RAM)';
        } else {
          userFriendlyMessage = 'Out of memory. This model is too large for your device. Please select a smaller model from the Tiny category.';
        }
      } else if (errorMessage.toLowerCase().includes('abort') || errorMessage.toLowerCase().includes('cancel')) {
        userFriendlyMessage = 'Model loading was cancelled.';
      }

      throw new Error(userFriendlyMessage);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Generates an AI response for a conversation using the loaded model.
   *
   * Supports streaming (token-by-token) generation for responsive UX.
   * User input is automatically sanitized with DOMPurify to prevent XSS.
   * System instructions can be prepended to customize AI behavior.
   *
   * @param messages - Array of conversation messages (user and assistant)
   * @param onToken - Optional callback invoked for each generated token (streaming)
   * @param maxTokens - Maximum tokens to generate (default: 2048)
   * @param systemInstruction - Optional system prompt to customize behavior
   * @returns Promise that resolves with the complete generated response
   * @throws Error if model is not initialized or generation fails
   *
   * @example
   * ```typescript
   * const messages = [
   *   { role: 'user', content: 'What is AI?', timestamp: new Date() }
   * ];
   *
   * const response = await service.generateResponse(
   *   messages,
   *   (token) => console.log(token), // Stream tokens
   *   2048,
   *   'You are a helpful assistant. Be concise.'
   * );
   * ```
   */
  async generateResponse(
    messages: ChatMessage[],
    onToken?: (token: string) => void,
    maxTokens = 1024, // Reduced from 2048 for consumer GPUs (RTX 4050/3060)
    systemInstruction?: string
  ): Promise<string> {
    if (!this.engine) {
      throw new Error('Model not initialized');
    }

    try {
      // Convert messages to the format expected by WebLLM
      const chatMessages: Array<{role: string, content: string}> = [];

      // Add system instruction if provided
      if (systemInstruction && systemInstruction.trim()) {
        chatMessages.push({
          role: 'system',
          content: systemInstruction.trim()
        });
      }

      // Add user and assistant messages
      for (const msg of messages) {
        chatMessages.push({
          role: msg.role,
          content: msg.role === 'user' ? sanitizeInput(msg.content) : msg.content
        });
      }

      // Set up abort controller for this generation
      this.abortController = new AbortController();

      // Use chat completions API for streaming
      // Optimized settings for consumer GPUs (RTX 4050/3060/etc)
      const completion = await this.engine.chat.completions.create({
        messages: chatMessages as webllm.ChatCompletionMessageParam[],
        max_tokens: Math.min(maxTokens, 1024), // Cap at 1024 for consumer GPU performance
        temperature: 0.7, // Good balance for quality and diversity
        top_p: 0.95, // Slightly reduced for faster sampling
        stream: true,
        // Optional: reduce context window for consumer GPUs
        // This helps prevent OOM errors on GPUs with limited VRAM
      });

      let fullResponse = '';

      for await (const chunk of completion) {
        if (this.abortController.signal.aborted) {
          break;
        }

        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullResponse += delta;
          if (onToken) {
            onToken(delta);
          }
        }
      }

      return fullResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Generation cancelled');
      }

      // Check for GPU device loss errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isGPULost = errorMessage.includes('Instance reference no longer exists') ||
                        errorMessage.includes('Device was lost') ||
                        errorMessage.includes('GPUDeviceLostInfo') ||
                        errorMessage.includes('OperationError');

      if (isGPULost) {
        // Clean up the engine since GPU context is lost
        this.engine = null;
        this.currentModel = null;
        throw new Error('GPU_DEVICE_LOST: GPU ran out of memory. Please reload the model or try a smaller one.');
      }

      // Response generation error handled
      throw new Error(`Failed to generate response: ${errorMessage}`);
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Estimates the token count for a given text string.
   *
   * Uses a rough heuristic (~4 characters per token) since WebLLM
   * doesn't expose the tokenizer directly.
   *
   * @param text - The text to estimate tokens for
   * @returns Promise that resolves with estimated token count
   */
  async getTokenCount(text: string): Promise<number> {
    // Rough estimation - WebLLM doesn't expose tokenizer directly
    // Average is ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Checks if an AI model is currently loaded and ready for inference.
   *
   * @returns true if a model is loaded, false otherwise
   */
  isModelLoaded(): boolean {
    return this.engine !== null;
  }

  /**
   * Gets the ID of the currently loaded model.
   *
   * @returns The model ID string, or null if no model is loaded
   */
  getCurrentModel(): string | null {
    return this.currentModel;
  }

  /**
   * Cancels the current response generation if one is in progress.
   *
   * Safe to call even if no generation is active.
   */
  cancelGeneration(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Disposes of the service, unloading the model and freeing resources.
   *
   * Should be called when the service is no longer needed.
   *
   * @returns Promise that resolves when cleanup is complete
   */
  async dispose(): Promise<void> {
    await this.cleanup();
    this.cancelGeneration();
  }

  /**
   * Checks if a model is currently loading.
   *
   * @returns true if model loading is in progress, false otherwise
   */
  getLoadingStatus(): boolean {
    return this.isLoading;
  }

  /**
   * Gets the current loading progress and status message.
   *
   * @returns Object with progress (0-100) and status message
   */
  getLoadingProgress(): { progress: number; status: string } {
    return {
      progress: this.loadingProgress,
      status: this.loadingStatus
    };
  }
}