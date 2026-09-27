import React from 'react';
import { HeroVoiceSphere } from '../3d/HeroVoiceSphere';
import { Sparkles, PhoneCall, ArrowRight, ShieldCheck, Zap, Activity, MessageSquare } from 'lucide-react';

interface HeroSectionProps {
  onExploreDemo: () => void;
  onExploreArchitecture: () => void;
  isFullWidth?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onExploreDemo, 
  onExploreArchitecture,
  isFullWidth = true 
}) => {
  const containerClass = isFullWidth 
    ? "w-full px-3.5 sm:px-8 lg:px-12 2xl:px-16" 
    : "max-w-[1600px] mx-auto px-3.5 sm:px-8";

  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] pt-4 sm:pt-6 pb-6 sm:pb-8 flex items-center justify-center overflow-hidden bg-radial-gradient w-full">
      <div className={`${containerClass} w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center`}>
        {/* Left Headline & Content (6 cols or 7 cols on xl) */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-4 sm:space-y-6 text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 font-mono text-[11px] sm:text-xs shadow-lg shadow-cyan-500/20 font-semibold max-w-full">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 shrink-0" />
            <span className="truncate">Next-Gen Enterprise Voice AI Engine</span>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.1] font-display">
            Conversations,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-purple-400">
              Not Menus.
            </span>
          </h1>

          <p className="text-slate-100 text-sm sm:text-xl leading-relaxed max-w-2xl font-sans font-normal">
            Replace rigid, frustrating phone trees with an intelligent IVR engine that understands free-form speech, perceives caller emotion in real-time, and resolves complex CRM transactions autonomously.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto justify-center px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold font-mono text-xs sm:text-base flex items-center gap-2.5 shadow-2xl shadow-cyan-500/35 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Launch Live IVR Simulator</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>

            <button
              onClick={onExploreArchitecture}
              className="w-full sm:w-auto justify-center px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl glass-card border border-slate-600/80 text-slate-100 hover:text-white hover:border-cyan-400 font-mono text-xs sm:text-base font-semibold flex items-center gap-2.5 transition-all hover:bg-slate-800/80 cursor-pointer shadow-lg"
            >
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
              <span>Explore 3D Pipeline</span>
            </button>
          </div>

          {/* Key Metrics Ticker */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-700/80">
            <div className="bg-slate-900/60 p-2 sm:p-3 rounded-xl border border-slate-800 text-center sm:text-left">
              <div className="text-base xs:text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300 truncate">&lt; 1.2s</div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-300 font-medium block truncate sm:whitespace-normal">End-to-End Latency</span>
            </div>
            <div className="bg-slate-900/60 p-2 sm:p-3 rounded-xl border border-slate-800 text-center sm:text-left">
              <div className="text-base xs:text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 truncate">94.2%</div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-300 font-medium block truncate sm:whitespace-normal">Resolution Rate</span>
            </div>
            <div className="bg-slate-900/60 p-2 sm:p-3 rounded-xl border border-slate-800 text-center sm:text-left">
              <div className="text-base xs:text-2xl sm:text-3xl font-extrabold font-mono text-purple-300 truncate">25+</div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-300 font-medium block truncate sm:whitespace-normal">Auto-Detected Langs</span>
            </div>
          </div>
        </div>

        {/* Right: 3D Harmonic Voice Sphere (6 cols) */}
        <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center w-full min-h-[260px] sm:min-h-[340px]">
          <HeroVoiceSphere isAudioReactive={true} />
        </div>
      </div>
    </section>
  );
};

