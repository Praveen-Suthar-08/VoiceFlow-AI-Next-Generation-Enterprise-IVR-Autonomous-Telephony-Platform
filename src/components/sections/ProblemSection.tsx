import React from 'react';
import { ShatteredPhoneKeypad } from '../3d/ShatteredPhoneKeypad';
import { XCircle, CheckCircle2, Clock, AlertOctagon, Frown, Sparkles } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <section id="problem" className="py-2 w-full space-y-6">
      <div className="text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-200 font-mono text-xs font-semibold shadow-md shadow-red-500/10">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <span>The Traditional IVR Crisis</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
          Why "Press 1 for Billing, Press 2 for Support" Is Costing Millions
        </h2>

        <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-normal">
          Legacy interactive voice response systems were invented in the 1970s. Today, customers expect instant comprehension, emotional nuance, and autonomous problem resolution.
        </p>
      </div>

      {/* 3D Shattered Keypad & Real Frustration Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        {/* 3D Model Interactive Keypad (6 cols) */}
        <div className="lg:col-span-6 w-full">
          <ShatteredPhoneKeypad />
        </div>

        {/* Comparison Feature Matrix (6 cols) */}
        <div className="lg:col-span-6 space-y-4 w-full">
          <div className="p-5 rounded-2xl glass-card border border-red-500/40 bg-red-950/25 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-red-300 font-mono text-sm font-bold">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Legacy Touch-Tone Phone Trees</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200 font-sans">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold text-base leading-none">•</span>
                <span><strong className="text-white">Rigid Menus:</strong> Average 2.5 minutes wasted pressing keypad numbers in confusing sub-branches</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold text-base leading-none">•</span>
                <span><strong className="text-white">Zero Context:</strong> Repeat callers must explain their entire history and verification from scratch</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold text-base leading-none">•</span>
                <span><strong className="text-white">Robotic Tone:</strong> Distressed callers receive the same flat, emotionless tone, driving up escalations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold text-base leading-none">•</span>
                <span><strong className="text-white">High Misroute Rate:</strong> 30%+ of calls routed to the wrong department, wasting agent time</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-cyan-400/50 bg-cyan-950/25 space-y-3 shadow-xl shadow-cyan-950/30">
            <div className="flex items-center gap-2 text-cyan-200 font-mono text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>VoiceFlow Gemini AI Orchestration</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-100 font-sans">
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold text-base leading-none">✓</span>
                <span><strong className="text-white">Natural Dialogue:</strong> Speak naturally in free-form language without rigid menus or keyword memorization</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold text-base leading-none">✓</span>
                <span><strong className="text-white">Predictive Memory:</strong> Instant detection of recent cancellations, order shipments, or open tickets upon ANI match</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold text-base leading-none">✓</span>
                <span><strong className="text-white">Emotion-Aware:</strong> Empathy-first calibration when distress or urgency is detected to calm frustrated callers</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold text-base leading-none">✓</span>
                <span><strong className="text-white">Autonomous Execution:</strong> Direct Stripe refunds, carrier tracking, and airline rebooking without waiting for humans</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

