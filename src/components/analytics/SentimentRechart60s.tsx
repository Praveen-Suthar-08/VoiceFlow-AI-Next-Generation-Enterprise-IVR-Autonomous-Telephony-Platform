import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Activity, TrendingUp, Sparkles, Radio } from 'lucide-react';

export interface SentimentRechartPoint {
  time: string; // e.g. "21:54:30"
  timestampMs: number;
  positive: number;  // 0 - 100
  negative: number;  // 0 - 100
  netPolarity: number; // -100 to +100
}

interface SentimentRechart60sProps {
  selectedHubName?: string;
}

export const SentimentRechart60s: React.FC<SentimentRechart60sProps> = ({ 
  selectedHubName = 'San Francisco' 
}) => {
  const [data, setData] = useState<SentimentRechartPoint[]>([]);
  const [isLive, setIsLive] = useState<boolean>(true);

  // Initialize 60 seconds of second-by-second sentiment data
  useEffect(() => {
    const points: SentimentRechartPoint[] = [];
    const now = Date.now();

    for (let i = 59; i >= 0; i--) {
      const t = new Date(now - i * 1000);
      const timeStr = t.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Generate realistic natural acoustic sentiment fluctuation with high positive bias
      const basePos = 76 + Math.sin(i * 0.18) * 9 + (Math.random() * 4 - 2);
      const positive = Math.max(55, Math.min(96, Math.round(basePos)));
      const negative = Math.max(3, Math.min(28, Math.round(100 - positive - (8 + Math.random() * 4))));
      const netPolarity = positive - negative;

      points.push({
        time: timeStr,
        timestampMs: t.getTime(),
        positive,
        negative,
        netPolarity
      });
    }

    setData(points);
  }, [selectedHubName]);

  // Live second-by-second ticker update over rolling 60s window
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setData(prev => {
        if (prev.length === 0) return prev;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const last = prev[prev.length - 1];
        const delta = (Math.random() - 0.48) * 3.5;
        const positive = Math.max(58, Math.min(97, Math.round(last.positive + delta)));
        const negative = Math.max(3, Math.min(30, Math.round(100 - positive - (6 + Math.random() * 4))));
        const netPolarity = positive - negative;

        const newPoint: SentimentRechartPoint = {
          time: timeStr,
          timestampMs: now.getTime(),
          positive,
          negative,
          netPolarity
        };

        // Maintain rolling 60-second window (60 data points)
        return [...prev.slice(1), newPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const latestPoint = data[data.length - 1] || { positive: 78, negative: 12, netPolarity: 66, time: 'Now' };

  return (
    <div className="w-full bg-[#070B28]/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 p-5 sm:p-6 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/90 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20">
            <Activity className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white font-display tracking-tight">
                60-Second Real-Time Sentiment Trend (Recharts)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-bold uppercase">
                Recharts 60s Stream
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              High-frequency acoustic sentiment & net polarity rolling over last 60 seconds for <span className="text-cyan-300 font-bold">{selectedHubName} PoP</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              isLive
                ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isLive ? '60s Live: ACTIVE' : '60s Live: PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Latest Net Polarity</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300">+{latestPoint.netPolarity}</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> High
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Positive Sentiment
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">{latestPoint.positive}%</span>
            <span className="text-[10px] font-mono text-slate-400">Real-time</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Friction / Negative
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-400">{latestPoint.negative}%</span>
            <span className="text-[10px] font-mono text-slate-400">&lt; 160ms De-escalation</span>
          </div>
        </div>
      </div>

      {/* Recharts Chart Container */}
      <div className="w-full h-64 bg-slate-950/95 rounded-2xl border border-slate-800 p-3 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />

            <XAxis 
              dataKey="time" 
              stroke="#64748B" 
              tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'monospace' }}
              interval={9}
            />

            <YAxis 
              domain={[0, 100]} 
              stroke="#64748B" 
              tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'monospace' }}
              unit="%"
            />

            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950/95 border-2 border-cyan-400/80 p-3 rounded-2xl shadow-2xl backdrop-blur-2xl text-xs font-mono space-y-1.5 min-w-[180px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-slate-400">
                        <span className="font-bold text-white">Time: {label}</span>
                        <span className="text-cyan-300 font-extrabold">60s Sample</span>
                      </div>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span style={{ color: entry.color }} className="font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name}:
                          </span>
                          <span className="font-black text-white">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area 
              type="monotone" 
              dataKey="positive" 
              name="Positive Sentiment" 
              stroke="#10B981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorPositive)" 
            />

            <Area 
              type="monotone" 
              dataKey="negative" 
              name="Friction / Negative" 
              stroke="#F43F5E" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorNegative)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Explainer note */}
      <div className="flex items-center gap-2 text-xs text-cyan-300/90 font-mono bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Live Recharts Integration:</strong> High-frequency 1Hz polling renders sub-second acoustic sentiment trends directly beside 3D WebGL PoP nodes.
        </span>
      </div>
    </div>
  );
};
