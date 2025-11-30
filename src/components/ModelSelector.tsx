import React, { useEffect, useState } from 'react';
import { Cpu, Zap, AlertCircle, Check, Loader2, Smartphone, Moon, Sun } from 'lucide-react';
import { getModelsByCategory, isModelCompatible } from '../lib/model-config';
import type { ModelConfig } from '../lib/model-config';
import { detectHardware } from '../lib/hardware-detect';
import type { HardwareInfo } from '../lib/hardware-detect';
import { useChatStore } from '../store/chat-store';

interface ModelSelectorProps {
  onModelSelect: (model: ModelConfig) => void;
  isLoading: boolean;
  loadingProgress: number;
  loadingStatus: string;
  onBack?: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  onModelSelect,
  isLoading,
  loadingProgress,
  loadingStatus,
  onBack
}) => {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [detecting, setDetecting] = useState(true);
  const selectedModel = useChatStore(state => state.selectedModel);
  const { isDarkMode, toggleDarkMode } = useChatStore();

  useEffect(() => {
    detectHardware().then(hw => {
      setHardware(hw);
      setDetecting(false);
    });
  }, []);

  const getModelStatus = (model: ModelConfig) => {
    if (!hardware) return 'checking';

    // Check if model is compatible with device (considers mobile limits)
    const isMobile = hardware.deviceInfo.type === 'mobile' || hardware.deviceInfo.type === 'tablet';
    const isCompatible = isModelCompatible(model, hardware.memory, isMobile);

    if (!isCompatible) {
      return 'insufficient';
    }

    if (hardware.memory < model.requirements.ram) {
      return 'insufficient';
    }

    // Only block models if we're on CPU-only (WASM) mode
    // WebGL can run models with 'recommended' or 'optional' GPU requirements
    // Only 'required' models need WebGPU or high-performance WebGL
    if (hardware.backend === 'wasm') {
      // On WASM (CPU-only), only allow models with 'optional' GPU requirement
      if (model.requirements.gpu === 'recommended' || model.requirements.gpu === 'required') {
        return 'insufficient';
      }
    }

    if (model.category === hardware.recommendedModel) {
      return 'recommended';
    }

    return 'compatible';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended':
        return 'border-green-500 bg-green-500/10';
      case 'compatible':
        return 'border-gray-500 bg-gray-500/10';
      case 'insufficient':
        return 'border-red-500 bg-red-500/10 opacity-50 cursor-not-allowed';
      default:
        return 'border-gray-600 bg-gray-600/10';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recommended':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
            Recommended
          </span>
        );
      case 'insufficient':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-400">
            Insufficient Hardware
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="glass p-2 rounded-lg glass-hover">
                Back
              </button>
            )}
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <img
                src="/Whitelogotransparentbg.png"
                alt="OBLIVAI"
                className="w-6 h-6 object-contain"
              />
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="glass p-2 rounded-lg glass-hover"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-theme-secondary" />
            ) : (
              <Moon className="h-5 w-5 text-theme-secondary" />
            )}
          </button>
        </div>
      </div>
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-3 sm:mb-4">Choose Your AI Model</h2>
        <p className="text-sm sm:text-base text-theme-secondary">Select a model based on your device capabilities</p>
      </div>

      {/* Mobile User Notice */}
      {hardware && (hardware.deviceInfo.type === 'mobile' || hardware.deviceInfo.type === 'tablet') && (
        <div className="glass rounded-xl p-4 mb-6 border-blue-500/50 bg-blue-500/10">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-theme-secondary">
              <p className="font-semibold mb-1 text-blue-400">Mobile Device Detected</p>
              <p>
                Showing only models that work on your {hardware.deviceInfo.os === 'ios' ? 'iPhone/iPad' : 'device'}.
                Larger models are hidden as they require desktop hardware. Best models for you: <span className="text-theme-primary font-medium">Qwen2 0.5B, Llama 3.2 1B, Qwen2 1.5B, Gemma 2B</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Info */}
      {hardware && (
        <div className="glass rounded-xl p-4 sm:p-5 mb-6 sm:mb-8">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-3">
              <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
              <h3 className="text-sm sm:text-base font-medium text-theme-primary">Your Device</h3>
              {detecting && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="text-theme-muted">CPU Cores:</span>
                <span className="text-theme-secondary">{hardware.cores}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-theme-muted">System RAM:</span>
                <span className="text-theme-secondary">{hardware.memory}GB</span>
              </div>
              {hardware.gpuInfo && (
                <div className="flex items-center gap-2">
                  <span className="text-theme-muted">GPU:</span>
                  <span className="text-theme-secondary">
                    {hardware.gpuInfo.name}
                    {hardware.gpuInfo.vram && ` (${hardware.gpuInfo.vram}GB VRAM)`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-theme-muted">Acceleration:</span>
                <span className="text-theme-secondary">
                  {hardware.hasWebGPU
                    ? 'WebGPU Enabled'
                    : hardware.gpuInfo
                      ? 'GPU (No WebGPU)'
                      : 'CPU Only'}
                </span>
              </div>
            </div>
            
            {hardware.deviceType === 'desktop' && hardware.gpuInfo?.isHighPerformance && (
              <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                High-performance GPU detected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model Cards - Organized by Category */}
      <div className="space-y-8">
        {['tiny', 'small', 'medium', 'large', 'xl', 'coding'].map(category => {
          const categoryModels = getModelsByCategory(category as ModelConfig['category']);
          if (categoryModels.length === 0) return null;

          // On mobile, hide categories with no compatible models
          const isMobile = hardware?.deviceInfo.type === 'mobile' || hardware?.deviceInfo.type === 'tablet';
          const hasCompatibleModels = categoryModels.some(model => {
            if (!hardware) return true;
            return isModelCompatible(model, hardware.memory, isMobile);
          });

          if (isMobile && !hasCompatibleModels) return null;

          const categoryNames = {
            tiny: 'Tiny (350MB-1GB) - Ultra-fast, all devices',
            small: 'Small (1-2GB) - Fast, most devices',
            medium: 'Medium (2-3GB) - High quality, good devices',
            large: 'Large (4-5GB) - Very capable, powerful devices',
            xl: 'XL (5-6GB) - Extremely capable, high-end devices',
            coding: 'Coding Specialists - Expert programming and development'
          };

          return (
            <div key={category}>
              <h3 className="text-lg font-semibold text-theme-primary mb-4 border-b border-white/10 pb-2">
                {categoryNames[category as keyof typeof categoryNames]}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModels.map((model, idx) => {
                  const status = getModelStatus(model);
                  const isSelected = selectedModel?.id === model.id;
                  const isDisabled = status === 'insufficient' || isLoading;

                  // On mobile, hide incompatible models entirely (cleaner UX)
                  const isMobile = hardware?.deviceInfo.type === 'mobile' || hardware?.deviceInfo.type === 'tablet';
                  if (isMobile && status === 'insufficient') return null;

                  return (
                    <button
                      key={`${category}-${idx}`}
                      onClick={() => !isDisabled && onModelSelect(model)}
                      disabled={isDisabled}
                      className={`
                        glass rounded-xl p-4 sm:p-5 text-left transition-all transform hover:scale-[1.02]
                        ${getStatusColor(status)}
                        ${isSelected ? 'ring-2 ring-primary' : ''}
                        ${isDisabled ? '' : 'hover:bg-white/10'}
                        w-full
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base sm:text-lg font-semibold text-theme-primary">{model.name}</h4>
                            {/* Show mobile badge for compatible models on small screens */}
                            {(model.category === 'tiny' || model.category === 'small') && hardware?.deviceInfo.type === 'mobile' && (
                              <span title="Works great on mobile">
                                <Smartphone className="h-3 w-3 text-green-400" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-theme-muted mt-1">{model.size}</p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />}
                      </div>

                      {getStatusBadge(status)}

                      <p className="text-theme-secondary mt-3 text-xs sm:text-sm line-clamp-2">{model.description}</p>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-theme-muted">
                          <Zap className="h-3 w-3 flex-shrink-0" />
                          <span>Min {model.requirements.ram}GB RAM</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-theme-muted">
                          <Cpu className="h-3 w-3 flex-shrink-0" />
                          <span>GPU {model.requirements.gpu}</span>
                        </div>
                      </div>

                      {isSelected && isLoading && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-theme-muted mb-2">
                            <span className="truncate pr-2 animate-pulse">{loadingStatus}</span>
                            <span className="font-mono flex-shrink-0 font-bold text-primary">{Math.round(loadingProgress)}%</span>
                          </div>
                          <div className="w-full bg-black/30 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden shadow-inner">
                            <div className="relative h-full">
                              <div
                                className="gradient-primary h-full transition-all duration-300 ease-out shadow-lg"
                                style={{
                                  width: `${loadingProgress}%`,
                                  boxShadow: loadingProgress > 0 ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'
                                }}
                              />
                              {loadingProgress > 0 && loadingProgress < 100 && (
                                <>
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                  <div className="absolute right-0 top-0 h-full w-2 bg-white/40 animate-pulse"
                                       style={{ left: `${Math.max(0, loadingProgress - 2)}%` }} />
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-theme-muted mt-2 flex items-center gap-2">
                            {loadingProgress < 100 && (
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                            <span className="font-medium">
                              {loadingProgress === 0 && 'Preparing to load...'}
                              {loadingProgress > 0 && loadingProgress < 100 && loadingStatus}
                              {loadingProgress >= 100 && '✓ Model ready!'}
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning for low-end devices */}
      {hardware && hardware.memory < 4 && (
        <div className="mt-6 glass rounded-xl p-4 border-yellow-500/50 bg-yellow-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-theme-secondary">
              <p className="font-semibold mb-1 text-theme-primary">Limited Device Resources Detected</p>
              <p>
                Your device has limited memory. We recommend using the smallest model for the best
                experience. Larger models may cause performance issues or fail to load.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};