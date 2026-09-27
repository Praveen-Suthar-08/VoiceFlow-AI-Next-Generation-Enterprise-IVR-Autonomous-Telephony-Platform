import React, { useState, useRef, useEffect } from 'react';
import { Navigation } from './components/layout/Navigation';
import { HeroSection } from './components/sections/HeroSection';
import { ProblemSection } from './components/sections/ProblemSection';
import { SolutionShowcaseSection } from './components/sections/SolutionShowcaseSection';
import { ProcessPipeline3D } from './components/3d/ProcessPipeline3D';
import { InteractiveLiveDemoSection } from './components/sections/InteractiveLiveDemoSection';
import { AnalyticsGlobe3D } from './components/3d/AnalyticsGlobe3D';
import { PricingRoiSection } from './components/sections/PricingRoiSection';
import { CtaFooterSection } from './components/sections/CtaFooterSection';
import { AdminWorkspace } from './components/admin/AdminWorkspace';
import { SystemLogOverlay } from './components/telemetry/SystemLogOverlay';
import { CommandPaletteModal } from './components/navigation/CommandPaletteModal';
import { Activity, BrainCircuit, Globe, PhoneCall } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';

// Disable default browser scroll restoration so reloads and initial visits land at the top
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function AppContent() {
  const { toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<'showcase' | 'admin'>('showcase');
  const [isFullWidth, setIsFullWidth] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const pipelineSectionRef = useRef<HTMLDivElement>(null);

  // Directly scroll to top of the page on initial visit/mount
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      // Secondary tick to ensure top scroll after initial DOM and asset calculations
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  // When switching between Showcase and Admin views, reset scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [viewMode]);

  const scrollToDemo = () => {
    setViewMode('showcase');
    const elem = document.getElementById('demo');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPipeline = () => {
    setViewMode('showcase');
    const elem = document.getElementById('pipeline');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Global Keyboard Shortcuts (Cmd+K, Esc, Cmd+D, Cmd+J, Cmd+Shift+T)
  useGlobalKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onCloseCommandPalette: () => setIsCommandPaletteOpen(false),
    isCommandPaletteOpen,
    onLaunchDemo: scrollToDemo,
    onToggleViewMode: () => setViewMode(v => v === 'showcase' ? 'admin' : 'showcase'),
    onToggleTheme: toggleTheme
  });

  const containerWidthClass = isFullWidth 
    ? "w-full px-3 sm:px-6 lg:px-10 2xl:px-14" 
    : "max-w-[1560px] w-full mx-auto px-4 sm:px-8";

  return (
    <div id="top" className="min-h-screen w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-900 overflow-x-hidden transition-colors duration-500">
      {/* Top Floating Navigation */}
      <Navigation
        viewMode={viewMode}
        setViewMode={setViewMode}
        onLaunchDemo={scrollToDemo}
        isFullWidth={isFullWidth}
        setIsFullWidth={setIsFullWidth}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16">
        {viewMode === 'showcase' ? (
          <div className="space-y-10 sm:space-y-12">
            {/* Section 1: Hero */}
            <HeroSection
              onExploreDemo={scrollToDemo}
              onExploreArchitecture={scrollToPipeline}
              isFullWidth={isFullWidth}
            />

            {/* Section 2: Problem Statement (Why Old IVR Fails) */}
            <div className={containerWidthClass}>
              <ProblemSection />
            </div>

            {/* Section 3: Architecture & 5 Subsystems */}
            <div className={containerWidthClass}>
              <SolutionShowcaseSection />
            </div>

            {/* Section 4: How It Works & 6-Step Transformation Pipeline */}
            <section id="pipeline" ref={pipelineSectionRef} className={`${containerWidthClass} space-y-6`}>
              <div className="text-center max-w-4xl mx-auto space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 font-mono text-xs font-semibold shadow-md shadow-cyan-500/10">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time Transformation Pipeline</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
                  From Spoken Audio to Autonomous CRM Action in &lt;1.5s
                </h2>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
                  Interactive breakdown of how VoiceFlow parses phonetic acoustic signals into intent vectors, sentiment parameters, and instant business executions.
                </p>
              </div>

              <ProcessPipeline3D />
            </section>

            {/* Section 5: Live In-Browser IVR Studio Simulator */}
            <section id="demo" ref={demoSectionRef} className={`${containerWidthClass} space-y-6`}>
              <div className="text-center max-w-4xl mx-auto space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 font-mono text-xs font-semibold shadow-md shadow-emerald-500/10">
                  <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Interactive Live Studio Simulator</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
                  Test the Gemini Voice Engine Directly in Your Browser
                </h2>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
                  Select a realistic customer scenario below, speak into your microphone or type naturally. Watch real-time emotion radar, slot filling, and autonomous Stripe refunds or UPS tracking execution.
                </p>
              </div>

              <InteractiveLiveDemoSection />
            </section>

            {/* Section 6: Global Operations & 3D Analytics Globe */}
            <section id="analytics" className={`${containerWidthClass} space-y-6`}>
              <div className="text-center max-w-4xl mx-auto space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/40 text-blue-200 font-mono text-xs font-semibold shadow-md shadow-blue-500/10">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Global Distributed Edge Telephony</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
                  Autonomous Call Centers Handling 10,000+ Concurrent Streams
                </h2>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
                  Holographic view of live global call origin arcs, sub-240ms edge routing, and real-time sentiment distribution.
                </p>
              </div>

              <AnalyticsGlobe3D />
            </section>

            {/* Section 7: Interactive ROI & Pricing Calculator */}
            <section id="pricing" className={`${containerWidthClass} space-y-6`}>
              <div className="text-center max-w-4xl mx-auto space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 font-mono text-xs font-semibold shadow-md shadow-amber-500/10">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Transparent Enterprise Economics</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
                  Transform Contact Center Economics With &gt;60% Lower Cost per Call
                </h2>
              </div>

              <PricingRoiSection />
            </section>

            {/* Section 9: CTA Banner & Footer */}
            <CtaFooterSection isFullWidth={isFullWidth} />
          </div>
        ) : (
          /* Admin & IVR Studio Workspace Mode */
          <div className={`${containerWidthClass} pt-6 pb-16 space-y-6`}>
            <AdminWorkspace />
          </div>
        )}
      </main>

      {/* Floating Real-Time Terminal System Log Overlay */}
      <SystemLogOverlay />

      {/* Global Command Palette / Search Modal (Cmd+K / Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onLaunchDemo={scrollToDemo}
        isFullWidth={isFullWidth}
        setIsFullWidth={setIsFullWidth}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

