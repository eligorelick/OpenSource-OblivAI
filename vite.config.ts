import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm']
  },
  build: {
    // Target browsers that support WebGPU/WebGL + WebAssembly + SharedArrayBuffer
    // This ensures compatibility with browsers that can run WebLLM
    target: ['es2020', 'chrome89', 'firefox89', 'safari15', 'edge89'],
    minify: 'terser',
    sourcemap: false,
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.debug', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'webllm': ['@mlc-ai/web-llm'],
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
          'security': ['dompurify']
        }
      }
    },
    chunkSizeWarningLimit: 2000
  },
  server: {
    headers: {
      // credentialless allows cross-origin resources without explicit CORS
      // This is more compatible than require-corp while still enabling SharedArrayBuffer
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      // Development CSP - allows inline scripts for Vite HMR
      // Production uses stricter CSP via _headers/index.html
      'Content-Security-Policy': "default-src 'self'; " +
        "base-uri 'self'; " +
        "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; " +
        "worker-src 'self' blob:; " +
        "connect-src 'self' ws://localhost:* http://localhost:* https://huggingface.co https://cdn-lfs.huggingface.co https://*.huggingface.co https://*.xethub.hf.co https://raw.githubusercontent.com https://*.githubusercontent.com; " +
        "img-src 'self' data: blob:; " +
        "style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data:; " +
        "form-action 'none'; " +
        "object-src 'none'; " +
        "media-src 'self'; " +
        "manifest-src 'self'; " +
        "frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
      'Cache-Control': 'no-cache, no-store, must-revalidate, private, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
})