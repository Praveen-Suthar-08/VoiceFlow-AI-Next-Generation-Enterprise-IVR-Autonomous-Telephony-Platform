import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Copy, 
  Check, 
  Pause, 
  Play, 
  Search, 
  Activity, 
  Zap, 
  Cpu, 
  Database,
  Radio
} from 'lucide-react';
import { systemLogService, LogEntry, TelemetryMetrics, LogLevel } from '../../services/systemLogService';

export const SystemLogOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpandedFull, setIsExpandedFull] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<TelemetryMetrics>(systemLogService.getMetrics());
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const terminalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = systemLogService.subscribe((newLogs, newMetrics) => {
      if (!isPaused) {
        setLogs(newLogs);
      }
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, [isPaused]);

  // Close overlay on global Esc key (app:close-modals event)
  useEffect(() => {
    const handleClose = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('app:close-modals', handleClose);
    return () => window.removeEventListener('app:close-modals', handleClose);
  }, [isOpen]);

  // Copy logs
  const handleCopyLogs = () => {
    const text = logs
      .map(l => `[${l.timestamp}] [${l.level}] ${l.message} ${l.latencyMs ? `(Latency: ${l.latencyMs}ms)` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Clear logs
  const handleClear = () => {
    systemLogService.clear();
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (selectedFilter !== 'ALL' && log.level !== selectedFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchMeta = log.metadata ? JSON.stringify(log.metadata).toLowerCase().includes(q) : false;
      return matchMsg || matchMeta;
    }
    return true;
  });

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'GEMINI':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">GEMINI</span>;
      case 'TOKENS':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">TOKENS</span>;
      case 'LATENCY':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">LATENCY</span>;
      case 'AUDIO':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">AUDIO</span>;
      case 'CRM':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">CRM_ACT</span>;
      case 'WARN':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">WARN</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600/50">INFO</span>;
    }
  };

  return (
    <>
      {/* 1. Minimized Floating Trigger Pill */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border border-cyan-500/40 bg-[#060A1D]/90 hover:bg-[#0A102E] text-slate-200 shadow-xl shadow-cyan-950/40 hover:shadow-cyan-500/20 transition-all cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <Terminal className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">System Log</span>
              <span className="hidden sm:inline-block text-slate-500">|</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">{metrics.lastLatencyMs}ms</span>
              </span>
              <span className="hidden sm:inline-block text-slate-500">|</span>
              <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
                <Database className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300 font-semibold">{metrics.totalTokens.toLocaleString()} tok</span>
              </span>
            </div>

            <div className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 font-bold ml-1">
              LIVE
            </div>

            <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      )}

      {/* 2. Expanded Floating Terminal Overlay */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ${
            isExpandedFull
              ? 'inset-3 sm:inset-6 max-w-none'
              : 'bottom-4 right-3 left-3 sm:left-auto sm:right-6 sm:w-[700px] lg:w-[820px] h-[520px] max-h-[82vh]'
          }`}
        >
          <div className="w-full h-full flex flex-col rounded-3xl glass-card border border-slate-700/90 bg-[#040714]/95 backdrop-blur-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden">
            
            {/* Top Terminal Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#070D24]/90 select-none">
              <div className="flex items-center gap-2.5">
                {/* Cyber window buttons */}
                <div className="flex items-center gap-1.5 mr-1">
                  <button 
                    onClick={() => setIsOpen(false)}
                    title="Minimize" 
                    className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors"
                  />
                  <button 
                    onClick={handleClear}
                    title="Clear Log" 
                    className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer transition-colors"
                  />
                  <button 
                    onClick={() => setIsExpandedFull(!isExpandedFull)}
                    title="Toggle Expand" 
                    className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer transition-colors"
                  />
                </div>

                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs text-slate-300 font-bold hidden sm:inline">
                  voiceflow@telephony-bridge: <span className="text-cyan-300">~/gemini-3.8-flash/logs</span>
                </span>
                <span className="font-mono text-xs text-slate-300 font-bold sm:hidden">
                  System Logs
                </span>
              </div>

              {/* Status pill & Controls */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isPaused ? '' : 'animate-ping'}`} />
                  <span>{isPaused ? 'PAUSED' : 'STREAMING'}</span>
                </div>

                {/* Pause/Resume button */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  title={isPaused ? "Resume Live Feed" : "Pause Live Feed"}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                {/* Copy logs */}
                <button
                  onClick={handleCopyLogs}
                  title="Copy Logs to Clipboard"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Clear */}
                <button
                  onClick={handleClear}
                  title="Clear Console"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Full screen toggle */}
                <button
                  onClick={() => setIsExpandedFull(!isExpandedFull)}
                  title={isExpandedFull ? "Restore Size" : "Full Screen"}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors hidden sm:inline-flex"
                >
                  {isExpandedFull ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Close/Minimize */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize System Log"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Real-time Telemetry HUD Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#030612] border-b border-slate-800/80 font-mono">
              {/* Latency Metric */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-Time Latency</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    &lt;240ms SLA
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-emerald-400">{metrics.lastLatencyMs}ms</span>
                  <span className="text-[10px] text-slate-500">(avg: {metrics.avgLatencyMs}ms)</span>
                </div>
              </div>

              {/* Token Audit Metric */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cumulative Tokens</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Audit
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-amber-300">{metrics.totalTokens.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">
                    {metrics.totalPromptTokens} in / {metrics.totalCompletionTokens} out
                  </span>
                </div>
              </div>

              {/* Inference Speed */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Generation Speed</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Gemini 3.8
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-cyan-300">{metrics.tokensPerSec}</span>
                  <span className="text-[10px] text-slate-400">tokens / sec</span>
                </div>
              </div>

              {/* Events & Pipeline */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-purple-400" />
                    <span>Events Captured</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Real-Time
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-purple-300">{metrics.eventCount}</span>
                  <span className="text-[10px] text-slate-400">{metrics.activeModel}</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#060B1E] border-b border-slate-800/80 font-mono text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {['ALL', 'GEMINI', 'TOKENS', 'LATENCY', 'AUDIO', 'CRM'].map(lvl => {
                  const isSelected = selectedFilter === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>

              {/* Search filter input */}
              <div className="relative flex items-center min-w-[170px] sm:min-w-[210px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter logs or tokens..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Log Stream Body */}
            <div 
              ref={terminalScrollRef}
              className="flex-1 p-3.5 overflow-y-auto space-y-2 bg-[#020510] font-mono text-xs select-text scrollbar-thin scrollbar-thumb-slate-800"
            >
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
                  <Terminal className="w-8 h-8 opacity-40 text-slate-400" />
                  <p className="text-xs">No matching system log events found.</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-cyan-400 text-xs hover:underline cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              ) : (
                filteredLogs.map(log => {
                  const isExpanded = expandedLogId === log.id;
                  const hasDetails = !!log.metadata || !!log.tokens;

                  return (
                    <div 
                      key={log.id} 
                      className="p-2 rounded-xl bg-slate-950/70 border border-slate-900 hover:border-slate-800 transition-colors group"
                    >
                      <div className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-slate-500 shrink-0 text-[11px] select-none pt-0.5">
                          {log.timestamp}
                        </span>

                        <span className="shrink-0 pt-0.5">
                          {getLevelBadge(log.level)}
                        </span>

                        <div className="flex-1 text-slate-200 break-words text-xs">
                          <span>{log.message}</span>
                          
                          {log.latencyMs && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              <Activity className="w-3 h-3" />
                              {log.latencyMs}ms
                            </span>
                          )}

                          {hasDetails && (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="ml-2 text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                            >
                              {isExpanded ? '[- Hide Payload]' : '[+ View Payload]'}
                            </button>
                          )}

                          {/* Expanded JSON Inspector */}
                          {isExpanded && (
                            <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-cyan-200 overflow-x-auto">
                              <pre className="font-mono">
                                {JSON.stringify(
                                  {
                                    id: log.id,
                                    timestamp: log.timestamp,
                                    level: log.level,
                                    latencyMs: log.latencyMs,
                                    tokens: log.tokens,
                                    metadata: log.metadata
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#050818] border-t border-slate-800 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white font-semibold">WebRTC Gateway</span>: Connected
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="hidden sm:inline text-slate-400">
                  Buffer: <strong className="text-cyan-300">{logs.length}</strong> / 250
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Model:</span>
                <span className="text-cyan-300 font-bold">gemini-3.8-flash</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
