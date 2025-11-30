import React from 'react';
import { Shield, Lock, Laptop, Globe, Code, Zap, ArrowRight, Server, Eye, Moon, Sun } from 'lucide-react';
import { useChatStore } from '../store/chat-store';

interface LandingPageProps {
  onStartChat: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  const { isDarkMode, toggleDarkMode } = useChatStore();

  const features = [
    {
      icon: Lock,
      title: '100% Private',
      description: 'Everything runs locally in your browser'
    },
    {
      icon: Eye,
      title: 'No Data Collection',
      description: "We can't see your chats even if we wanted to"
    },
    {
      icon: Laptop,
      title: 'No Account Needed',
      description: 'Just open and chat'
    },
    {
      icon: Globe,
      title: 'Works Offline',
      description: 'After initial model download'
    },
    {
      icon: Code,
      title: 'Open Source',
      description: 'Verify our privacy claims yourself'
    },
    {
      icon: Zap,
      title: '33+ AI Models',
      description: '8 performance tiers from 350MB to 9GB+'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Choose Your Model',
      description: 'Select a model based on your device capabilities'
    },
    {
      number: '2',
      title: 'Download Once',
      description: 'Model downloads and caches in your browser'
    },
    {
      number: '3',
      title: 'Chat Privately',
      description: 'All processing happens on your device'
    },
    {
      number: '4',
      title: 'Stay Secure',
      description: 'Your data never touches any server'
    }
  ];

  return (
    <main id="main-content" className="min-h-screen bg-theme" role="main">
      {/* Theme Toggle - Fixed in top right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className="glass p-3 rounded-xl glass-hover shadow-lg transition-all duration-200 hover:scale-105"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-theme-secondary" />
          ) : (
            <Moon className="h-5 w-5 text-theme-secondary" />
          )}
        </button>
      </div>

      {/* Hero Section */}
      <section aria-label="Introduction" className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl" aria-hidden="true">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-accent opacity-20" />
          </div>
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl">
              <img
                src="/Whitelogotransparentbg.png"
                alt="OBLIVAI Logo - Private AI Chat"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-theme-primary mb-4 sm:mb-6">
            True AI Privacy
            <span className="block text-gradient mt-1 sm:mt-2">No Servers, No Tracking, No Compromise</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-lg sm:text-xl leading-7 sm:leading-8 text-theme-secondary max-w-3xl mx-auto px-4">
            Chat with AI models running entirely in your browser. Your conversations never leave your device.
          </p>

          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4 sm:gap-6 px-4">
            <button
              onClick={onStartChat}
              className="glass gradient-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white rounded-xl glass-hover flex items-center gap-2 transform transition hover:scale-105 w-full sm:w-auto max-w-sm"
            >
              Start Private Chat
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-theme-muted px-4" role="list" aria-label="Key benefits">
            <div className="flex items-center gap-2" role="listitem">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
              <span>No Registration</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <Server className="h-3 w-3 sm:h-4 sm:w-4 line-through" aria-hidden="true" />
              <span>No Server Processing</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
              <span>End-to-End Private</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section aria-label="Features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-theme-primary">
              Privacy Without Compromise
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-theme-secondary px-4">
              Experience the future of private AI conversations
            </p>
          </div>

          <ul className="mx-auto mt-12 sm:mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <li
                  key={index}
                  className="glass rounded-xl sm:rounded-2xl p-6 sm:p-8 transform transition hover:scale-105"
                >
                  <div className="mb-3 sm:mb-4">
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-theme-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-theme-muted">
                    {feature.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section aria-label="How it works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-black/20 dark:bg-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-theme-primary">
              How It Works
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-theme-secondary px-4">
              Simple, secure, and completely private
            </p>
          </div>

          <ol className="mx-auto max-w-4xl space-y-6 sm:space-y-8 list-none p-0">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4 sm:gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-base sm:text-lg" aria-hidden="true">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-theme-primary mb-2">
                    Step {step.number}: {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-theme-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy Guarantee */}
      <section aria-label="Privacy guarantee" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="glass rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
            <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-4">
              Our Privacy Guarantee
            </h2>
            <p className="text-base sm:text-lg text-theme-secondary mb-6 sm:mb-8 px-4">
              OBLIVAI is designed from the ground up with privacy as the core principle.
              No user data, conversations, or personal information ever leaves your device.
              This isn't just a promise - it's architecturally impossible for us to access your data.
            </p>
            <div className="flex justify-center px-4">
              <button
                onClick={onStartChat}
                className="gradient-primary px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition transform hover:scale-105"
              >
                Try It Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};