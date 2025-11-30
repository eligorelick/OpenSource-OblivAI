export interface ModelConfig {
  id: string;
  name: string;
  size: string;
  requirements: {
    ram: number;
    gpu: 'optional' | 'recommended' | 'required';
  };
  description: string;
  category: 'tiny' | 'small' | 'medium' | 'large' | 'xl' | 'coding';
}

// 35+ AI models organized by capability and size
export const MODELS: Record<string, ModelConfig> = {
  // TINY TIER (500MB-1GB) - Ultra-fast, all devices
  smollm2_360m: {
    id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 360M',
    size: '350MB',
    requirements: { ram: 2, gpu: 'optional' },
    description: 'Extremely lightweight model for very old devices',
    category: 'tiny'
  },
  qwen2_0_5b: {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5 0.5B',
    size: '500MB',
    requirements: { ram: 4, gpu: 'optional' },
    description: 'Ultra-fast, works on all devices including old phones',
    category: 'tiny'
  },
  qwen3_0_6b: {
    id: 'Qwen3-0.6B-q4f16_1-MLC',
    name: 'Qwen3 0.6B',
    size: '600MB',
    requirements: { ram: 4, gpu: 'optional' },
    description: 'Latest ultra-compact Qwen model, excellent efficiency',
    category: 'tiny'
  },
  llama32_1b: {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B',
    size: '879MB',
    requirements: { ram: 6, gpu: 'optional' },
    description: 'Flexible and fast, great for mobile devices',
    category: 'tiny'
  },
  tinyllama_1b: {
    id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
    name: 'TinyLlama 1.1B',
    size: '879MB',
    requirements: { ram: 6, gpu: 'optional' },
    description: 'Ultra-compact model for resource-constrained devices',
    category: 'tiny'
  },

  // SMALL TIER (1-2GB) - Fast, most devices
  qwen2_1_5b: {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5 1.5B',
    size: '1.63GB',
    requirements: { ram: 8, gpu: 'recommended' },
    description: 'Recommended: Best balance of speed and quality',
    category: 'small'
  },
  qwen3_1_7b: {
    id: 'Qwen3-1.7B-q4f16_1-MLC',
    name: 'Qwen3 1.7B',
    size: '1.7GB',
    requirements: { ram: 8, gpu: 'recommended' },
    description: 'Latest Qwen3 model with improved performance',
    category: 'small'
  },
  smollm2_1_7b: {
    id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 1.7B',
    size: '1.1GB',
    requirements: { ram: 8, gpu: 'recommended' },
    description: 'Efficient small model with good performance',
    category: 'small'
  },
  gemma_2b: {
    id: 'gemma-2-2b-it-q4f16_1-MLC',
    name: 'Gemma 2-2B (Google)',
    size: '1.73GB',
    requirements: { ram: 8, gpu: 'recommended' },
    description: 'Google\'s efficient model, excellent for general tasks',
    category: 'small'
  },

  // MEDIUM TIER (2-4GB) - High quality, good devices
  llama32_3b: {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    size: '2.26GB',
    requirements: { ram: 12, gpu: 'recommended' },
    description: 'High quality responses, good for complex conversations',
    category: 'medium'
  },
  hermes_3b: {
    id: 'Hermes-3-Llama-3.2-3B-q4f16_1-MLC',
    name: 'Hermes 3 Llama 3B (Uncensored)',
    size: '2.26GB',
    requirements: { ram: 12, gpu: 'recommended' },
    description: 'Uncensored 3B model with strong instruction following',
    category: 'medium'
  },
  stablelm_3b: {
    id: 'stablelm-2-zephyr-1_6b-q4f16_1-MLC',
    name: 'StableLM 2 Zephyr 1.6B',
    size: '1.89GB',
    requirements: { ram: 10, gpu: 'recommended' },
    description: 'Stability AI\'s efficient model, great for creative tasks',
    category: 'medium'
  },
  qwen25_3b: {
    id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5 3B',
    size: '2.1GB',
    requirements: { ram: 10, gpu: 'recommended' },
    description: 'Latest Qwen model with excellent multilingual capabilities',
    category: 'medium'
  },
  redpajama_3b: {
    id: 'RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC',
    name: 'RedPajama 3B',
    size: '2.07GB',
    requirements: { ram: 10, gpu: 'recommended' },
    description: 'Open-source model trained on diverse data, versatile',
    category: 'medium'
  },

  // LARGE TIER (4-6GB) - Very capable, powerful devices
  hermes_7b: {
    id: 'Hermes-2-Pro-Mistral-7B-q4f16_1-MLC',
    name: 'Hermes 2 Pro 7B (Uncensored)',
    size: '4.03GB',
    requirements: { ram: 12, gpu: 'required' },
    description: 'Advanced uncensored model with excellent instruction following',
    category: 'large'
  },
  mistral_7b: {
    id: 'Mistral-7B-Instruct-v0.2-q4f16_1-MLC',
    name: 'Mistral 7B v0.2',
    size: '4.37GB',
    requirements: { ram: 12, gpu: 'required' },
    description: 'Popular powerful model, excellent for complex reasoning',
    category: 'large'
  },
  mistral_7b_v0_3: {
    id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
    name: 'Mistral 7B v0.3',
    size: '4.37GB',
    requirements: { ram: 12, gpu: 'required' },
    description: 'Latest Mistral model with improved performance',
    category: 'large'
  },
  openhermes_7b: {
    id: 'OpenHermes-2.5-Mistral-7B-q4f16_1-MLC',
    name: 'OpenHermes 2.5 Mistral 7B',
    size: '4.37GB',
    requirements: { ram: 12, gpu: 'required' },
    description: 'Fine-tuned Mistral with excellent instruction following',
    category: 'large'
  },
  neuralhermes_7b: {
    id: 'NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC',
    name: 'NeuralHermes 2.5 Mistral 7B',
    size: '4.37GB',
    requirements: { ram: 12, gpu: 'required' },
    description: 'Specialized for complex reasoning and problem-solving',
    category: 'large'
  },
  deepseek_7b: {
    id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
    name: 'DeepSeek-R1 7B (Reasoning)',
    size: '5.11GB',
    requirements: { ram: 12, gpu: 'required' },
    description: 'Specialized reasoning model with chain-of-thought capabilities',
    category: 'large'
  },

  // XL TIER (5-8GB) - Extremely capable, high-end devices
  llama31_8b: {
    id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.1 8B',
    size: '4.60GB',
    requirements: { ram: 16, gpu: 'required' },
    description: 'Meta\'s flagship model, exceptional at all tasks',
    category: 'xl'
  },
  hermes_8b: {
    id: 'Hermes-3-Llama-3.1-8B-q4f16_1-MLC',
    name: 'Hermes 3 Llama 8B (Uncensored)',
    size: '4.98GB',
    requirements: { ram: 16, gpu: 'required' },
    description: 'Latest uncensored model with advanced capabilities, no content restrictions',
    category: 'xl'
  },
  deepseek_8b: {
    id: 'DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC',
    name: 'DeepSeek-R1 8B (Advanced Reasoning)',
    size: '5.00GB',
    requirements: { ram: 16, gpu: 'required' },
    description: 'Top-tier reasoning model with exceptional problem-solving',
    category: 'xl'
  },

  // Additional LARGE TIER - Mathematics specialist
  wizardmath_7b: {
    id: 'WizardMath-7B-V1.1-q4f16_1-MLC',
    name: 'WizardMath 7B',
    size: '4.57GB',
    requirements: { ram: 16, gpu: 'required' },
    description: 'Specialized in mathematics and complex problem-solving',
    category: 'large'
  },

  // Additional MEDIUM TIER models
  phi_3_5_mini: {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi-3.5 Mini',
    size: '2.3GB',
    requirements: { ram: 10, gpu: 'recommended' },
    description: 'Microsoft\'s efficient model with strong reasoning capabilities',
    category: 'medium'
  },
  qwen3_4b: {
    id: 'Qwen3-4B-q4f16_1-MLC',
    name: 'Qwen3 4B',
    size: '2.5GB',
    requirements: { ram: 12, gpu: 'required' },
    description: 'Latest Qwen3 model with excellent performance',
    category: 'medium'
  },

  // Additional LARGE TIER models
  qwen25_7b: {
    id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5 7B',
    size: '4.7GB',
    requirements: { ram: 12, gpu: 'required' },
    description: 'Latest Qwen model with excellent multilingual support',
    category: 'large'
  },

  // Additional XL TIER models
  qwen3_8b: {
    id: 'Qwen3-8B-q4f16_1-MLC',
    name: 'Qwen3 8B',
    size: '5.0GB',
    requirements: { ram: 16, gpu: 'required' },
    description: 'Latest Qwen3 flagship model with cutting-edge capabilities',
    category: 'xl'
  },
  gemma2_9b: {
    id: 'gemma-2-9b-it-q4f16_1-MLC',
    name: 'Gemma 2-9B',
    size: '5.4GB',
    requirements: { ram: 16, gpu: 'required' },
    description: 'Google\'s advanced 9B model with strong reasoning',
    category: 'xl'
  },

  // CODING TIER - Specialized coding models optimized for software development
  qwen25_coder_7b: {
    id: 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 7B (Largest)',
    size: '4.7GB',
    requirements: { ram: 16, gpu: 'required' },
    description: 'Most powerful coding model - expert at programming, debugging, and code review',
    category: 'coding'
  },
  qwen25_coder_3b: {
    id: 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 3B',
    size: '2.1GB',
    requirements: { ram: 12, gpu: 'recommended' },
    description: 'Efficient coding model great for development tasks and refactoring',
    category: 'coding'
  },
  qwen25_coder_1_5b: {
    id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 1.5B',
    size: '1.2GB',
    requirements: { ram: 8, gpu: 'recommended' },
    description: 'Fast coding assistant for quick tasks and code completion',
    category: 'coding'
  },
  qwen25_coder_0_5b: {
    id: 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 0.5B (Mobile)',
    size: '400MB',
    requirements: { ram: 4, gpu: 'optional' },
    description: 'Ultra-fast coding helper for mobile devices and simple coding tasks',
    category: 'coding'
  }
};

// Get models by category for easier filtering
export function getModelsByCategory(category: ModelConfig['category']): ModelConfig[] {
  return Object.values(MODELS).filter(model => model.category === category);
}

// Helper function to convert size string to MB for proper sorting
function parseSizeToMB(size: string): number {
  const num = parseFloat(size);
  return size.includes('GB') ? num * 1024 : num;
}

// Get all models as array sorted by size
export function getAllModelsSorted(): ModelConfig[] {
  return Object.values(MODELS).sort((a, b) => {
    const sizeA = parseSizeToMB(a.size);
    const sizeB = parseSizeToMB(b.size);
    return sizeA - sizeB;
  });
}

// Filter models based on device capabilities
export function getModelsForDevice(deviceMemory: number, isMobile: boolean): ModelConfig[] {
  return Object.values(MODELS).filter(model => {
    // Mobile devices (iOS/Android) - be conservative
    if (isMobile) {
      // iOS Safari and mobile browsers have strict memory limits (~2-3GB for web apps)
      // Even if device has 8GB, we can't use it all
      if (deviceMemory <= 4) {
        // Low-end phones: Only tiny models
        return model.category === 'tiny';
      } else if (deviceMemory <= 8) {
        // Mid to high-end phones (iPhone 15 Pro Max, Galaxy S24): Tiny + Small
        return model.category === 'tiny' || model.category === 'small';
      } else {
        // Tablets with lots of RAM: Tiny + Small + some Medium
        return model.category === 'tiny' || model.category === 'small' ||
               (model.category === 'medium' && model.requirements.ram <= 6);
      }
    }

    // Desktop - show all models that fit in available RAM
    return model.requirements.ram <= deviceMemory;
  });
}

// Check if a specific model is compatible with device
export function isModelCompatible(model: ModelConfig, deviceMemory: number, isMobile: boolean): boolean {
  if (isMobile) {
    // Mobile-specific limits
    if (deviceMemory <= 4) {
      return model.category === 'tiny';
    } else if (deviceMemory <= 8) {
      return model.category === 'tiny' || model.category === 'small';
    } else {
      return model.category === 'tiny' || model.category === 'small' ||
             (model.category === 'medium' && model.requirements.ram <= 6);
    }
  }

  // Desktop compatibility
  return model.requirements.ram <= deviceMemory;
}

// Legacy compatibility - map old keys to new models
export const MODEL_ALIASES: Record<string, string> = {
  'tiny': 'qwen2_0_5b',
  'medium': 'qwen2_1_5b',
  'large': 'llama32_3b',
  'xl': 'llama31_8b',
  'uncensored': 'hermes_8b'
};