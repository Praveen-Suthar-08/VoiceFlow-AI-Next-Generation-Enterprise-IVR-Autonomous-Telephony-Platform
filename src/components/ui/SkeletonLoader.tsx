import React from 'react';
import { Cpu, Radio, Sparkles, Activity, Layers, Globe, BarChart3, Database, ShieldCheck, Zap } from 'lucide-react';

/**
 * Base primitive Skeleton component with cyber-themed dark shimmer sweep
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  ...props
}) => {
  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'rectangular'
      ? 'rounded-none'
      : 'rounded-xl';

  return (
    <div
      className={`relative overflow-hidden bg-slate-900/90 border border-slate-800/80 animate-shimmer ${variantClass} ${className}`}
      {...props}
    />
  );
};

/**
 * 1. ThreeDSphereSkeleton: Skeleton for Hero 3D Voice Sphere
 */
export interface ThreeDSphereSkeletonProps {
  statusMessage?: string;
}

export const ThreeDSphereSkeleton: React.FC<ThreeDSphereSkeletonProps> = ({
  statusMessage = 'Allocating 2,400 Dynamic WebGL Particles...'
}) => {
  return (
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[600px] xl:h-[640px] flex items-center justify-center rounded-3xl bg-slate-950/70 border border-slate-800/70 overflow-hidden select-none">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />

      {/* Ambient Radial Glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl animate-pulse-glow pointer-events-none" />

      {/* Center 3D Wireframe Sphere Skeleton Placeholder */}
      <div className="relative flex items-center justify-center">
        {/* Outer Orbiting Skeleton Ring 1 */}
        <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full border border-dashed border-cyan-400/30 animate-radar" />
        
        {/* Outer Orbiting Skeleton Ring 2 */}
        <div className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-purple-500/25 animate-pulse" />

        {/* Center Glowing Particle Ball Silhouette */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#0D1442] via-[#1A2268] to-[#121A52] border border-cyan-500/40 flex items-center justify-center shadow-2xl shadow-cyan-950/50 animate-pulse-glow">
          {/* Internal Wireframe Latitude lines */}
          <div className="absolute inset-2 rounded-full border border-cyan-400/20" />
          <div className="absolute inset-6 rounded-full border border-purple-400/20" />
          <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-300/40 flex items-center justify-center">
            <Radio className="w-8 h-8 text-cyan-300 animate-pulse" />
          </div>
        </div>

        {/* Orbiting Satellite Node Skeletons */}
        <div className="absolute -top-6 -right-6 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-full shadow-lg">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[10px] font-mono text-cyan-200 font-semibold">Shader Compiling</span>
        </div>
      </div>

      {/* Top HUD Skeleton Status */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300">GPU Buffer:</span>
          <span className="text-cyan-300 font-bold">2,400 Nodes</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="text-purple-300 font-semibold">Awaiting Audio Stream</span>
        </div>
      </div>

      {/* Bottom Loading Progress Bar & Callout */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-slate-950/90 border border-slate-700/90 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            {statusMessage}
          </span>
          <span className="text-cyan-300 font-bold">Loading 3D...</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-500 rounded-full w-3/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

/**
 * 2. ThreeDKeypadSkeleton: Skeleton for Problem Section Shattered Keypad
 */
export const ThreeDKeypadSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[440px] sm:h-[480px] rounded-3xl bg-slate-950/70 border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center p-6 space-y-5">
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      {/* Header Skeleton */}
      <div className="w-full max-w-xs flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          TOUCH-TONE MATRIX
        </span>
        <span className="text-slate-500">LEGACY IVR</span>
      </div>

      {/* 3x4 Telephone Keypad Grid Skeleton */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center animate-shimmer"
          >
            <span className="text-base font-bold font-mono text-slate-400">{k}</span>
            <div className="w-5 h-1 bg-slate-700/60 rounded-full mt-1" />
          </div>
        ))}
      </div>

      {/* Shatter Physics Status */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
        <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Instantiating Three.js Voronoi Physics & Keypad Mesh...</span>
      </div>
    </div>
  );
};

/**
 * 3. ThreeDBrainSkeleton: Skeleton for Solution 5-Engine Neural Brain
 */
export const ThreeDBrainSkeleton: React.FC = () => {
  const engines = [
    { title: 'Perception Engine', desc: 'Acoustic feature extraction' },
    { title: 'NLU Reasoning', desc: 'Gemini 3.8 intent classifier' },
    { title: 'Dialogue Orchestrator', desc: 'Dynamic state management' },
    { title: 'Tool Execution', desc: 'CRM & payment webhooks' },
    { title: 'Vector Memory', desc: 'Semantic retrieval cache' }
  ];

  return (
    <div className="relative w-full min-h-[580px] rounded-3xl bg-slate-950/70 border border-slate-800/80 overflow-hidden flex flex-col p-6 lg:p-8 space-y-6">
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      {/* Top Header Placeholder */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-purple-300 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white font-display">Neural Architecture Pipeline</h4>
            <span className="text-xs font-mono text-purple-300">Synchronizing 120+ Synapse Nodes</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Active Cognitive Flow</span>
        </div>
      </div>

      {/* Main 3D Brain Stage & Engine Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
        {/* Left: 3D Brain Core Placeholder (7 cols) */}
        <div className="lg:col-span-7 h-[360px] sm:h-[420px] rounded-2xl bg-slate-900/60 border border-slate-800/80 relative flex items-center justify-center overflow-hidden">
          {/* Ambient Pulse Ring */}
          <div className="absolute w-64 h-64 rounded-full border border-purple-500/30 animate-pulse-glow" />
          <div className="absolute w-48 h-48 rounded-full border border-dashed border-cyan-400/30 animate-radar" />

          {/* Central Neural Core Icon */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/50 flex flex-col items-center justify-center shadow-xl">
            <Sparkles className="w-8 h-8 text-purple-300 animate-pulse mb-1" />
            <span className="text-[10px] font-mono text-purple-200 font-bold">GEMINI NLU</span>
          </div>

          <div className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
            Mapping Cortical Synapses...
          </div>
        </div>

        {/* Right: Engine Subsystem List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {engines.map((eng, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between animate-shimmer"
            >
              <div>
                <span className="text-xs font-bold text-slate-200 block">{eng.title}</span>
                <span className="text-[11px] text-slate-400">{eng.desc}</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 4. ThreeDPipelineSkeleton: Skeleton for Audio Process Pipeline 3D
 */
export const ThreeDPipelineSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-3xl bg-slate-950/70 border border-slate-800/80 p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-300 font-bold">Interactive Telephony Pipeline</span>
          <h3 className="text-xl font-bold text-white font-display">Sub-300ms Glass-to-Glass Processing</h3>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Stage Synced</span>
        </div>
      </div>

      {/* 5-Step Pipeline Strip Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {['1. Acoustic Capture', '2. Streaming STT', '3. Gemini NLU', '4. Tool Execution', '5. Emotion TTS'].map(
          (step, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-32 animate-shimmer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyan-300 font-bold">Stage 0{i + 1}</span>
                <div className="w-2 h-2 rounded-full bg-cyan-400/80 animate-ping" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{step}</span>
                <span className="text-[10px] font-mono text-slate-400">~{25 + i * 20}ms latency</span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

/**
 * 5. ThreeDGlobeSkeleton: Skeleton for Analytics Earth Globe
 */
export const ThreeDGlobeSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[520px] lg:h-[620px] rounded-3xl bg-slate-950/70 border border-slate-800/80 overflow-hidden flex flex-col p-6 lg:p-8 space-y-6">
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <Globe className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white font-display">Global Telephony Hubs</h4>
            <span className="text-xs font-mono text-cyan-300">Connecting 8 Worldwide PoPs</span>
          </div>
        </div>

        <div className="bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-Time Stream Active</span>
        </div>
      </div>

      {/* Main Globe Stage */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Wireframe Rotating Circular Rings */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-dashed border-cyan-500/30 animate-radar" />
        <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-purple-500/25 animate-pulse" />

        {/* Center Globe Sphere Placeholder */}
        <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-[#0B1033] via-[#121A52] to-[#0A0E2A] border border-cyan-500/40 flex flex-col items-center justify-center shadow-2xl shadow-cyan-950/40">
          <Globe className="w-12 h-12 text-cyan-400/60 animate-pulse mb-2" />
          <span className="text-xs font-mono text-cyan-200 font-bold">INITIALIZING GLOBE</span>
          <span className="text-[10px] font-mono text-slate-400">Loading Geometry Buffers</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 6. AnalyticsDashboardSkeleton: Skeleton for Admin Live Ops & Analytics Center
 */
export const AnalyticsDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full">
      {/* 4 Shimmering KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Self-Service Resolution', defaultVal: '94.2%' },
          { label: 'Average Handle Time', defaultVal: '1m 14s' },
          { label: 'First Contact CSAT', defaultVal: '4.85 / 5.0' },
          { label: 'Monthly Net Savings', defaultVal: '$482,900' }
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 animate-shimmer space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400 uppercase font-medium">{kpi.label}</span>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="h-8 w-28 bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-3 w-36 bg-slate-800/80 rounded-full" />
          </div>
        ))}
      </div>

      {/* 2 Big Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Inbound Intents Skeleton */}
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 animate-shimmer space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 w-40 bg-slate-800 rounded" />
            <div className="h-3 w-20 bg-slate-800 rounded" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <div className="h-3 w-48 bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-800 rounded" />
                </div>
                <div className="w-full h-2.5 bg-slate-800/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500/40 rounded-full animate-pulse"
                    style={{ width: `${80 - i * 18}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sentiment Curve Skeleton */}
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 animate-shimmer flex flex-col justify-between space-y-4">
          <div>
            <div className="h-4 w-44 bg-slate-800 rounded mb-2" />
            <div className="h-3 w-full bg-slate-800/60 rounded mb-1" />
            <div className="h-3 w-3/4 bg-slate-800/60 rounded" />
          </div>

          <div className="h-32 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-20" />
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <BarChart3 className="w-4 h-4 animate-bounce" />
              <span>Synthesizing Real-Time Telephony Analytics Stream...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
