import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Play, Pause, Trash2, Search, Filter, Download, Plus, 
  CheckCircle2, AlertTriangle, AlertCircle, Info, Zap, ShieldCheck, 
  Mic, BrainCircuit, HeartHandshake, PhoneCall, RefreshCw, Copy, Check, ArrowDown
} from 'lucide-react';
import { systemLogService, LogEntry, LogLevel } from '../../services/systemLogService';

export interface TelephonyStreamEvent {
  id: string;
  timestamp: string;
  rawTime: number;
  level: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  category: 'biometrics' | 'sentiment' | 'intent' | 'telephony' | 'crm';
  eventType: string; // e.g., 'Voice Biometric Match Success', 'Sentiment Analysis Low Confidence'
  callerPhone: string;
  sessionId: string;
  message: string;
  confidenceScore?: number;
  latencyMs?: number;
  metadata: Record<string, any>;
}

const PRESET_TELEPHONY_EVENTS: Array<Omit<TelephonyStreamEvent, 'id' | 'timestamp' | 'rawTime'>> = [
  {
    level: 'SUCCESS',
    category: 'biometrics',
    eventType: 'Voice Biometric Match Success',
    callerPhone: '+1 (555) 234-5678',
    sessionId: 'SESS-8921-A',
    message: 'Acoustic frequency harmonic match verified against encrypted voiceprint DB.',
    confidenceScore: 0.984,
    latencyMs: 142,
    metadata: {
      accountHolder: 'John Smith',
      accountNumber: 'ACC-12093',
      voiceMatchRatio: '98.4%',
      livenessCheck: 'PASSED',
      spectralPurity: 0.94
    }
  },
  {
    level: 'WARNING',
    category: 'sentiment',
    eventType: 'Sentiment Analysis Low Confidence',
    callerPhone: '+1 (555) 890-1234',
    sessionId: 'SESS-8922-B',
    message: 'Caller tone shift detected with mixed acoustic signals. Escalating to Sentiment Guard.',
    confidenceScore: 0.42,
    latencyMs: 188,
    metadata: {
      detectedTone: 'Frustrated / Impatient',
      pacingRatio: '1.45x baseline',
      pitchVariance: 'High (320Hz peak)',
      fallbackAction: 'Enable empathetic prosody & offer 1-click agent transfer'
    }
  },
  {
    level: 'SUCCESS',
    category: 'intent',
    eventType: 'Multi-Slot Intent Extraction',
    callerPhone: '+1 (555) 345-6789',
    sessionId: 'SESS-8923-C',
    message: 'Gemini 3.8 NLU extracted primary intent track_shipment and 2 required slots.',
    confidenceScore: 0.965,
    latencyMs: 210,
    metadata: {
      primaryIntent: 'track_shipment',
      extractedSlots: { order_number: 'ORD-45678', carrier: 'UPS' },
      disambiguationNeeded: false
    }
  },
  {
    level: 'INFO',
    category: 'telephony',
    eventType: 'Acoustic Echo Cancellation Lock',
    callerPhone: '+1 (555) 678-9012',
    sessionId: 'SESS-8924-D',
    message: 'WebRTC duplex audio channel locked at 48kHz Opus. AEC noise floor reduced by -26dB.',
    latencyMs: 18,
    metadata: {
      codec: 'Opus 48kHz duplex',
      jitterBufferMs: 12,
      packetLossRatio: '0.01%',
      frameSizeMs: 20
    }
  },
  {
    level: 'SUCCESS',
    category: 'crm',
    eventType: 'Stripe Refund API Execution',
    callerPhone: '+1 (555) 901-2345',
    sessionId: 'SESS-8925-E',
    message: 'Autonomous credit of $149.00 processed via Stripe webhook (PCI-DSS compliant).',
    latencyMs: 312,
    metadata: {
      httpStatus: 200,
      chargeId: 'ch_3M4k92xL01p',
      refundAmount: '$149.00 USD',
      pciRedacted: true
    }
  },
  {
    level: 'WARNING',
    category: 'biometrics',
    eventType: 'Passive Liveness Anti-Spoof Warning',
    callerPhone: '+1 (555) 111-2233',
    sessionId: 'SESS-8926-F',
    message: 'Background synthetic voice artifact detected. Requesting secondary passcode verification.',
    confidenceScore: 0.61,
    latencyMs: 165,
    metadata: {
      syntheticSpectralScore: 0.39,
      riskLevel: 'MEDIUM',
      secondaryAuth: 'SMS_OTP_PROMPT'
    }
  },
  {
    level: 'ERROR',
    category: 'crm',
    eventType: 'Logistics Endpoint Timeout Warning',
    callerPhone: '+1 (555) 444-5566',
    sessionId: 'SESS-8927-G',
    message: 'UPS logistics API took >800ms. Retrying via secondary FedEx gateway backup.',
    latencyMs: 820,
    metadata: {
      attempt: 1,
      maxAttempts: 3,
      backupGateway: 'FedEx_REST_v2',
      fallbackResponse: 'cached_estimated_delivery'
    }
  },
  {
    level: 'INFO',
    category: 'intent',
    eventType: 'Language Auto-Switch Triggered',
    callerPhone: '+1 (555) 777-8899',
    sessionId: 'SESS-8928-H',
    message: 'Caller seamlessly switched from English to Spanish (es-MX). Prompt context updated.',
    confidenceScore: 0.99,
    latencyMs: 95,
    metadata: {
      detectedLanguage: 'es-MX',
      accentMatch: 'Mexican Spanish',
      ttsVoiceProfile: 'es-MX-Neural2-A'
    }
  }
];

export const SystemEventStream: React.FC = () => {
  const [events, setEvents] = useState<TelephonyStreamEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeedMs, setStreamSpeedMs] = useState<number>(2000); // interval ms
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const streamContainerRef = useRef<HTMLDivElement>(null);

  // Initialize with seed events
  useEffect(() => {
    const now = Date.now();
    const seeded: TelephonyStreamEvent[] = PRESET_TELEPHONY_EVENTS.map((evt, index) => {
      const eventTime = now - (PRESET_TELEPHONY_EVENTS.length - index) * 3500;
      return {
        ...evt,
        id: `EVT-${eventTime}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(eventTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
        rawTime: eventTime
      };
    });
    setEvents(seeded);
  }, []);

  // Stream generator effect
  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      const randomPreset = PRESET_TELEPHONY_EVENTS[Math.floor(Math.random() * PRESET_TELEPHONY_EVENTS.length)];
      const now = Date.now();
      const randomCallerNum = Math.floor(Math.random() * 8999) + 1000;
      const randomSessNum = Math.floor(Math.random() * 8999) + 1000;

      const newEvent: TelephonyStreamEvent = {
        ...randomPreset,
        id: `EVT-${now}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(now).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
        rawTime: now,
        callerPhone: randomPreset.callerPhone.slice(0, -4) + randomCallerNum,
        sessionId: `SESS-${randomSessNum}-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`
      };

      setEvents(prev => [...prev.slice(-150), newEvent]); // Keep last 150 events
    }, streamSpeedMs);

    return () => clearInterval(timer);
  }, [isStreaming, streamSpeedMs]);

  // Auto scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  // Inject manual custom event
  const handleInjectEvent = (type: 'biometric_success' | 'sentiment_low' | 'crm_action' | 'sip_connect') => {
    const now = Date.now();
    let injected: Omit<TelephonyStreamEvent, 'id' | 'timestamp' | 'rawTime'>;

    if (type === 'biometric_success') {
      injected = {
        level: 'SUCCESS',
        category: 'biometrics',
        eventType: 'Voice Biometric Match Success',
        callerPhone: '+1 (555) 999-0011',
        sessionId: `SESS-${Math.floor(Math.random() * 9000) + 1000}-X`,
        message: 'Acoustic voiceprint matched with 99.1% confidence. Account unlocked.',
        confidenceScore: 0.991,
        latencyMs: 112,
        metadata: { manualTrigger: true, verifiedBy: 'Spectral_Harmonic_Engine' }
      };
    } else if (type === 'sentiment_low') {
      injected = {
        level: 'WARNING',
        category: 'sentiment',
        eventType: 'Sentiment Analysis Low Confidence',
        callerPhone: '+1 (555) 888-2233',
        sessionId: `SESS-${Math.floor(Math.random() * 9000) + 1000}-Y`,
        message: 'Caller tone measured -0.76 (High Frustration). Switching to calm cadence.',
        confidenceScore: 0.38,
        latencyMs: 174,
        metadata: { manualTrigger: true, deescalationActive: true }
      };
    } else if (type === 'crm_action') {
      injected = {
        level: 'SUCCESS',
        category: 'crm',
        eventType: 'Salesforce CRM Record Updated',
        callerPhone: '+1 (555) 777-3344',
        sessionId: `SESS-${Math.floor(Math.random() * 9000) + 1000}-Z`,
        message: 'Flight change transaction logged to CRM record ACC-88120.',
        latencyMs: 240,
        metadata: { manualTrigger: true, status: 'SYNCED' }
      };
    } else {
      injected = {
        level: 'INFO',
        category: 'telephony',
        eventType: 'Inbound SIP Trunk Connection',
        callerPhone: '+1 (555) 666-4455',
        sessionId: `SESS-${Math.floor(Math.random() * 9000) + 1000}-S`,
        message: 'New incoming voice call connected on SIP channel #04.',
        latencyMs: 24,
        metadata: { manualTrigger: true, carrier: 'Twilio_SIP' }
      };
    }

    const fullEvent: TelephonyStreamEvent = {
      ...injected,
      id: `EVT-${now}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(now).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
      rawTime: now
    };

    setEvents(prev => [...prev, fullEvent]);
  };

  const handleCopyJson = (event: TelephonyStreamEvent) => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telephony_event_stream_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter logic
  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || evt.level === selectedLevel;
    const matchesQuery = 
      evt.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.callerPhone.includes(searchQuery) ||
      evt.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesQuery;
  });

  // Calculate statistics
  const successCount = events.filter(e => e.level === 'SUCCESS').length;
  const warningCount = events.filter(e => e.level === 'WARNING').length;
  const errorCount = events.filter(e => e.level === 'ERROR').length;
  const infoCount = events.filter(e => e.level === 'INFO').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Stream Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Stream Status</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-sm font-bold font-mono text-white">
                {isStreaming ? 'STREAMING' : 'PAUSED'}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/30">
            {(1000 / streamSpeedMs).toFixed(1)} evt/s
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Logged</span>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
            {events.length} <span className="text-xs text-slate-400 font-normal">events</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Success Events</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {successCount} <span className="text-xs text-emerald-300/70 font-normal">({events.length ? Math.round((successCount/events.length)*100) : 0}%)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Warnings & Low Conf.</span>
          <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
            {warningCount} <span className="text-xs text-amber-300/70 font-normal">alerts</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">API / Net Errors</span>
          <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
            {errorCount} <span className="text-xs text-rose-300/70 font-normal">exceptions</span>
          </div>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Stream Play/Pause & Speed */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
                isStreaming
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
            </button>

            <select
              value={streamSpeedMs}
              onChange={(e) => setStreamSpeedMs(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value={3000}>Speed: Slow (0.33 evt/s)</option>
              <option value={2000}>Speed: Normal (0.50 evt/s)</option>
              <option value={1000}>Speed: Fast (1.00 evt/s)</option>
              <option value={500}>Speed: Rapid (2.00 evt/s)</option>
            </select>

            <button
              onClick={() => setEvents([])}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all cursor-pointer"
              title="Clear Event Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExportLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Quick Manual Injection Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Inject:</span>
            <button
              onClick={() => handleInjectEvent('biometric_success')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Biometric Match</span>
            </button>
            <button
              onClick={() => handleInjectEvent('sentiment_low')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <HeartHandshake className="w-3 h-3" />
              <span>Low Confidence Sentiment</span>
            </button>
            <button
              onClick={() => handleInjectEvent('crm_action')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300 hover:bg-purple-500/25 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              <span>CRM Webhook</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-800">
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by event type, caller ID, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="sm:col-span-7 flex flex-wrap items-center gap-2 justify-end text-xs font-mono">
            {/* Category Filter Pills */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['all', 'biometrics', 'sentiment', 'intent', 'telephony', 'crm'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer text-[11px] ${
                    selectedCategory === cat 
                      ? 'bg-cyan-500 text-slate-950 font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Level: All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>

            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                autoScroll 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
              title="Toggle Auto-scroll to bottom"
            >
              <ArrowDown className="w-3 h-3" />
              <span>Auto-Scroll</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Real-Time Log Terminal Display */}
      <div 
        ref={streamContainerRef}
        className="bg-[#050814] rounded-2xl border border-slate-800/90 p-4 font-mono text-xs max-h-[520px] min-h-[380px] overflow-y-auto space-y-2.5 shadow-2xl relative"
      >
        {filteredEvents.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Terminal className="w-8 h-8 opacity-40 text-cyan-400" />
            <p className="text-xs">No telephony stream events matching current filter rules.</p>
          </div>
        ) : (
          filteredEvents.map(evt => {
            const isExpanded = expandedEventId === evt.id;
            const isCopied = copiedId === evt.id;

            let badgeStyle = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
            let icon = <Info className="w-3.5 h-3.5 text-cyan-400" />;

            if (evt.level === 'SUCCESS') {
              badgeStyle = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
              icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
            } else if (evt.level === 'WARNING') {
              badgeStyle = "bg-amber-500/15 text-amber-300 border-amber-500/30";
              icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
            } else if (evt.level === 'ERROR') {
              badgeStyle = "bg-rose-500/15 text-rose-300 border-rose-500/30";
              icon = <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
            }

            return (
              <div
                key={evt.id}
                className={`p-3 rounded-xl border transition-all ${
                  isExpanded 
                    ? 'bg-slate-900/95 border-cyan-400 shadow-lg shadow-cyan-950/40' 
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Event Summary Line */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Timestamp */}
                    <span className="text-[11px] text-slate-400 font-mono">[{evt.timestamp}]</span>

                    {/* Level Badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${badgeStyle}`}>
                      {icon}
                      <span>{evt.level}</span>
                    </span>

                    {/* Category Tag */}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-purple-500/20 capitalize font-medium">
                      {evt.category}
                    </span>

                    {/* Event Type Title */}
                    <span className="text-xs font-bold text-white tracking-tight">
                      {evt.eventType}
                    </span>
                  </div>

                  {/* Metadata / Action controls */}
                  <div className="flex items-center gap-2">
                    {evt.confidenceScore !== undefined && (
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                        Conf: {(evt.confidenceScore * 100).toFixed(1)}%
                      </span>
                    )}

                    {evt.latencyMs !== undefined && (
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                        {evt.latencyMs}ms
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      {evt.callerPhone}
                    </span>

                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-all cursor-pointer"
                    >
                      {isExpanded ? 'Hide Payload' : 'Inspect Payload'}
                    </button>

                    <button
                      onClick={() => handleCopyJson(evt)}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Copy JSON Payload"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-mono pl-1 border-l-2 border-slate-800">
                  {evt.message}
                </p>

                {/* Expanded JSON Payload Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold uppercase text-cyan-300">Detailed Telemetry Payload</span>
                      <span>Session ID: {evt.sessionId}</span>
                    </div>

                    <pre className="p-3 bg-[#02040A] rounded-lg border border-slate-800 text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
                      {JSON.stringify({
                        eventId: evt.id,
                        eventType: evt.eventType,
                        category: evt.category,
                        timestamp: evt.timestamp,
                        rawEpochMs: evt.rawTime,
                        callerPhone: evt.callerPhone,
                        sessionId: evt.sessionId,
                        confidenceScore: evt.confidenceScore,
                        latencyMs: evt.latencyMs,
                        payloadMetadata: evt.metadata
                      }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
