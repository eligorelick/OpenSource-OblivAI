import DOMPurify from 'dompurify';

// ============================================================
// PROTOTYPE POLLUTION PROTECTION
// Note: We use defensive coding patterns instead of freezing prototypes
// because freezing breaks many legitimate libraries (WebLLM, etc.)
// Protection is provided through:
// 1. safeJsonParse() - blocks __proto__, constructor, prototype keys
// 2. Input sanitization - blocks malicious payloads
// 3. CSP headers - prevents script injection
// ============================================================

// ============================================================
// DOM CLOBBERING PROTECTION
// Validate element IDs to prevent DOM clobbering attacks
// ============================================================
export const isDOMClobbered = (name: string): boolean => {
  // Check if a global property exists that could clobber DOM access
  const dangerousGlobals = [
    'document', 'window', 'location', 'navigator', 'history',
    'localStorage', 'sessionStorage', 'indexedDB', 'fetch',
    'XMLHttpRequest', 'WebSocket', 'EventSource', 'Worker',
    'crypto', 'performance', 'console', 'alert', 'confirm', 'prompt'
  ];
  return dangerousGlobals.includes(name);
};

// Maximum security input sanitization with comprehensive attack prevention
export const sanitizeInput = (input: string): string => {
  // Input length validation - prevent DoS attacks
  if (input.length > 10000) {
    throw new Error('Input too long');
  }

  // Remove any HTML/script tags with strictest settings
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'applet', 'iframe', 'form', 'input', 'textarea', 'button', 'select', 'option'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  });

  // Note: Prompt injection patterns removed - not needed for local-only models
  // The model runs entirely in-browser with no backend/API access to exploit
  // Users can freely discuss AI prompting, system instructions, etc.

  // SQL injection patterns (kept for XSS defense-in-depth, though no SQL backend)
  const sqlPatterns = [
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /update\s+set/gi,
    /create\s+table/gi,
    /alter\s+table/gi,
    /exec\s*\(/gi,
    /xp_cmdshell/gi,
    /sp_executesql/gi
  ];

  // XSS patterns (comprehensive protection against modern bypass techniques)
  const xssPatterns = [
    // Script tags and variants
    /<script\b/gi,
    /<\/script>/gi,
    /<script/gi,
    // Dangerous protocols
    /javascript:/gi,
    /vbscript:/gi,
    /livescript:/gi,
    /mocha:/gi,
    /data:text\/html/gi,
    /data:application\/javascript/gi,
    // Event handlers (comprehensive list)
    /on\w+\s*=/gi,  // Catches all event handlers
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onchange\s*=/gi,
    /onsubmit\s*=/gi,
    /onanimationend\s*=/gi,
    /onbeforeunload\s*=/gi,
    /onhashchange\s*=/gi,
    /onpopstate\s*=/gi,
    /ontransitionend\s*=/gi,
    // CSS expressions and imports
    /expression\s*\(/gi,
    /url\s*\(\s*javascript:/gi,
    /@import/gi,
    // SVG and XML attacks
    /<svg\b/gi,
    /<math\b/gi,
    /<xml\b/gi,
    /xlink:href/gi,
    // Template injection
    /\{\{.*\}\}/gi,
    /\$\{.*\}/gi,
    // Encoding bypass attempts
    /&#x?[0-9a-f]+;?/gi,  // HTML entities
    /%[0-9a-f]{2}/gi,      // URL encoding
    /\\u[0-9a-f]{4}/gi,    // Unicode escapes
    /\\x[0-9a-f]{2}/gi,    // Hex escapes
    // Dangerous HTML elements
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<applet/gi,
    /<form/gi,
    /<base/gi,
    /<link/gi,
    /<meta/gi,
    /<style/gi
  ];

  let sanitized = cleaned;

  // Apply XSS security patterns (SQL patterns kept for defense-in-depth)
  [...sqlPatterns, ...xssPatterns].forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[SECURITY_BLOCKED]');
  });

  // Remove null bytes and control characters (security feature - intentional control char regex)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s{10,}/g, ' ').trim();

  return sanitized;
};

// Maximum content length for markdown rendering (prevents DoS)
const MAX_MARKDOWN_LENGTH = 50000;

// Sanitize markdown output from models
export const sanitizeMarkdown = (content: string): string => {
  // Limit content length to prevent DoS
  const truncatedContent = content.length > MAX_MARKDOWN_LENGTH
    ? content.slice(0, MAX_MARKDOWN_LENGTH) + '\n\n[Content truncated for security]'
    : content;

  // Be conservative about allowed HTML in model outputs
  return DOMPurify.sanitize(truncatedContent, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'ol', 'ul', 'li', 'a'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['img', 'script', 'iframe', 'object', 'embed', 'style', 'link', 'meta'],
    // Additional security: sanitize URLs in href attributes
    ADD_URI_SAFE_ATTR: ['href'],
    // Prevent javascript: URLs
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i
  });
};

// Safe markdown to HTML conversion with ReDoS protection
export const safeMarkdownToHtml = (content: string): string => {
  // Limit content length first
  if (content.length > MAX_MARKDOWN_LENGTH) {
    content = content.slice(0, MAX_MARKDOWN_LENGTH) + '\n\n[Content truncated]';
  }

  // First sanitize the raw content
  let html = sanitizeMarkdown(content);

  // Apply safe markdown conversions with length-limited regex
  // Code blocks (limit repetition to prevent ReDoS)
  html = html.replace(/```([^`]{0,10000}?)```/g, '<pre class="bg-gray-800 rounded p-3 my-2 overflow-x-auto"><code>$1</code></pre>');

  // Inline code (limit length)
  html = html.replace(/`([^`]{1,500})`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>');

  // Bold (non-greedy with length limit)
  html = html.replace(/\*\*([^*]{1,1000})\*\*/g, '<strong>$1</strong>');

  // Italic (non-greedy with length limit, avoid matching bold)
  html = html.replace(/(?<!\*)\*([^*]{1,1000})\*(?!\*)/g, '<em>$1</em>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  // Final sanitization pass
  return sanitizeMarkdown(html);
};

// Rate limiting for input
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  getRemainingTime(): number {
    if (this.timestamps.length === 0) return 0;
    const oldest = Math.min(...this.timestamps);
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }
}

// Validate URL is safe to open (no javascript:, data:, etc.)
export const isValidExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Only allow http, https, and mailto protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    return allowedProtocols.includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Open external links safely by forcing rel attributes and target
export const openExternal = (url: string): boolean => {
  // Validate URL before opening
  if (!isValidExternalUrl(url)) {
    console.warn('[Security] Blocked attempt to open invalid URL:', url);
    return false;
  }

  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer nofollow';
    // Append and click to ensure it's treated as a user gesture
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    // Primary method failed, try fallback
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    } catch {
      return false;
    }
  }
};

// ============================================================
// ADDITIONAL SECURITY UTILITIES
// ============================================================

// Constant-time string comparison to prevent timing attacks
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

// Generate cryptographically secure random string
export const generateSecureId = (length = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Sanitize JSON to prevent prototype pollution during parsing
export const safeJsonParse = <T>(json: string): T | null => {
  try {
    const parsed = JSON.parse(json);
    // Check for prototype pollution attempts
    if (typeof parsed === 'object' && parsed !== null) {
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        console.warn('[Security] Blocked prototype pollution attempt in JSON');
        return null;
      }
    }
    return parsed as T;
  } catch {
    return null;
  }
};

// Validate and sanitize file names to prevent path traversal
export const sanitizeFileName = (filename: string): string => {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  // Remove directory separators
  sanitized = sanitized.replace(/[/\\]/g, '');
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  // Remove control characters
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  // Limit length
  return sanitized.slice(0, 255);
};

// Check if running in a secure context (HTTPS or localhost)
export const isSecureContext = (): boolean => {
  return window.isSecureContext === true;
};

// Note: eval blocking removed as it interferes with WebLLM/WASM operations
// Security is maintained through CSP headers which block inline scripts
// and only allow 'wasm-unsafe-eval' for WebLLM functionality