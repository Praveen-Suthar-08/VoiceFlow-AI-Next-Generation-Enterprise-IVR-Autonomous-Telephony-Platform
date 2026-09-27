import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TrendingUp, TrendingDown, Activity, Sparkles, RefreshCw, Radio, Layers, Info } from 'lucide-react';

export interface SentimentDataPoint {
  timestamp: Date;
  positive: number; // percentage (0 - 100)
  negative: number; // percentage (0 - 100)
  neutral: number;  // percentage (0 - 100)
  polarityScore: number; // -100 to +100
  sampleIntent: string;
  volume: number;
}

interface RealtimeSentimentTrendChartProps {
  selectedHubName?: string;
}

export const RealtimeSentimentTrendChart: React.FC<RealtimeSentimentTrendChartProps> = ({ 
  selectedHubName = 'Global Network' 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h'>('15m');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [data, setData] = useState<SentimentDataPoint[]>([]);

  // Seed initial timeline points
  useEffect(() => {
    const points: SentimentDataPoint[] = [];
    const now = Date.now();
    const count = timeRange === '15m' ? 24 : timeRange === '1h' ? 30 : 36;
    const intervalMs = timeRange === '15m' ? 35000 : timeRange === '1h' ? 120000 : 2400000;

    const sampleIntents = [
      'Account Balance Check',
      'Instant UPS Tracking',
      'Autonomous Stripe Refund',
      'Flight Reschedule Request',
      'VIP Tier Verification',
      'Subscription Downgrade Inquiry',
      'Payment Failure Resolution'
    ];

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - i * intervalMs);
      // Realistic positive bias with slight natural oscillation
      const basePositive = 72 + Math.sin(i * 0.45) * 8 + (Math.random() * 6 - 3);
      const positive = Math.max(50, Math.min(94, Math.round(basePositive)));
      const negative = Math.max(4, Math.min(35, Math.round(100 - positive - (8 + Math.random() * 6))));
      const neutral = Math.max(2, 100 - positive - negative);
      const polarityScore = positive - negative;

      points.push({
        timestamp: time,
        positive,
        negative,
        neutral,
        polarityScore,
        sampleIntent: sampleIntents[i % sampleIntents.length],
        volume: Math.floor(400 + Math.random() * 350)
      });
    }

    setData(points);
  }, [timeRange, selectedHubName]);

  // Live streaming simulator ticker
  useEffect(() => {
    if (!isLiveStreaming) return;

    const timer = setInterval(() => {
      setData(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const nextTime = new Date(last.timestamp.getTime() + 15000);

        // Fluctuate gently around current sentiment
        const delta = (Math.random() - 0.48) * 4;
        const positive = Math.max(55, Math.min(95, Math.round(last.positive + delta)));
        const negative = Math.max(4, Math.min(32, Math.round(100 - positive - (6 + Math.random() * 5))));
        const neutral = Math.max(2, 100 - positive - negative);
        const polarityScore = positive - negative;

        const sampleIntents = [
          'Order Tracking Inquiry',
          'Autonomous Refund Executed',
          'Billing Address Verification',
          'Priority Customer Routing',
          'Technical Troubleshooting'
        ];

        const nextPoint: SentimentDataPoint = {
          timestamp: nextTime,
          positive,
          negative,
          neutral,
          polarityScore,
          sampleIntent: sampleIntents[Math.floor(Math.random() * sampleIntents.length)],
          volume: Math.floor(450 + Math.random() * 320)
        };

        const updated = [...prev.slice(1), nextPoint];
        return updated;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [isLiveStreaming]);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    if (data.length === 0) {
      return { avgPositive: 78, avgNegative: 14, currentPolarity: 64, trendDirection: 'up' };
    }
    const current = data[data.length - 1];
    const prev = data[0];
    const avgPos = Math.round(data.reduce((acc, d) => acc + d.positive, 0) / data.length);
    const avgNeg = Math.round(data.reduce((acc, d) => acc + d.negative, 0) / data.length);
    const diff = current.polarityScore - prev.polarityScore;

    return {
      avgPositive: avgPos,
      avgNegative: avgNeg,
      currentPolarity: current.polarityScore,
      currentPositive: current.positive,
      currentNegative: current.negative,
      trendDirection: diff >= 0 ? 'up' : 'down',
      trendDelta: Math.abs(diff)
    };
  }, [data]);

  // Render D3 SVG Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = 280;
    const margin = { top: 25, right: 35, bottom: 35, left: 45 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // Defs for gradients and glow filters
    const defs = svg.append('defs');

    // Positive Gradient Area (Emerald)
    const positiveGradient = defs.append('linearGradient')
      .attr('id', 'sentiment-pos-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    positiveGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10B981').attr('stop-opacity', 0.35);
    positiveGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10B981').attr('stop-opacity', 0.0);

    // Negative Gradient Area (Rose)
    const negativeGradient = defs.append('linearGradient')
      .attr('id', 'sentiment-neg-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    negativeGradient.append('stop').attr('offset', '0%').attr('stop-color', '#F43F5E').attr('stop-opacity', 0.30);
    negativeGradient.append('stop').attr('offset', '100%').attr('stop-color', '#F43F5E').attr('stop-opacity', 0.0);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    const yAxisGrid = d3.axisLeft(yScale)
      .tickSize(-(width - margin.left - margin.right))
      .tickFormat(() => '')
      .ticks(5);

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1E293B')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.7);

    svg.select('.grid .domain').remove();

    // Line and Area Generators
    const posAreaGen = d3.area<SentimentDataPoint>()
      .x(d => xScale(d.timestamp))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.positive))
      .curve(d3.curveMonotoneX);

    const negAreaGen = d3.area<SentimentDataPoint>()
      .x(d => xScale(d.timestamp))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.negative))
      .curve(d3.curveMonotoneX);

    const posLineGen = d3.line<SentimentDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.positive))
      .curve(d3.curveMonotoneX);

    const negLineGen = d3.line<SentimentDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.negative))
      .curve(d3.curveMonotoneX);

    // Render Gradient Areas
    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#sentiment-pos-gradient)')
      .attr('d', posAreaGen);

    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#sentiment-neg-gradient)')
      .attr('d', negAreaGen);

    // Render Positive Trend Line (Emerald)
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('d', posLineGen);

    // Render Negative Trend Line (Rose)
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#F43F5E')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', '4,2')
      .attr('d', negLineGen);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.max(4, Math.floor(width / 130)))
      .tickFormat(d => d3.timeFormat('%H:%M:%S')(d as Date));

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748B')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr('color', '#64748B')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Interactive Hover Overlay & Crosshair
    const focusGroup = svg.append('g').style('display', 'none');

    // Vertical cursor line
    const focusLine = focusGroup.append('line')
      .attr('stroke', '#00F0FF')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    // Positive dot
    const posDot = focusGroup.append('circle')
      .attr('r', 5)
      .attr('fill', '#10B981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Negative dot
    const negDot = focusGroup.append('circle')
      .attr('r', 5)
      .attr('fill', '#F43F5E')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Overlay rect to capture pointer events
    const bisectDate = d3.bisector((d: SentimentDataPoint) => d.timestamp).left;

    svg.append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseenter', () => {
        focusGroup.style('display', null);
        if (tooltipRef.current) tooltipRef.current.style.opacity = '1';
      })
      .on('mouseleave', () => {
        focusGroup.style('display', 'none');
        if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
      })
      .on('mousemove', (event) => {
        const [pointerX] = d3.pointer(event);
        const x0 = xScale.invert(pointerX);
        const i = bisectDate(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        if (!d0) return;
        const selected = (d1 && (x0.getTime() - d0.timestamp.getTime() > d1.timestamp.getTime() - x0.getTime())) ? d1 : d0;

        const xPos = xScale(selected.timestamp);
        const yPosPos = yScale(selected.positive);
        const yPosNeg = yScale(selected.negative);

        focusLine.attr('x1', xPos).attr('x2', xPos);
        posDot.attr('cx', xPos).attr('cy', yPosPos);
        negDot.attr('cx', xPos).attr('cy', yPosNeg);

        // Tooltip update
        if (tooltipRef.current) {
          const tt = tooltipRef.current;
          tt.style.left = `${Math.min(width - 240, Math.max(10, xPos - 110))}px`;
          tt.style.top = '10px';
          tt.innerHTML = `
            <div class="font-mono text-[11px] space-y-1">
              <div class="flex items-center justify-between border-b border-slate-700/80 pb-1 text-slate-400">
                <span>${selected.timestamp.toLocaleTimeString()}</span>
                <span class="text-cyan-300 font-bold">Net: +${selected.polarityScore}</span>
              </div>
              <div class="flex items-center justify-between pt-0.5">
                <span class="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Positive Polarity:
                </span>
                <span class="font-bold text-white">${selected.positive}%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                  Negative / Friction:
                </span>
                <span class="font-bold text-white">${selected.negative}%</span>
              </div>
              <div class="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex items-center justify-between">
                <span>Sample Intent:</span>
                <span class="text-cyan-200 truncate max-w-[120px]">${selected.sampleIntent}</span>
              </div>
            </div>
          `;
        }
      });

  }, [data]);

  return (
    <div className="w-full bg-[#080D28]/95 backdrop-blur-xl rounded-2xl border border-slate-700/80 p-4 sm:p-6 shadow-2xl space-y-5">
      
      {/* Header with Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white font-display tracking-tight flex items-center gap-2">
              <span>Real-Time Sentiment Polarity Trends</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-bold uppercase">
                D3.js
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans max-w-xl">
            Live polarity tracking of caller emotion across <span className="text-cyan-300 font-semibold">{selectedHubName}</span> streams. Demonstrates real-time satisfaction lift and autonomous de-escalation curves.
          </p>
        </div>

        {/* Live streaming indicator & timeframe selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              isLiveStreaming
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isLiveStreaming ? 'Live Stream: ACTIVE' : 'Stream: PAUSED'}</span>
          </button>

          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            {(['15m', '1h', '24h'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === t
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Net Polarity Score */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Net Polarity Index</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-cyan-300">+{metrics.currentPolarity}</span>
            <span className="inline-flex items-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              High Affinity
            </span>
          </div>
        </div>

        {/* Positive Sentiment */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Positive Polarity
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-emerald-400">{metrics.avgPositive}%</span>
            <span className="text-[10px] font-mono text-slate-400">Rolling Avg</span>
          </div>
        </div>

        {/* Negative / Friction */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Negative / Friction
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-rose-400">{metrics.avgNegative}%</span>
            <span className="text-[10px] font-mono text-emerald-400">-3.2% vs Legacy</span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Autonomous De-escalation</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-purple-300">94.8%</span>
            <span className="text-[10px] font-mono text-slate-400">0.0% Escalation</span>
          </div>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div ref={containerRef} className="relative w-full h-[280px] bg-slate-950/90 rounded-xl border border-slate-800 p-2 overflow-hidden">
        {/* Floating Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none transition-opacity duration-150 opacity-0 z-30 p-2.5 rounded-xl bg-[#0B0F2F]/95 border border-cyan-500/60 shadow-2xl backdrop-blur-md min-w-[210px]"
        />

        {/* D3 SVG Element */}
        <svg ref={svgRef} className="w-full h-full select-none" />

        {/* Chart Legend */}
        <div className="absolute bottom-2 right-4 flex items-center gap-4 text-[10px] font-mono bg-slate-950/90 px-3 py-1.5 rounded-lg border border-slate-800/80 text-slate-300 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" />
            <span className="text-emerald-300 font-bold">Positive Polarity %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-400 rounded-full border-t border-dashed border-rose-400" />
            <span className="text-rose-300 font-bold">Negative / Friction %</span>
          </div>
        </div>
      </div>

      {/* Insight Explainer Footnote */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-blue-200 font-mono">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] sm:text-xs">
          <strong>Autonomous Tone De-escalation in Action:</strong> Spikes in caller frustration (e.g. shipping delay or billing disputes) are detected in &lt;160ms by Gemini 3.8 Flash, triggering instant cadence slowdown, empathetic inflection adjustment, and automated 1-click resolution actions.
        </p>
      </div>

    </div>
  );
};
