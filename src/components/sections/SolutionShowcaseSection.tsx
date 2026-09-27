import React, { useState } from 'react';
import { NeuralBrainScene } from '../3d/NeuralBrainScene';
import { 
  Sparkles, 
  Brain, 
  Check, 
  X, 
  Search, 
  Zap, 
  ShieldCheck, 
  PhoneOff, 
  PhoneCall, 
  Bot, 
  Activity, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Globe,
  Clock
} from 'lucide-react';

interface FeatureComparison {
  id: string;
  category: 'nlu' | 'sentiment' | 'crm' | 'telephony' | 'handoff';
  categoryLabel: string;
  featureName: string;
  description: string;
  traditionalIvr: {
    title: string;
    detail: string;
    metric: string;
  };
  voiceflowAi: {
    title: string;
    detail: string;
    metric: string;
  };
  advantageBadge: string;
  deepTechnicalNote: string;
}

const COMPARISON_DATA: FeatureComparison[] = [
  {
    id: 'nlu_accents',
    category: 'nlu',
    categoryLabel: 'NLU & Accent Handling',
    featureName: 'Multi-Dialect Conversational NLU',
    description: 'Ability to comprehend natural conversational speech across diverse regional accents and dialects without rigid menus.',
    traditionalIvr: {
      title: 'Rigid DTMF Touch-Tone Menus',
      detail: 'Requires callers to press numbers (1 for Sales, 2 for Support). Fails completely on speech with regional accents or background noise.',
      metric: '42% First Contact Resolution'
    },
    voiceflowAi: {
      title: 'Gemini 3.8 Zero-Shot NLU Core',
      detail: 'Understands full natural sentences in 25+ global dialects (US, UK, Aus, India, Ireland, Spain, Mexico, Japan) with sub-240ms latency.',
      metric: '98.4% Intent Accuracy'
    },
    advantageBadge: '2.3x Resolution Boost',
    deepTechnicalNote: 'Phoneme vector embeddings are matched against multi-lingual intent graphs in real time using Gemini Flash models.'
  },
  {
    id: 'sentiment_prosody',
    category: 'sentiment',
    categoryLabel: 'Emotion Radar',
    featureName: 'Real-Time Frustration & De-escalation',
    description: 'Detects caller emotional trajectory and dynamically adjusts voice pitch, cadence, and empathy response.',
    traditionalIvr: {
      title: 'Monotone Static Scripts',
      detail: 'Plays back identical pre-recorded audio regardless of caller anger or distress, causing high hang-up rates.',
      metric: '0% De-escalation Rate'
    },
    voiceflowAi: {
      title: 'Acoustic Sentiment Radar',
      detail: 'Continuously scores anger (-1.0 to +1.0), urgency, and patience. Automatically shifts voice cadence to de-escalate high-tension calls.',
      metric: '64% Escalation Reduction'
    },
    advantageBadge: '-64% Agent Escalations',
    deepTechnicalNote: 'Multidimensional acoustic analysis extracts pitch jitter, speaking rate, and volume spikes to infer emotional valence.'
  },
  {
    id: 'crm_actions',
    category: 'crm',
    categoryLabel: 'Autonomous CRM Tools',
    featureName: 'Live Webhook & API Execution',
    description: 'Executes real business actions directly during the voice session (refunds, seat changes, order tracking).',
    traditionalIvr: {
      title: 'Read-Only Static Prompts',
      detail: 'Can only read basic balance numbers or transfer callers to a long human queue to complete actual tasks.',
      metric: '0 Autonomous Transactions'
    },
    voiceflowAi: {
      title: 'Real-Time Webhook Engine',
      detail: 'Triggers Stripe refunds, Sabre GDS flight rebookings, and FedEx tracking live on the call in < 1.5 seconds.',
      metric: '< 1.5s Transaction Time'
    },
    advantageBadge: '100% Self-Service Refunds',
    deepTechnicalNote: 'Tool calling schemas generate verified JSON function calls with PCI-DSS card masking and transactional retry logic.'
  },
  {
    id: 'speech_synthesis',
    category: 'telephony',
    categoryLabel: 'Speech Synthesis',
    featureName: 'Audio Bandwidth & Voice Realism',
    description: 'Acoustic voice quality, sample rate, and conversational flow without mechanical delay.',
    traditionalIvr: {
      title: 'Metallic 8kHz PSTN Prompts',
      detail: 'Spliced pre-recorded audio fragments resulting in choppy, unnatural phrasing and mechanical pauses.',
      metric: '8kHz PSTN Monotone'
    },
    voiceflowAi: {
      title: 'Neural 48kHz HD Speech',
      detail: 'Studio-grade HD audio with synthetic vs human-like neural voice toggle, natural breath pauses, and localized accent inflection.',
      metric: '48kHz Neural Audio'
    },
    advantageBadge: 'Studio-Grade Realism',
    deepTechnicalNote: 'Uses Web Audio API streaming buffers with continuous pitch modulation to prevent robotic stuttering.'
  },
  {
    id: 'warm_handoff',
    category: 'handoff',
    categoryLabel: 'Supervisory Handoff',
    featureName: 'Warm Agent Transfer Packets',
    description: 'Preserves full call history, sentiment metrics, and verified account slots when escalating to a human representative.',
    traditionalIvr: {
      title: 'Blind Cold Transfer',
      detail: 'Transfers call to agent queue with zero context. Agent is forced to ask caller to repeat name, account ID, and issue.',
      metric: '100% Caller Repetition'
    },
    voiceflowAi: {
      title: 'Structured Handoff Summary',
      detail: 'Pushes instant JSON summary packet, sentiment trajectory curve, and pre-filled CRM fields directly to supervisor browser.',
      metric: '0% Info Repetition'
    },
    advantageBadge: 'Saved 3.5 Min / Call',
    deepTechnicalNote: 'Context state is serialized into an encrypted JWT token and dispatched via WebSocket to the supervisor workspace.'
  },
  {
    id: 'edge_scalability',
    category: 'telephony',
    categoryLabel: 'Global Infrastructure',
    featureName: 'Edge Routing & Storm Bursting',
    description: 'Capacity to handle sudden traffic spikes during weather delays, outage spikes, or seasonal sales without drop-offs.',
    traditionalIvr: {
      title: 'Fixed Trunk Capacity Lines',
      detail: 'Hard line limits result in busy signals, dropped calls, and hour-long queue hold times during peak call spikes.',
      metric: 'Severe Peak Drops'
    },
    voiceflowAi: {
      title: 'Distributed 7-Hub Edge Network',
      detail: 'Auto-scales across San Francisco, NY, London, Frankfurt, Tokyo, Singapore, and Sydney hubs supporting 10,000+ parallel calls.',
      metric: '10,000+ Concurrent Calls'
    },
    advantageBadge: '99.99% Edge Availability',
    deepTechnicalNote: 'Geo-DNS routing distributes incoming SIP streams to the nearest edge hub with sub-200ms roundtrip delay.'
  }
];

export const SolutionShowcaseSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'voiceflow' | 'traditional'>('matrix');
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>('nlu_accents');

  const categories = [
    { id: 'all', label: 'All Capabilities' },
    { id: 'nlu', label: 'NLU & Accents' },
    { id: 'sentiment', label: 'Emotion Radar' },
    { id: 'crm', label: 'Autonomous CRM' },
    { id: 'telephony', label: 'Infrastructure & Voice' },
    { id: 'handoff', label: 'Agent Handoff' }
  ];

  const filteredFeatures = COMPARISON_DATA.filter(feat => {
    const matchesCategory = selectedCategory === 'all' || feat.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      feat.featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.voiceflowAi.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="architecture" className="py-2 w-full space-y-8">
      {/* 1. Header */}
      <div className="text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/40 text-purple-200 font-mono text-xs font-bold shadow-md shadow-purple-500/10">
          <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>Cognitive Architecture vs Legacy IVR</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
          Full Cognitive Orchestration for Enterprise Telephony
        </h2>

        <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-normal">
          Powered by Google's Gemini 3.8 models, VoiceFlow AI links perception, natural language understanding, dynamic dialogue management, CRM action tools, and continuous vector learning.
        </p>
      </div>

      {/* 2. 3D Neural Brain & Subsystems */}
      <NeuralBrainScene />

      {/* 3. Interactive Feature Comparison Matrix */}
      <div id="feature-comparison-matrix" className="w-full space-y-6 pt-6">
        <div className="rounded-3xl glass-card border border-cyan-500/30 p-6 sm:p-8 bg-gradient-to-b from-[#0B0F2F]/95 via-[#0E1438]/95 to-[#070A1E]/95 shadow-2xl relative overflow-hidden">
          
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-700/80 pb-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-2 font-bold">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Side-by-Side Architectural Capability Matrix</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                VoiceFlow AI vs. Traditional Legacy IVR
              </h3>
              <p className="text-slate-200 text-sm mt-1">
                Compare cognitive autonomy, sentiment responsiveness, and CRM tool execution side by side.
              </p>
            </div>

            {/* View Mode Toggle Switch */}
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-700/80 flex items-center gap-1 font-mono text-xs shadow-inner shrink-0">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                  viewMode === 'matrix'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Comparison Matrix</span>
              </button>
              <button
                onClick={() => setViewMode('voiceflow')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                  viewMode === 'voiceflow'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-slate-950" />
                <span>VoiceFlow AI Only</span>
              </button>
              <button
                onClick={() => setViewMode('traditional')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                  viewMode === 'traditional'
                    ? 'bg-rose-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <PhoneOff className="w-3.5 h-3.5 text-slate-950" />
                <span>Traditional IVR</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-6 border-b border-slate-800">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search capabilities..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-inner"
              />
            </div>
          </div>

          {/* Comparison Matrix Table Content */}
          <div className="space-y-4 pt-6">
            {filteredFeatures.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-mono text-sm">
                No matching capabilities found for "{searchQuery}".
              </div>
            ) : (
              filteredFeatures.map(feat => {
                const isExpanded = expandedFeatureId === feat.id;

                return (
                  <div
                    key={feat.id}
                    className="rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-950/80 transition-all overflow-hidden"
                  >
                    {/* Feature Row Main Bar */}
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Capability Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30 uppercase">
                            {feat.categoryLabel}
                          </span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                            {feat.advantageBadge}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-display">{feat.featureName}</h4>
                        <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-2xl">{feat.description}</p>
                      </div>

                      {/* Right: Expand Toggle Button */}
                      <button
                        onClick={() => setExpandedFeatureId(isExpanded ? null : feat.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 cursor-pointer self-start md:self-auto shrink-0"
                      >
                        <span>{isExpanded ? 'Hide Specs' : 'Deep Specs'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Matrix Grid Columns with Smooth Transition Animation */}
                    <div className={`grid gap-4 p-5 bg-slate-900/60 border-t border-slate-800/80 transition-all duration-500 ease-in-out ${
                      viewMode === 'matrix' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                    }`}>
                      {/* Traditional IVR Column */}
                      {(viewMode === 'matrix' || viewMode === 'traditional') && (
                        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2 transition-all duration-300 ease-out transform animate-in fade-in zoom-in-95 slide-in-from-left-2 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold">
                              <X className="w-4 h-4 text-rose-400 shrink-0" />
                              <span>TRADITIONAL IVR</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {feat.traditionalIvr.metric}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-rose-200 font-display">{feat.traditionalIvr.title}</h5>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{feat.traditionalIvr.detail}</p>
                        </div>
                      )}

                      {/* VoiceFlow AI Column */}
                      {(viewMode === 'matrix' || viewMode === 'voiceflow') && (
                        <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/40 space-y-2 transition-all duration-300 ease-out transform animate-in fade-in zoom-in-95 slide-in-from-right-2 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>VOICEFLOW AI ENGINE</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {feat.voiceflowAi.metric}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-emerald-200 font-display">{feat.voiceflowAi.title}</h5>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{feat.voiceflowAi.detail}</p>
                        </div>
                      )}
                    </div>

                    {/* Expandable Technical Deep Note */}
                    {isExpanded && (
                      <div className="p-4 bg-cyan-950/30 border-t border-cyan-500/20 flex items-start gap-3 text-xs font-mono text-cyan-200">
                        <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <span className="font-bold text-cyan-300 block mb-0.5 uppercase tracking-wide text-[10px]">Architectural Execution Detail:</span>
                          <span className="text-slate-200 leading-relaxed">{feat.deepTechnicalNote}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
