# OBLIVAI - 100% Private AI Chat

> **Note:** For the best experience, use a desktop browser. Mobile support is limited due to GPU memory constraints.

True AI privacy with no servers, no tracking, and no compromise. Chat with powerful AI models running entirely in your browser.
## Why OBLIVAI?

Every conversation you have with OBLIVAI stays on your device. No data collection, no cloud servers, no privacy concerns.

- **Zero Server Communication**: AI runs in your browser using WebLLM/WebGPU
- **No Data Storage**: Optional auto-delete clears chats on session end
- **No Tracking**: No analytics, cookies, or telemetry
- **No Account Required**: Just open and start chatting
- **Works Offline**: After initial model download (PWA installable)
- **Open Source**: Audit our privacy claims yourself

## Features

### Privacy & Security

- **Multi-layer Content Security Policy (CSP)** blocks unauthorized network requests
- **IndexedDB Whitelisting** allows only AI model caching, never user data
- **Smart Clipboard Management** allows copying responses while maintaining security
- **Network Audit Logging** (local-only) for complete transparency
- **DOMPurify Sanitization** prevents XSS attacks
- **Runtime Security Monitoring** continuously enforces privacy
- **Service Worker** caches only static assets, never user data

### AI Capabilities

- **35+ AI Models** organized in 6 categories (350MB to 5.5GB)
- **Custom System Instructions** to personalize assistant behavior
- **Hardware Detection** automatically recommends optimal models
- **WebGPU/WebGL/WASM Fallbacks** for maximum device compatibility
- **Streaming Responses** with real-time token generation
- **Chat Export** to Markdown format
- **Dark/Light Mode** (defaults to dark, toggle in header)

### Accessibility

- **Keyboard Shortcuts** (Enter to send, Ctrl+Enter alternative, Escape to stop)
- **ARIA Live Regions** for screen reader support
- **High Contrast Mode** support
- **Reduced Motion** support for users with vestibular disorders
- **Focus Management** for keyboard navigation
- **Responsive Design** works on mobile, tablet, and desktop


### Model Categories

| Category | Size | Description |
|----------|------|-------------|
| **Tiny** | 350MB-1GB | Ultra-fast, works on all devices |
| **Small** | 1-2GB | Fast responses, most devices |
| **Medium** | 2-3GB | High quality, good devices |
| **Large** | 4-5GB | Very capable, powerful devices |
| **XL** | 5-6GB | Extremely capable, high-end devices |
| **Coding** | 400MB-5GB | Specialized for software development |

## Browser Compatibility

### Recommended (Full WebGPU Support)
- Chrome/Edge 113+
- Safari 17+ (iOS/macOS)
- Firefox 121+

### Fallback Support (WebGL/WASM)
- Older Chrome/Edge versions (WebGL fallback)
- Firefox without WebGPU (WASM fallback)
- Safari 16 and below (limited support)

### JavaScript Requirement

**JavaScript is required for OBLIVAI to function.** The application uses WebLLM, WebGPU, and WebAssembly to run AI models in your browser - these technologies require JavaScript.

**No-JS Fallback:**
If you visit OBLIVAI with JavaScript disabled, you'll see a comprehensive informational page that includes:
- Full explanation of OBLIVAI's features and privacy guarantees
- Complete list of all 35+ AI models with descriptions
- System requirements and browser compatibility information
- Instructions for enabling JavaScript in your browser
- Links to source code and documentation

The no-JS fallback page is fully readable and navigable with pure HTML/CSS (no JavaScript required). However, to actually use the AI chat functionality, you must enable JavaScript, as AI inference in the browser fundamentally requires JavaScript to operate.

## System Requirements

### Minimum
- 2GB RAM (for tiny models)
- Modern browser with WebAssembly support
- JavaScript enabled
- 1GB free disk space (for model cache)

### Recommended
- 8GB+ RAM
- WebGPU-capable GPU
- 10GB free disk space (for multiple models)
- Stable internet connection (for initial model download)

## Getting Started

### Quick Start

1. Visit the hosted site or run locally:
```bash
git clone https://github.com/eligorelick/Obliv_source.git
cd Obliv_source
npm install
npm run dev
```

2. Click "Start Chat" on the landing page
3. Select an AI model based on your device capabilities
4. Wait for model download (one-time, cached for offline use)
5. Start chatting with complete privacy

### Installing as PWA

On supported browsers, you can install OBLIVAI as a standalone app:

**Desktop:**
1. Click the install icon in the address bar
2. Click "Install" in the popup

**Mobile:**
1. Tap the share button
2. Select "Add to Home Screen"

## Configuration

### System Instructions

Customize the AI's behavior through the Settings panel (gear icon):

1. Click the Settings icon in the chat header
2. Enter custom instructions (e.g., "Be concise and technical")
3. Click "Save Instructions"
4. Instructions apply to all new messages

**Example Instructions:**
- "Answer all questions in a casual, friendly tone"
- "Always provide step-by-step explanations for technical topics"
- "When asked about code, always include examples"

### Auto-Delete Chats

Enable in Settings to automatically clear chat history when closing the browser tab.

## Privacy Architecture

### What Gets Stored

**Allowed (IndexedDB Whitelist):**
- AI model files (webllm, webllm-cache, mlc-wasm-cache, tvmjs)
- Static assets (service worker cache)

**Never Stored:**
- Chat conversations (memory-only, unless you disable auto-delete)
- User preferences (reset on page reload when auto-delete enabled)
- Analytics or tracking data
- Telemetry

### Network Requests

**Allowed:**
- HuggingFace CDN (model downloads only, one-time)
- Static assets from your domain

**Blocked:**
- All external analytics domains
- Third-party scripts
- Cross-origin requests (except HuggingFace CDN)

### Security Monitoring

The app includes a local-only network audit log accessible via browser console:
```javascript
NetworkAuditLog.getLog() // View all network requests
```

## Troubleshooting

### Model Won't Load

**GPU/WebGPU Error:**
- Update browser to latest version
- Enable hardware acceleration in browser settings
- Try Chrome, Edge, or Safari (latest versions)
- Try a smaller model (Qwen2 0.5B or Llama 3.2 1B)

**Out of Memory Error:**
- Close other browser tabs and applications
- Select a smaller model
- Restart your browser
- Clear browser cache

**Network/Download Error:**
- Check your internet connection
- Try again in a few moments
- Check if firewall is blocking HuggingFace
- Disable VPN temporarily

**Model Loading Timeout:**
- Large models can take 5-10 minutes to download
- Check your internet speed
- Try a smaller model
- Try again with a better connection

### Chat Not Responding

- Check browser console for errors
- Try refreshing the page
- Re-select the model
- Clear browser cache and reload

## Development

### Prerequisites

- Node.js 18+ and npm
- Modern browser with WebGPU support (for testing)

### Setup

```bash
# Clone repository
git clone https://github.com/eligorelick/Obliv_source.git
cd Obliv_source

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/         # React UI components
│   ├── ChatHeader.tsx     # Header with settings
│   ├── ChatInterface.tsx  # Main chat UI
│   ├── InputArea.tsx      # Message input
│   ├── LandingPage.tsx    # Welcome screen
│   ├── MessageList.tsx    # Chat history
│   └── ModelSelector.tsx  # Model selection UI
├── lib/               # Core library code
│   ├── hardware-detect.ts    # Device capability detection
│   ├── model-config.ts       # Model definitions
│   ├── network-audit.ts      # Network transparency logging
│   ├── security.ts           # Security patterns & sanitization
│   ├── security-init.ts      # Security initialization
│   ├── sw-register.ts        # Service worker registration
│   └── webllm-service.ts     # WebLLM wrapper service
├── store/             # Zustand state management
│   └── chat-store.ts         # Chat state
└── App.tsx            # Main app component

public/
├── sw.js              # Service worker (offline support)
├── manifest.json      # PWA manifest
├── set-theme.js       # Theme initialization (dark mode default)
├── browser-check.js   # Browser compatibility detection
├── _headers           # Netlify headers fallback
└── _redirects         # SPA routing fallback
```

### Tech Stack

- **React 19** + **TypeScript** for UI
- **WebLLM** for browser-based AI inference
- **Vite** for blazing-fast builds
- **Tailwind CSS** for styling
- **Zustand** for state management
- **DOMPurify** for XSS prevention
- **Lucide React** for icons

## Contributing

We welcome contributions! Here are some areas where you can help:

- Additional model support
- Improved mobile UI/UX
- Accessibility enhancements
- Documentation improvements
- Bug fixes and testing
- Translation/internationalization

To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

OBLIVAI is optimized for static hosting. Deploy to:

- **Netlify** (recommended, includes Edge Functions support)
- **Vercel**
- **Cloudflare Pages**
- **GitHub Pages**
- Any static host with HTTPS

### Required Headers (netlify.toml included)

```toml
# WASM streaming
[[headers]]
  for = "/*.wasm"
  [headers.values]
    Content-Type = "application/wasm"

# Service Worker
[[headers]]
  for = "/sw.js"
  [headers.values]
    Service-Worker-Allowed = "/"
```

### Tor Hidden Service (.onion) Deployment

OBLIVAI is fully compatible with Tor hidden services for maximum privacy and anonymity.

**Prerequisites:**
- Tor installed and configured
- Web server (nginx, Apache, or similar)
- Built OBLIVAI static files (`npm run build`)

**Setup Steps:**

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Configure Tor hidden service** (`/etc/tor/torrc`):
   ```
   HiddenServiceDir /var/lib/tor/oblivai/
   HiddenServicePort 80 127.0.0.1:8080
   ```

3. **Configure web server** (nginx example):
   ```nginx
   server {
       listen 127.0.0.1:8080;
       server_name localhost;
       root /path/to/Obliv_source/dist;
       index index.html;

       # Security headers (same as netlify.toml)
       add_header X-Frame-Options "DENY";
       add_header X-Content-Type-Options "nosniff";
       add_header X-XSS-Protection "1; mode=block";
       add_header Referrer-Policy "no-referrer";

       # CSP header (Tor-compatible, no HTTPS enforcement)
       add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'self' https://huggingface.co https://cdn-lfs.huggingface.co https://*.huggingface.co; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; form-action 'none'; object-src 'none';";

       # WASM MIME type
       location ~* \.wasm$ {
           add_header Content-Type application/wasm;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       # SPA fallback
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Restart Tor and get your .onion address:**
   ```bash
   sudo systemctl restart tor
   sudo cat /var/lib/tor/oblivai/hostname
   ```

5. **Access your site:**
   - Visit your `.onion` address in Tor Browser
   - Models will still download from HuggingFace over Tor (slower but private)
   - All inference happens locally in the browser

**Important Notes:**
- Model downloads over Tor will be slower (HuggingFace CDN via Tor exit nodes)
- Users should download models once, then use offline (cached in browser)
- All privacy guarantees remain: no user data leaves the device

**Security Considerations:**
- Use Tor v3 hidden services (.onion addresses are 56 characters)
- Keep Tor and web server updated
- Monitor web server logs for attacks
- Consider DDoS protection (Tor has built-in rate limiting)
- Do NOT modify CSP to allow external analytics or tracking


## Acknowledgments

- **WebLLM** by MLC AI for browser-based inference
- **HuggingFace** for model hosting
- **Meta, Google, Mistral AI, and others** for open-source models
- **React** and **Vite** teams for excellent development tools

## Support

- **Issues**: [GitHub Issues](https://github.com/eligorelick/Obliv_source/issues)
- **Discussions**: [GitHub Discussions](https://github.com/eligorelick/Obliv_source/discussions)

## Roadmap

- [ ] Voice input/output support
- [ ] Chat history search
- [ ] Multiple chat sessions
- [ ] Model fine-tuning interface
- [ ] Plugins/extensions system
- [ ] Multi-language support

---

**Built with privacy in mind. Your conversations stay yours.**
