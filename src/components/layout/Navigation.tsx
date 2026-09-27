import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  LayoutDashboard, 
  Globe, 
  ArrowRight, 
  Radio, 
  Maximize2, 
  Minimize2, 
  Terminal, 
  Moon, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight,
  Search,
  Command
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useScrollSpy } from '../../hooks/useScrollSpy';

interface NavigationProps {
  viewMode: 'showcase' | 'admin';
  setViewMode: (mode: 'showcase' | 'admin') => void;
  onLaunchDemo: () => void;
  isFullWidth?: boolean;
  setIsFullWidth?: (val: boolean) => void;
  onOpenCommandPalette?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  viewMode, 
  setViewMode, 
  onLaunchDemo,
  isFullWidth = true,
  setIsFullWidth,
  onOpenCommandPalette
}) => {
  const { theme, toggleSpaceCyberTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile drawer on global Esc / app:close-modals
  useEffect(() => {
    const handleClose = () => setMobileMenuOpen(false);
    window.addEventListener('app:close-modals', handleClose);
    return () => window.removeEventListener('app:close-modals', handleClose);
  }, []);

  // Active section tracking via Scrollspy
  const sectionIds = ['problem', 'architecture', 'pipeline', 'demo', 'analytics', 'pricing'];
  const activeSection = useScrollSpy(sectionIds, 130);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Legacy vs AI', href: '#problem', id: 'problem', badge: null },
    { label: 'Architecture', href: '#architecture', id: 'architecture', badge: null },
    { label: 'Pipeline', href: '#pipeline', id: 'pipeline', badge: null },
    { label: 'Live Simulator', href: '#demo', id: 'demo', badge: 'LIVE', isHot: true },
    { label: 'Global Ops', href: '#analytics', id: 'analytics', badge: null },
    { label: 'ROI Calculator', href: '#pricing', id: 'pricing', badge: null },
  ];

  // Smooth scroll with floating navbar offset compensation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      const yOffset = -85;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded'>('operational');
  const [pingMs, setPingMs] = useState<number>(18);

  // Simulated ping cycle every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // 85% chance of optimal low latency (<120ms), 15% chance of temporary latency spike (>210ms)
      const isSpike = Math.random() < 0.15;
      const simulatedLatency = isSpike 
        ? Math.floor(Math.random() * 120) + 210 // 210ms - 330ms (Degraded)
        : Math.floor(Math.random() * 35) + 12;  // 12ms - 47ms (Operational)

      setPingMs(simulatedLatency);
      setSystemStatus(simulatedLatency > 200 ? 'degraded' : 'operational');
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleManualPingCheck = () => {
    // Force a fresh instant ping cycle
    const freshPing = Math.floor(Math.random() * 25) + 14;
    setPingMs(freshPing);
    setSystemStatus('operational');
  };

  const [scrollProgress, setScrollProgress] = useState(0);

  // Track overall webpage scroll progress percentage
  useEffect(() => {
    const handleScrollProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        const scrolledPct = (winScroll / height) * 100;
        setScrollProgress(scrolledPct);
      }
    };
    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    handleScrollProgress();
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  return (
    <>
      {/* 0. Very Top Screen Scroll Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-950/80 z-[100] pointer-events-none border-b border-cyan-500/20 backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-500 transition-all duration-150 ease-out shadow-[0_0_16px_#00F0FF]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <header className="fixed top-2 sm:top-3.5 left-0 right-0 z-50 px-2 sm:px-4 md:px-6 w-full">
        <nav 
          style={{ backgroundColor: 'var(--color-nav-bg)' }}
          className={`w-full max-w-[1780px] mx-auto rounded-2xl sm:rounded-3xl border border-slate-700/70 px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-2xl backdrop-blur-2xl transition-all duration-300 relative ${
            scrolled 
              ? 'shadow-cyan-950/60 border-cyan-500/30' 
              : 'shadow-black/50 border-white/10'
          }`}
        >
        {/* Subtle Ambient Top Border Highlight */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* 1. BRAND IDENTITY & SYSTEM HEALTH */}
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 group shrink-0 select-none cursor-pointer"
        >
          {/* Glowing Animated Icon Badge */}
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/40 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#06091D] rounded-[14px] flex items-center justify-center">
                <PhoneCall className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            {/* Live status dot reflecting ping health */}
            <span 
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#06091D] animate-pulse transition-colors ${
                systemStatus === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} 
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent whitespace-nowrap">
              VoiceFlow
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-bold uppercase tracking-wider shrink-0">
              AI
            </span>
          </div>
        </a>

        {/* 2. CENTER NAVIGATION LINKS WITH SCROLLSPY (Showcase mode) */}
        {viewMode === 'showcase' && (
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 shadow-inner font-mono text-xs">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-2 group cursor-pointer whitespace-nowrap text-xs font-semibold ${
                    isActive
                      ? 'text-cyan-200 font-bold bg-cyan-500/25 border border-cyan-400/70 shadow-md shadow-cyan-500/25 scale-[1.02]'
                      : link.isHot
                      ? 'text-cyan-300/90 font-medium bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  {/* Active Indicator Dot */}
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF] animate-pulse shrink-0" />
                  ) : link.isHot ? (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                    </span>
                  ) : null}

                  <span className="whitespace-nowrap">{link.label}</span>

                  {link.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase transition-colors shrink-0 ${
                      isActive 
                        ? 'bg-cyan-300 text-slate-950 shadow-sm' 
                        : 'bg-cyan-500/30 text-cyan-200'
                    }`}>
                      {link.badge}
                    </span>
                  )}

                  {/* Active Underline Pill Glow */}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_6px_#00F0FF]" />
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* 3. RIGHT ACTION CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* THEME TOGGLE: Deep Space Blue <-> Cyber Dark */}
          <button
            onClick={toggleSpaceCyberTheme}
            title={`Active Theme: ${theme === 'deep-space-blue' ? 'Deep Space Blue' : 'Cyber Dark'}. Click to switch theme.`}
            aria-label="Toggle Theme: Deep Space Blue / Cyber Dark"
            className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              theme === 'deep-space-blue'
                ? 'bg-[#0E1438]/90 border-purple-400/60 text-purple-200 shadow-md shadow-purple-500/15 hover:border-purple-300 hover:bg-[#121A48]'
                : 'bg-slate-950/90 border-cyan-400/60 text-cyan-300 shadow-md shadow-cyan-500/15 hover:border-cyan-300 hover:bg-slate-900'
            }`}
          >
            {theme === 'deep-space-blue' ? (
              <Moon className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            ) : (
              <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            
            <span className="hidden xl:inline font-bold">
              {theme === 'deep-space-blue' ? 'Deep Space Blue' : 'Cyber Dark'}
            </span>

            {/* Glowing Indicator Dot */}
            <span 
              className={`w-2 h-2 rounded-full transition-all shrink-0 ${
                theme === 'deep-space-blue' 
                  ? 'bg-purple-400 shadow-[0_0_8px_#A855F7]' 
                  : 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]'
              }`} 
            />
          </button>

          {/* Command Palette Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              title="Open Command Palette (Cmd+K / Ctrl+K)"
              className="h-9 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all cursor-pointer group whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden xl:inline text-xs font-semibold">Search</span>
              <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-700 font-mono text-cyan-300 font-bold shadow-inner">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Screen Width Toggle (Full width <-> Boxed) */}
          {setIsFullWidth && (
            <button
              onClick={() => setIsFullWidth(!isFullWidth)}
              title={isFullWidth ? "Fit to Standard Width" : "Expand to Full Size Screen"}
              className="h-9 hidden md:flex items-center gap-1.5 px-2.5 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-cyan-300 transition-all cursor-pointer whitespace-nowrap"
            >
              {isFullWidth ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              <span className="text-xs hidden xl:inline">{isFullWidth ? 'Fit' : 'Full'}</span>
            </button>
          )}

          {/* View Mode Toggle: 3D Showcase <-> Admin Console */}
          <button
            onClick={() => setViewMode(viewMode === 'showcase' ? 'admin' : 'showcase')}
            className={`h-9 px-3 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'admin'
                ? 'bg-purple-600/25 border-purple-400/80 text-purple-200 font-bold shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/90 border-slate-700/90 text-slate-200 hover:border-slate-500 hover:text-white'
            }`}
          >
            {viewMode === 'admin' ? (
              <Globe className="w-3.5 h-3.5 text-purple-400 animate-spin-slow shrink-0" />
            ) : (
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span className="font-semibold hidden sm:inline">
              {viewMode === 'admin' ? 'Showcase' : 'Admin'}
            </span>
            <span className="font-semibold sm:hidden">
              {viewMode === 'admin' ? 'Show' : 'Admin'}
            </span>
          </button>

          {/* Primary CTA: Launch Simulator */}
          <button
            onClick={onLaunchDemo}
            className="h-9 relative group overflow-hidden px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-mono text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Try Simulator</span>
            <span className="sm:hidden">Try</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-400/80 cursor-pointer transition-all shadow-md shrink-0 active:scale-95"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* 4. HIGH-TECH VERTICAL MOBILE NAVIGATION OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
          {/* Mobile Overlay Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-[#06091D] rounded-[10px] flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-cyan-300" />
                </div>
              </div>
              <span className="font-extrabold text-white text-lg font-display bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                VoiceFlow AI
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Mobile Navigation Vertical Links */}
          <div className="py-6 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-3 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Explore Platform Sections</span>
            </div>

            {navLinks.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl font-mono text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/25 via-teal-500/15 to-transparent text-cyan-200 border border-cyan-400/80 font-bold shadow-lg shadow-cyan-500/15'
                      : link.isHot
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-200 hover:bg-slate-900/80 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00F0FF] animate-pulse" />
                    ) : link.isHot ? (
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    )}
                    <span className="font-semibold">{link.label}</span>
                  </div>

                  {link.badge ? (
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                      isActive ? 'bg-cyan-300 text-slate-950' : 'bg-cyan-400 text-slate-950'
                    }`}>
                      {link.badge}
                    </span>
                  ) : (
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  )}
                </a>
              );
            })}
          </div>

          {/* Quick Actions & Launch Button Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3 font-mono">
            {onOpenCommandPalette && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCommandPalette();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-xs text-cyan-200 hover:bg-cyan-500/10 cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5 font-bold">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Search & Command Palette</span>
                </div>
                <kbd className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 font-bold">
                  ⌘K
                </kbd>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  toggleSpaceCyberTheme();
                  setMobileMenuOpen(false);
                }}
                className="py-3 px-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs flex items-center justify-center gap-2 hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
              >
                {theme === 'deep-space-blue' ? (
                  <>
                    <Moon className="w-4 h-4 text-purple-300" />
                    <span className="font-bold">Deep Space</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold">Cyber Dark</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setViewMode(viewMode === 'showcase' ? 'admin' : 'showcase');
                  setMobileMenuOpen(false);
                }}
                className="py-3 px-3 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-center gap-2 hover:bg-purple-900/80 cursor-pointer active:scale-95 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span className="font-bold">{viewMode === 'admin' ? 'Showcase' : 'Admin Mode'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                onLaunchDemo();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 active:scale-98 cursor-pointer transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Launch Live Studio Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </header>
    </>
  );
};
