/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: 'any' types are necessary for browser API access (WebGPU, navigator extensions)

// Development-only logging
const log = {
  info: (...args: any[]) => import.meta.env.DEV && console.log(...args),
  warn: (...args: any[]) => import.meta.env.DEV && console.warn(...args),
  error: (...args: any[]) => console.error(...args) // Always log errors
};

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'unknown';
  isTouchDevice: boolean;
  screenSize: 'small' | 'medium' | 'large';
}

export interface HardwareInfo {
  memory: number; // System RAM in GB
  cores: number; // CPU cores
  hasWebGPU: boolean;
  backend: 'webgpu' | 'webgl' | 'wasm';
  gpuInfo?: {
    name: string;
    vram?: number; // VRAM in GB
    isHighPerformance: boolean;
  };
  cpuInfo?: {
    name?: string;
    architecture?: string;
  };
  recommendedModel: 'tiny' | 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  deviceType: 'mobile' | 'desktop' | 'unknown';
  deviceInfo: DeviceInfo;
}

// Helper function to get more accurate system memory
function getSystemMemory(): number {
  // Try to get device memory from navigator
  let detectedMemory = 4; // Default fallback

  if ('deviceMemory' in navigator) {
    detectedMemory = (navigator as any).deviceMemory || 4;
  }

  // Enhanced heuristics based on other system indicators
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isDesktop = !isMobile;

  // If we have high core count, likely more RAM than reported
  if (isDesktop && cores >= 8) {
    // Modern desktop with 8+ cores likely has 16-32GB+ RAM
    detectedMemory = Math.max(detectedMemory, 16);

    // High-end desktop indicators
    if (cores >= 12) {
      detectedMemory = Math.max(detectedMemory, 32);
    }
  } else if (isDesktop && cores >= 6) {
    // Mid-range desktop with 6+ cores likely has 8-16GB RAM
    detectedMemory = Math.max(detectedMemory, 12);
  }

  // Check for high-performance indicators
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('windows nt') && cores >= 8) {
    // Windows desktop with many cores
    detectedMemory = Math.max(detectedMemory, 16);
  }

  return detectedMemory;
}

// Helper function to detect device type (legacy, kept for compatibility)
function detectDeviceType(): 'mobile' | 'desktop' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

// Enhanced device detection with OS, browser, and screen size
export function detectDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      os: 'unknown',
      browser: 'unknown',
      isTouchDevice: false,
      screenSize: 'large'
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';

  // Detect OS
  let os: DeviceInfo['os'] = 'unknown';
  if (/iphone|ipad|ipod/.test(ua)) {
    os = 'ios';
  } else if (/android/.test(ua)) {
    os = 'android';
  } else if (/win/.test(platform) || /windows/.test(ua)) {
    os = 'windows';
  } else if (/mac/.test(platform) || /macintosh/.test(ua)) {
    os = 'macos';
  } else if (/linux/.test(platform) || /linux/.test(ua)) {
    os = 'linux';
  }

  // Detect device type (mobile, tablet, desktop)
  let type: DeviceInfo['type'] = 'desktop';
  if (/iphone|ipod|android.*mobile/i.test(ua)) {
    type = 'mobile';
  } else if (/ipad|android(?!.*mobile)/i.test(ua)) {
    type = 'tablet';
  }

  // Detect browser
  let browser: DeviceInfo['browser'] = 'unknown';
  if (/safari/i.test(ua) && !/chrome/i.test(ua) && !/chromium/i.test(ua)) {
    browser = 'safari';
  } else if (/chrome|chromium/i.test(ua) && !/edg/i.test(ua)) {
    browser = 'chrome';
  } else if (/firefox/i.test(ua)) {
    browser = 'firefox';
  } else if (/edg/i.test(ua)) {
    browser = 'edge';
  }

  // Touch detection
  const isTouchDevice = 'ontouchstart' in window ||
                        navigator.maxTouchPoints > 0 ||
                        (navigator as any).msMaxTouchPoints > 0;

  // Screen size detection
  const width = window.innerWidth;
  let screenSize: DeviceInfo['screenSize'] = 'large';
  if (width < 640) {
    screenSize = 'small';  // Mobile
  } else if (width < 1024) {
    screenSize = 'medium'; // Tablet/small laptop
  } else {
    screenSize = 'large';  // Desktop
  }

  return { type, os, browser, isTouchDevice, screenSize };
}

// Detect best available backend for AI inference
async function detectBackend(): Promise<'webgpu' | 'webgl' | 'wasm'> {
  // Special handling for iOS - WebGPU is experimental
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  log.info('[Hardware] Detecting backend...', { isIOS, isMobile });

  // 1. Try WebGPU (best performance, newest)
  // Note: iOS 17+ supports WebGPU but it may be experimental
  if ('gpu' in navigator && !isIOS) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) {
        log.info('[Hardware] WebGPU available');
        return 'webgpu';
      }
    } catch (e) {
      log.info('[Hardware] WebGPU not available:', e);
    }
  } else if (isIOS) {
    log.info('[Hardware] Skipping WebGPU detection on iOS (not supported)');
  }

  // 2. Try WebGL (good performance, wider compatibility)
  // This is the most reliable option for iOS devices
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') ||
               canvas.getContext('experimental-webgl');
    if (gl) {
      const version = gl instanceof WebGL2RenderingContext ? 'WebGL2' : 'WebGL';
      log.info(`[Hardware] ${version} available - using GPU acceleration`);
      return 'webgl';
    } else {
      log.info('[Hardware] WebGL context creation returned null');
    }
  } catch (e) {
    log.info('[Hardware] WebGL not available:', e);
  }

  // 3. Fallback to WASM CPU (slowest, but most compatible)
  log.warn('[Hardware] No GPU backend available, falling back to WASM (CPU-only). Performance will be limited.');
  return 'wasm';
}

export async function detectHardware(): Promise<HardwareInfo> {
  let memory = 4; // Safe default
  let hardwareConcurrency = 4; // Safe default
  let deviceType: 'mobile' | 'desktop' | 'unknown' = 'unknown';
  let deviceInfo: DeviceInfo;
  let backend: 'webgpu' | 'webgl' | 'wasm' = 'wasm'; // Safe default

  try {
    memory = getSystemMemory();
    hardwareConcurrency = navigator.hardwareConcurrency || 4;
    deviceType = detectDeviceType();
    deviceInfo = detectDeviceInfo();

    // Detect best available backend (may fail on some devices)
    try {
      backend = await detectBackend();
    } catch {
      // Fallback to WASM if backend detection fails
      backend = 'wasm';
    }
  } catch {
    // If hardware detection fails, use safe defaults
    deviceInfo = {
      type: 'desktop',
      os: 'unknown',
      browser: 'unknown',
      isTouchDevice: false,
      screenSize: 'large'
    };
  }

  // Default values
  const result: HardwareInfo = {
    memory,
    cores: hardwareConcurrency,
    hasWebGPU: backend === 'webgpu',
    backend,
    recommendedModel: 'medium',
    deviceType,
    deviceInfo
  };

  // Try to detect WebGPU and GPU information
  try {
    if ('gpu' in navigator) {
      const gpu = (navigator as any).gpu;
      if (gpu) {
        try {
          const adapter = await gpu.requestAdapter();
          if (adapter) {
            result.hasWebGPU = true;
            
            // Get GPU info
            const adapterInfo = await adapter.requestAdapterInfo?.();
            let gpuName = adapterInfo?.description || 'Unknown GPU';
            let vramEstimate = 4; // Default VRAM estimate
            let isHighPerformance = false;

            // Enhanced GPU detection using renderer info
            try {
              const canvas = document.createElement('canvas');
              const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
              if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                  if (renderer && typeof renderer === 'string') {
                    gpuName = renderer;

                    // Better GPU detection based on actual names
                    const gpuLower = renderer.toLowerCase();

                    // NVIDIA RTX detection
                    if (gpuLower.includes('rtx') || gpuLower.includes('geforce rtx')) {
                      isHighPerformance = true;
                      if (gpuLower.includes('3090')) {
                        vramEstimate = 24; // RTX 3090 has 24GB
                      } else if (gpuLower.includes('3080')) {
                        vramEstimate = 10; // RTX 3080 has 10GB
                      } else if (gpuLower.includes('3070')) {
                        vramEstimate = 8;
                      } else if (gpuLower.includes('3060')) {
                        vramEstimate = 12;
                      } else if (gpuLower.includes('4080') || gpuLower.includes('4090')) {
                        vramEstimate = 16;
                      } else if (gpuLower.includes('4070')) {
                        vramEstimate = 12;
                      } else {
                        vramEstimate = 8; // Other RTX cards
                      }
                    }
                    // NVIDIA GTX detection
                    else if (gpuLower.includes('gtx') || gpuLower.includes('geforce gtx')) {
                      isHighPerformance = true;
                      if (gpuLower.includes('1080') || gpuLower.includes('1070')) {
                        vramEstimate = 8;
                      } else if (gpuLower.includes('1060')) {
                        vramEstimate = 6;
                      } else {
                        vramEstimate = 4;
                      }
                    }
                    // AMD detection
                    else if (gpuLower.includes('radeon') || gpuLower.includes('amd')) {
                      isHighPerformance = true;
                      if (gpuLower.includes('rx 6800') || gpuLower.includes('rx 6900')) {
                        vramEstimate = 16;
                      } else if (gpuLower.includes('rx 6700') || gpuLower.includes('rx 7700')) {
                        vramEstimate = 12;
                      } else {
                        vramEstimate = 8;
                      }
                    }
                    // Intel Arc detection
                    else if (gpuLower.includes('arc') || gpuLower.includes('intel')) {
                      if (gpuLower.includes('a770')) {
                        isHighPerformance = true;
                        vramEstimate = 16;
                      } else if (gpuLower.includes('a750')) {
                        isHighPerformance = true;
                        vramEstimate = 8;
                      }
                    }
                  }
                }
              }
            } catch {
              // Error getting detailed GPU info
            }

            // Fallback to adapter limits if we couldn't get specific GPU info
            if (adapter.limits && !isHighPerformance) {
              const maxTextureSize = adapter.limits.maxTextureDimension2D;
              const maxBufferSize = adapter.limits.maxBufferSize;

              // High-end GPU indicators
              if (maxTextureSize >= 16384 && maxBufferSize >= 2**30) {
                isHighPerformance = true;
                vramEstimate = Math.max(vramEstimate, 8);
              }
            }

            result.gpuInfo = {
              name: gpuName,
              vram: vramEstimate,
              isHighPerformance: isHighPerformance
            };
          }
        } catch {
          // Error getting GPU info
        }
      }
    }
  } catch {
    // Error initializing WebGPU
    result.hasWebGPU = false;
  }

  // Try to get CPU info (limited in browser)
  try {
    const cpuInfo = {
      name: (navigator as any).userAgentData?.platform || navigator.platform,
      architecture: (navigator as any).userAgentData?.platform || ''
    };
    result.cpuInfo = cpuInfo;
  } catch {
    // Error getting CPU info
  }

  // Recommend model based on capabilities (NEW 6-tier system)
  // Enhanced recommendations considering device type and backend
  if (deviceInfo.type === 'mobile' || deviceInfo.screenSize === 'small') {
    // Mobile devices - recommend smaller, efficient models
    if (memory >= 12) {
      result.recommendedModel = 'medium'; // High-end phones (iPhone Pro, Galaxy S24)
    } else if (memory >= 8) {
      result.recommendedModel = 'small'; // Mid-range phones
    } else {
      result.recommendedModel = 'tiny'; // Budget phones
    }
  } else if (backend === 'wasm') {
    // CPU-only mode - recommend smallest model
    result.recommendedModel = 'tiny';
  } else if (backend === 'webgl') {
    // WebGL mode (iOS Safari, older browsers)
    if (memory >= 16) {
      result.recommendedModel = 'medium';
    } else if (memory >= 8) {
      result.recommendedModel = 'small';
    } else {
      result.recommendedModel = 'tiny';
    }
  } else if (result.gpuInfo?.isHighPerformance && memory >= 32 && hardwareConcurrency >= 12) {
    // Enthusiast-level system: RTX 4090/3090, 32GB+ RAM, 12+ cores
    result.recommendedModel = 'xxl'; // Phi-3 Medium 14B
  } else if (result.gpuInfo?.isHighPerformance && memory >= 24 && hardwareConcurrency >= 8) {
    // High-end workstation: RTX 4080/3080, 24GB+ RAM, 8+ cores
    result.recommendedModel = 'xl'; // 8B models
  } else if (result.gpuInfo?.isHighPerformance && memory >= 16) {
    // High-end desktop with dedicated GPU
    result.recommendedModel = 'large'; // 7B models
  } else if (result.gpuInfo?.isHighPerformance && memory >= 12) {
    // Mid-range gaming PC
    result.recommendedModel = 'medium'; // 3-4B models
  } else if (memory >= 8) {
    // Standard laptop/desktop
    result.recommendedModel = 'small'; // 1.5-2B models
  } else {
    // Budget devices
    result.recommendedModel = 'tiny'; // 0.5-1B models
  }

  // Log final hardware detection results
  log.info('[Hardware] Detection complete:', {
    deviceType: deviceInfo.type,
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    memory: `${memory}GB`,
    cores: hardwareConcurrency,
    backend: backend,
    hasWebGPU: result.hasWebGPU,
    recommendedModel: result.recommendedModel,
    gpu: result.gpuInfo?.name
  });

  return result;
}