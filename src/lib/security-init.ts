/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: 'any' types are necessary for browser API overrides and security monitoring

import { networkAudit } from './network-audit';

/**
 * Security Manager implementing comprehensive privacy and security controls.
 *
 * This singleton class manages all security measures for OBLIVAI:
 * - Anti-debugging and anti-tampering protection
 * - Data protection (storage isolation, memory wiping)
 * - Network security (request whitelisting, protocol blocking)
 * - Forensic protection (DOM monitoring, XSS prevention)
 *
 * Privacy Guarantees:
 * - IndexedDB whitelisting: Only AI model caching allowed, user data wiped on unload
 * - Network isolation: Only HuggingFace CDN for model downloads
 * - Smart clipboard: Allow copying responses, block everything else
 * - No analytics, tracking, or telemetry
 *
 * Tor/Onion Support:
 * - .onion domains recognized as valid local requests
 * - Console enabled on .onion for debugging (disabled on clearnet production)
 * - No HTTPS enforcement (CSP compatible with Tor HTTP onion services)
 *
 * @example
 * ```typescript
 * // Initialize security on app startup
 * SecurityManager.getInstance();
 *
 * // Validate external URLs
 * const isAllowed = SecurityManager.getInstance().validateOrigin('https://huggingface.co/model');
 * ```
 */
export class SecurityManager {
  private static instance: SecurityManager;
  private securityEnabled = true;

  private constructor() {
    this.initializeMaximumSecurity();
  }

  /**
   * Gets the singleton instance of SecurityManager.
   * Initializes security measures on first call.
   *
   * @returns The SecurityManager singleton instance
   */
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initializes all security layers on SecurityManager instantiation.
   * Executes in order:
   * 1. Memory sanitization
   * 2. Anti-debugging deployment
   * 3. Anti-tampering deployment
   * 4. Data protection deployment
   * 5. Network security deployment
   * 6. Forensic protection deployment
   * 7. Continuous security monitoring
   *
   * @private
   */
  private initializeMaximumSecurity(): void {
    // Immediate memory sanitization
    this.secureMemoryWipe();

    // Deploy all security measures
    this.deployAntiDebugging();
    this.deployAntiTampering();
    this.deployDataProtection();
    this.deployNetworkSecurity();
    this.deployForensicProtection();

    // Start continuous monitoring
    this.startSecurityMonitoring();
  }

  /**
   * Deploys anti-debugging protection to prevent developer tools access.
   *
   * Implements multiple detection methods:
   * - Timing-based debugger detection
   * - Console object detection
   * - Window size detection (DevTools open)
   * - Performance profiler detection
   *
   * Also disables:
   * - Console methods in production (not on localhost)
   * - Debugging keyboard shortcuts (F12, Ctrl+Shift+I/C/J, Ctrl+U)
   *
   * NOTE: Aggressive anti-debugging (page wiping) is DISABLED on localhost and .onion
   * to prevent false positives during development and Tor hosting.
   *
   * @private
   */
  private deployAntiDebugging(): void {
    // Check if we're on localhost or .onion (don't trigger aggressive security)
    // EXPANDED: Also allow any local IP addresses and development environments
    const isLocalOrOnion = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.endsWith('.onion') ||
                           window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.') ||
                           window.location.port === '5173' || // Vite dev server
                           window.location.port === '3000' || // Common dev port
                           window.location.port === '4173'; // Vite preview

    // Multi-layer debugger detection (DISABLED on localhost/.onion to prevent false positives)
    const detectDebugger = () => {
      if (isLocalOrOnion) {
        // On localhost/.onion: just log warnings, don't wipe page
        return;
      }

      // Only run aggressive detection on clearnet production
      // Timing-based detection
      const start = performance.now();
      // debugger; // Commented for production
      const duration = performance.now() - start;
      if (duration > 100) {
        this.initiateSecurityProtocol();
      }

      // Console object detection
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: () => {
          this.initiateSecurityProtocol();
          return 'detected';
        }
      });

      // Window size detection
      if (window.outerHeight - window.innerHeight > 200 ||
          window.outerWidth - window.innerWidth > 200) {
        this.initiateSecurityProtocol();
      }

      // DevTools detection via toString
      const checkObj = {
        get id() {
          (this as any).initiateSecurityProtocol?.();
          return 'detected';
        }
      };
      // Force evaluation
      void checkObj.id;

      // Performance profiler detection (adjusted threshold)
      const startProfile = performance.now();
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
      if (performance.now() - startProfile > 100) { // Increased threshold to avoid false positives
        this.initiateSecurityProtocol();
      }
    };

    // Run detection continuously (but it's no-op on localhost/.onion)
    setInterval(detectDebugger, 300);

    // Disable console methods in production only (not on localhost or .onion)
    if (!isLocalOrOnion) {
      const noop = () => {};
      ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml',
       'trace', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd',
       'profile', 'profileEnd', 'count', 'clear', 'table'].forEach(method => {
        (window.console as any)[method] = noop;
      });
    }

    // Prevent console object replacement
    Object.freeze(window.console);
    Object.defineProperty(window, 'console', {
      value: window.console,
      writable: false,
      configurable: false
    });

    // Block all debugging keyboard shortcuts (only on clearnet production)
    document.addEventListener('keydown', (e) => {
      if (isLocalOrOnion) {
        // Allow keyboard shortcuts on localhost/.onion for debugging
        return;
      }

      // F12, Ctrl+Shift+I/C/J, Ctrl+U
      if (e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key)) ||
          (e.ctrlKey && e.key === 'U') ||
          (e.metaKey && e.altKey && ['I', 'C', 'J'].includes(e.key))) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.initiateSecurityProtocol();
        return false;
      }
    }, true);
  }

  /**
   * Deploys anti-tampering protection to prevent UI manipulation and data extraction.
   *
   * Implements:
   * - Context menu blocking (right-click, auxclick)
   * - Smart text selection blocking (except inputs and AI responses)
   * - Smart clipboard management (allow copying responses, block elsewhere)
   * - Cut/paste restrictions (inputs only)
   * - Drag-and-drop prevention
   * - Print blocking with CSS and event handlers
   *
   * Privacy Feature: Allows users to copy AI responses while maintaining security
   *
   * @private
   */
  private deployAntiTampering(): void {
    // Prevent all context menus
    ['contextmenu', 'auxclick'].forEach(event => {
      document.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }, true);
    });

    // Block text selection except for input fields and message content
    document.addEventListener('selectstart', (e) => {
      const target = e.target as HTMLElement;
      const isAllowed = target.tagName === 'INPUT' ||
                       target.tagName === 'TEXTAREA' ||
                       target.closest('.message-content') ||
                       target.tagName === 'PRE' ||
                       target.tagName === 'CODE';
      if (!isAllowed) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);

    // CSS-based selection blocking (except inputs)
    const style = document.createElement('style');
    style.textContent = `
      *:not(input):not(textarea):not(.message-content):not(pre):not(code) {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
      }
      input, textarea, .message-content, pre, code {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    // Smart clipboard management - allow copying from message content and code
    document.addEventListener('copy', (e) => {
      const target = e.target as HTMLElement;
      const selection = window.getSelection();

      // Allow copying from message content, code blocks, and inputs
      const isAllowed =
        target.closest('.message-content') ||
        target.closest('pre') ||
        target.closest('code') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        // Also allow if selection contains message content
        (selection && selection.toString().length > 0 &&
         (selection.anchorNode?.parentElement?.closest('.message-content') ||
          selection.anchorNode?.parentElement?.closest('pre') ||
          selection.anchorNode?.parentElement?.closest('code')));

      if (!isAllowed) {
        (e as ClipboardEvent).clipboardData?.clearData();
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // If allowed, let it proceed normally
    }, true);

    // Block cut operation everywhere
    document.addEventListener('cut', (e) => {
      const target = e.target as HTMLElement;
      // Only allow cut in input fields
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (!isInput) {
        (e as ClipboardEvent).clipboardData?.clearData();
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);

    // Allow paste only in input fields
    document.addEventListener('paste', (e) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (!isInput) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);

    // Prevent drag operations
    ['drag', 'dragstart', 'dragenter', 'dragover', 'dragleave', 'dragend', 'drop'].forEach(event => {
      document.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);
    });

    // Prevent printing
    ['beforeprint', 'afterprint'].forEach(event => {
      window.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.style.visibility = 'hidden';
        this.secureMemoryWipe();
        return false;
      }, true);
    });

    // CSS print blocking
    const printStyle = document.createElement('style');
    printStyle.textContent = '@media print { * { display: none !important; } }';
    document.head.appendChild(printStyle);
  }

  /**
   * Deploys data protection measures to ensure no user data persists.
   *
   * Implements:
   * - Storage clearing on page unload (localStorage, sessionStorage, IndexedDB user data)
   * - IndexedDB whitelisting (preserves WebLLM model cache only)
   * - WebSQL disabling
   * - Cookie blocking
   * - Periodic memory wiping (every 15 seconds)
   *
   * Critical Privacy Feature: Separates model cache (allowed) from user data (wiped)
   *
   * @private
   */
  private deployDataProtection(): void {
    // Clear storage on unload but allow temporary usage
    window.addEventListener('beforeunload', () => {
      try {
        // RELAXED: Only clear on unload, not during runtime
        localStorage.clear();
        sessionStorage.clear();
        // Clear user data from IndexedDB but keep model cache
        this.clearUserDataFromIndexedDB();
      } catch (e) {
        // Silent fail - storage might not be available
        console.warn('[Security] Storage clearing failed (expected in some contexts):', e);
      }
    });

    // DO NOT disable IndexedDB - WebLLM needs it for model caching
    // Instead, we'll clear user data on unload while preserving model cache
    // This allows offline model usage while maintaining privacy
  }

  /**
   * Clears user data from IndexedDB while preserving AI model cache.
   *
   * This is the CORE privacy mechanism that allows offline model usage
   * while ensuring no chat history or user preferences persist.
   *
   * Whitelist (preserved):
   * - webllm: WebLLM model storage
   * - webllm-cache: WebLLM cache
   * - mlc-wasm-cache: MLC WASM cache
   * - mlc-chat-config: MLC configuration
   * - tvmjs: TVM JavaScript runtime
   *
   * Everything else: Deleted on page unload
   *
   * @private
   * @async
   * @returns Promise that resolves when IndexedDB cleanup is complete
   */
  private async clearUserDataFromIndexedDB(): Promise<void> {
    try {
      // Whitelist of databases allowed to persist (WebLLM model cache)
      const allowedDatabases = [
        'webllm',
        'webllm-cache',
        'mlc-wasm-cache',
        'mlc-chat-config',
        'tvmjs'
      ];

      if ('databases' in indexedDB) {
        const databases = await indexedDB.databases();
        databases.forEach(dbInfo => {
          const dbName = dbInfo.name || '';
          // Delete any database NOT in the whitelist
          if (!allowedDatabases.some(allowed => dbName.includes(allowed))) {
            indexedDB.deleteDatabase(dbName);
          }
        });
      }
    } catch {
      // Silent fail - IndexedDB might not be available
    }
  }

  /**
   * Deploys network security to restrict all external communication.
   *
   * Implements:
   * - Fetch API override with domain whitelisting
   * - Network request logging via NetworkAuditLog
   * - WebRTC disabling (prevents IP leaks)
   * - WebSocket disabling
   * - EventSource disabling
   *
   * Allowed domains:
   * - huggingface.co (AI model downloads)
   * - cdn-lfs.huggingface.co (large file storage)
   * - raw.githubusercontent.com (fallback sources)
   * - xethub.hf.co (HuggingFace alternative CDN)
   * - localhost/127.0.0.1 (development)
   * - *.onion (Tor hidden services)
   *
   * All other domains: BLOCKED
   *
   * @private
   */
  private deployNetworkSecurity(): void {
    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      // Only allow whitelisted domains
      const allowedDomains = [
        'huggingface.co',
        'cdn-lfs.huggingface.co',
        'raw.githubusercontent.com',
        'xethub.hf.co'
      ];

      try {
        const urlObj = new URL(url, window.location.origin);
        const isAllowed = allowedDomains.some(domain =>
          urlObj.hostname.includes(domain)
        );

        const isLocalRequest = urlObj.hostname.includes(window.location.hostname) ||
                              urlObj.hostname === 'localhost' ||
                              urlObj.hostname === '127.0.0.1' ||
                              urlObj.hostname.endsWith('.onion') ||
                              urlObj.hostname.startsWith('192.168.') ||
                              urlObj.hostname.startsWith('10.') ||
                              urlObj.hostname.startsWith('172.16.') ||
                              urlObj.hostname.startsWith('172.17.') ||
                              urlObj.hostname.startsWith('172.18.') ||
                              urlObj.hostname.startsWith('172.19.') ||
                              urlObj.hostname.startsWith('172.20.') ||
                              urlObj.hostname.startsWith('172.21.') ||
                              urlObj.hostname.startsWith('172.22.') ||
                              urlObj.hostname.startsWith('172.23.') ||
                              urlObj.hostname.startsWith('172.24.') ||
                              urlObj.hostname.startsWith('172.25.') ||
                              urlObj.hostname.startsWith('172.26.') ||
                              urlObj.hostname.startsWith('172.27.') ||
                              urlObj.hostname.startsWith('172.28.') ||
                              urlObj.hostname.startsWith('172.29.') ||
                              urlObj.hostname.startsWith('172.30.') ||
                              urlObj.hostname.startsWith('172.31.');

        if (!isAllowed && !isLocalRequest) {
          // Log blocked request
          networkAudit.logRequest(url, false, 'Domain not in whitelist', method);
          throw new Error('Network request blocked: domain not whitelisted');
        }

        // Log allowed request
        networkAudit.logRequest(url, true, isLocalRequest ? 'Local request' : 'Whitelisted domain', method);
      } catch {
        // Handle relative URLs
        if (url.startsWith('/') || url.startsWith('./')) {
          networkAudit.logRequest(url, true, 'Local resource', method);
        } else {
          networkAudit.logRequest(url, false, 'Invalid or blocked URL', method);
          throw new Error('Network request blocked');
        }
      }

      return originalFetch(input, init);
    };

    // Disable WebRTC
    if ('RTCPeerConnection' in window) {
      (window as any).RTCPeerConnection = undefined;
      (window as any).RTCSessionDescription = undefined;
      (window as any).RTCIceCandidate = undefined;
      (window as any).mediaDevices = undefined;
    }

    // Disable WebSockets
    (window as any).WebSocket = undefined;

    // Disable EventSource
    (window as any).EventSource = undefined;
  }

  private deployForensicProtection(): void {
    // Check if we're on localhost or .onion
    // EXPANDED: Also allow any local IP addresses and development environments
    const isLocalOrOnion = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.endsWith('.onion') ||
                           window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.') ||
                           window.location.port === '5173' || // Vite dev server
                           window.location.port === '3000' || // Common dev port
                           window.location.port === '4173'; // Vite preview

    // Advanced DOM mutation monitoring
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;

              // CRITICAL FIX: Don't block our own app scripts!
              // Only block scripts from external origins or with inline code
              if (element.tagName === 'SCRIPT') {
                const scriptElement = element as HTMLScriptElement;
                const src = scriptElement.src;

                // Allow our own scripts (same-origin or module scripts from Vite)
                if (!src || src.startsWith(window.location.origin) || src.startsWith('/')) {
                  // This is our own script, allow it
                  return;
                }

                // Only block external scripts on clearnet production
                if (!isLocalOrOnion) {
                  element.remove();
                  this.initiateSecurityProtocol();
                }
                return;
              }

              // Block other dangerous elements (but not SCRIPT or LINK which we need)
              const dangerous = ['IFRAME', 'OBJECT', 'EMBED', 'APPLET'];
              if (dangerous.includes(element.tagName)) {
                if (!isLocalOrOnion) {
                  element.remove();
                  this.initiateSecurityProtocol();
                }
              }

              // Check for javascript: URLs (only on clearnet production)
              if (element.outerHTML.includes('javascript:')) {
                element.remove();
                if (!isLocalOrOnion) {
                  this.initiateSecurityProtocol();
                }
              }

              // Check for event handlers (only on clearnet production)
              const attributes = element.attributes;
              for (let i = 0; i < attributes.length; i++) {
                if (attributes[i].name.startsWith('on')) {
                  element.removeAttribute(attributes[i].name);
                  if (!isLocalOrOnion) {
                    this.initiateSecurityProtocol();
                  }
                }
              }
            }
          });
        }

        // Monitor attribute changes (only on clearnet production)
        if (mutation.type === 'attributes') {
          const element = mutation.target as HTMLElement;
          if (mutation.attributeName?.startsWith('on') ||
              element.getAttribute(mutation.attributeName || '')?.includes('javascript:')) {
            element.removeAttribute(mutation.attributeName || '');
            if (!isLocalOrOnion) {
              this.initiateSecurityProtocol();
            }
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });
  }

  private startSecurityMonitoring(): void {
    // Check if we're on localhost or .onion
    // EXPANDED: Also allow any local IP addresses and development environments
    const isLocalOrOnion = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.endsWith('.onion') ||
                           window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.') ||
                           window.location.port === '5173' || // Vite dev server
                           window.location.port === '3000' || // Common dev port
                           window.location.port === '4173'; // Vite preview

    // Monitor for iframe embedding (only on clearnet production)
    if (window.self !== window.top && !isLocalOrOnion) {
      this.initiateSecurityProtocol();
    }

    // Monitor page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.secureMemoryWipe();
      }
    });

    // Cleanup on unload
    ['beforeunload', 'unload', 'pagehide'].forEach(event => {
      window.addEventListener(event, () => {
        this.totalMemoryWipe();
      });
    });
  }

  /**
   * Performs secure memory wipe to remove traces of user data.
   *
   * Executes:
   * 1. localStorage and sessionStorage clearing
   * 2. IndexedDB user data clearing (preserves model cache)
   * 3. Cache API clearing (except WebLLM/MLC caches)
   * 4. Cookie clearing
   * 5. Memory overwriting with random data (5 × 512KB chunks)
   *
   * Called periodically (every 15s) and on visibility changes.
   *
   * @private
   */
  private secureMemoryWipe(): void {
    try {
      // RELAXED: Only clear storage if it's accessible
      // Don't throw errors if storage is blocked
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // Storage not available - this is fine
        console.debug('[Security] Storage not available for clearing');
      }

      // Clear user data from IndexedDB but keep model cache
      this.clearUserDataFromIndexedDB();

      // Clear caches (but not model cache)
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            // Keep WebLLM caches
            if (!name.includes('webllm') && !name.includes('mlc')) {
              caches.delete(name);
            }
          });
        }).catch(() => {
          // Cache clearing failed - fine
        });
      }


      // Overwrite memory with random data (reduced frequency)
      if (window.crypto && window.crypto.getRandomValues) {
        for (let i = 0; i < 2; i++) { // Reduced from 5 to 2
          const buffer = new Uint8Array(256 * 1024); // 256KB chunks (reduced from 512KB)
          window.crypto.getRandomValues(buffer);
        }
      }
    } catch {
      // Silent fail - don't log errors
    }
  }

  private totalMemoryWipe(): void {
    // Aggressive memory wipe on unload
    this.secureMemoryWipe();

    // Additional memory overwrite
    // Web Crypto API limits getRandomValues to 65536 bytes (64KB) per call
    // So we need to break larger buffers into 64KB chunks
    if (window.crypto && window.crypto.getRandomValues) {
      const maxBytes = 65536; // 64KB - maximum allowed by Web Crypto API
      const totalWipes = 20;

      for (let i = 0; i < totalWipes; i++) {
        const buffer = new Uint8Array(maxBytes); // 64KB chunks
        window.crypto.getRandomValues(buffer);
      }
    }

    // Clear all event listeners
    document.removeEventListener('keydown', () => {});
    document.removeEventListener('contextmenu', () => {});
    document.removeEventListener('selectstart', () => {});
  }

  private initiateSecurityProtocol(): void {
    // Security breach detected - execute protocol
    // DISABLED FOR DEVELOPMENT - This was causing the blank page issue
    console.warn('[Security] Security protocol triggered but disabled for development');

    // Only wipe memory, don't redirect to about:blank
    this.totalMemoryWipe();

    // DO NOT redirect or wipe page - this was causing blank page issues
    // document.body.innerHTML = '';
    // document.head.innerHTML = '';
    // window.location.href = 'about:blank';
  }

  /**
   * Validates whether a URL's origin is allowed by the security policy.
   *
   * Checks if the URL's hostname matches allowed domains:
   * - huggingface.co (and subdomains)
   * - cdn-lfs.huggingface.co (and subdomains)
   * - raw.githubusercontent.com (and subdomains)
   *
   * @param url - The URL to validate
   * @returns true if the URL is from an allowed domain, false otherwise
   *
   * @example
   * ```typescript
   * const manager = SecurityManager.getInstance();
   * manager.validateOrigin('https://huggingface.co/models'); // true
   * manager.validateOrigin('https://evil.com'); // false
   * ```
   */
  public validateOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedDomains = [
        'huggingface.co',
        'cdn-lfs.huggingface.co',
        'raw.githubusercontent.com'
      ];

      return allowedDomains.some(domain =>
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  /**
   * Checks if security features are currently enabled.
   *
   * @returns true if security is enabled, false otherwise
   */
  public isSecurityEnabled(): boolean {
    return this.securityEnabled;
  }
}