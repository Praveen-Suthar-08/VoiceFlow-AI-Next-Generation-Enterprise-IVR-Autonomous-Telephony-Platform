import React, { useState } from 'react';
import { DollarSign, Check, Calculator, Sparkles, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';

export const PricingRoiSection: React.FC = () => {
  const [callVolume, setCallVolume] = useState<number>(25000);
  const [agentCostPerMin, setAgentCostPerMin] = useState<number>(1.20);
  const [avgHandleTimeMin, setAvgHandleTimeMin] = useState<number>(4.2);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'growth' | 'enterprise'>('growth');

  // ROI Calculations
  const humanTotalMonthlyCost = callVolume * avgHandleTimeMin * agentCostPerMin;
  const voiceFlowCostPerCall = 0.18; // ~$0.18/call with AI Studio + Gemini
  const voiceFlowMonthlyCost = (callVolume * voiceFlowCostPerCall) + (selectedTier === 'growth' ? 1999 : selectedTier === 'starter' ? 499 : 4999);
  const monthlySavings = Math.max(0, humanTotalMonthlyCost - voiceFlowMonthlyCost);
  const annualSavings = monthlySavings * 12;
  const hoursSavedMonthly = Math.round((callVolume * avgHandleTimeMin * 0.72) / 60);

  return (
    <div className="w-full space-y-12">
      {/* Interactive ROI Calculator Card */}
      <div className="rounded-3xl glass-card border border-cyan-500/30 p-6 lg:p-10 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0E1438] to-[#141A4E]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 border-b border-slate-700/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-2 font-bold">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Enterprise ROI Simulator</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight">
              Calculate Your Contact Center Cost Reductions
            </h3>
            <p className="text-slate-200 text-sm mt-1.5 font-normal">
              Based on empirical benchmark data of 70%+ self-service resolution on Gemini models.
            </p>
          </div>

          <div className="bg-cyan-500/20 border border-cyan-400/50 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-cyan-200 font-mono text-xs font-bold shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Avg 68% Lower Cost Per Interaction</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex justify-between items-center text-sm font-mono mb-2">
                <span className="text-slate-200 font-semibold">Monthly Inbound Call Volume:</span>
                <span className="text-cyan-300 font-bold text-lg bg-slate-900/90 px-3 py-1 rounded-lg border border-cyan-500/30">{callVolume.toLocaleString()} calls</span>
              </div>
              <input
                type="range"
                min="2000"
                max="200000"
                step="1000"
                value={callVolume}
                onChange={(e) => setCallVolume(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-1 font-semibold">
                <span>2,000</span>
                <span>50,000</span>
                <span>100,000</span>
                <span>200,000+</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-slate-200 font-medium">Agent Cost / Minute:</span>
                  <span className="text-purple-300 font-bold text-sm bg-purple-950/50 px-2.5 py-0.5 rounded border border-purple-500/40">${agentCostPerMin.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="3.00"
                  step="0.05"
                  value={agentCostPerMin}
                  onChange={(e) => setAgentCostPerMin(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-slate-200 font-medium">Avg Handle Time:</span>
                  <span className="text-emerald-300 font-bold text-sm bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-500/40">{avgHandleTimeMin.toFixed(1)} mins</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="8.0"
                  step="0.1"
                  value={avgHandleTimeMin}
                  onChange={(e) => setAvgHandleTimeMin(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/95 rounded-2xl border-2 border-cyan-400/50 p-6 sm:p-7 flex flex-col justify-between shadow-2xl shadow-cyan-950/40">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">Estimated Annual Savings</span>
              <div className="text-4xl sm:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400 mt-2 mb-3 tracking-tight">
                ${annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-4">
                Reduces monthly call center expenditure from{' '}
                <span className="text-rose-300 line-through font-mono font-bold">${humanTotalMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> down to{' '}
                <span className="text-emerald-300 font-extrabold font-mono text-base">${voiceFlowMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Queue Time Eliminated:</span>
                <span className="text-cyan-300 font-extrabold text-sm">{hoursSavedMonthly.toLocaleString()} hrs / mo</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Estimated CSAT Lift:</span>
                <span className="text-emerald-300 font-extrabold text-sm">+1.8 Stars</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

