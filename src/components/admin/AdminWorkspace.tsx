import React, { useState } from 'react';
import { 
  PhoneCall, GitBranch, BarChart3, BookOpen, Settings2, ShieldCheck, 
  Search, Play, Plus, Trash2, ArrowUpRight, Download, Upload, Cpu, 
  Zap, AlertCircle, CheckCircle2, User, Phone, Check, RefreshCw, Layers, Mic, Timer, Terminal
} from 'lucide-react';
import { PRESET_CALLER_PROFILES, PRESET_KNOWLEDGE_BASE, INITIAL_DEFAULT_FLOW, RECENT_CALL_SESSIONS_MOCK } from '../../data/ivrData';
import { IVRFlow, FlowNode, KnowledgeEntry, CallSession } from '../../types/ivr';
import { AnalyticsDashboardSkeleton } from '../ui/SkeletonLoader';
import { VoiceCloningSettings } from './VoiceCloningSettings';
import { SimulatedCallScheduler } from './SimulatedCallScheduler';
import { SystemEventStream } from './SystemEventStream';

export const AdminWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flow' | 'analytics' | 'kb' | 'integrations' | 'logs' | 'voice_cloning' | 'scheduler' | 'stream'>('flow');
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);
  const [flow, setFlow] = useState<IVRFlow>(INITIAL_DEFAULT_FLOW);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(INITIAL_DEFAULT_FLOW.nodes[2]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<CallSession | null>(RECENT_CALL_SESSIONS_MOCK[0]);
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeEntry[]>(PRESET_KNOWLEDGE_BASE);

  // New Node creation helper
  const handleAddNode = () => {
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: 'crm_action',
      title: 'Custom Webhook Action',
      description: 'Executes REST API endpoint with call context',
      config: { method: 'POST', endpoint: 'https://api.crm.com/v1/event' },
      position: { x: 750, y: 250 }
    };
    setFlow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setSelectedNode(newNode);
  };

  const filteredLogs = RECENT_CALL_SESSIONS_MOCK.filter(s => 
    s.callerPhone.includes(searchQuery) ||
    s.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.intentsDetected.some(i => i.intent_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full min-h-[750px] rounded-3xl glass-card border border-slate-700/80 overflow-hidden bg-slate-950/95 flex flex-col">
      {/* Admin Header Navigation */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-slate-950 font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <span>VoiceFlow IVR Management Console</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PROD v3.8
              </span>
            </h3>
            <p className="text-xs font-mono text-slate-400">Gemini Orchestrated Telephony & NLU Engine</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'flow' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Visual Flow Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('stream')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'stream' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>System Event Stream</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Live Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'logs' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Transcripts</span>
          </button>
          <button
            onClick={() => setActiveTab('kb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'kb' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </button>
          <button
            onClick={() => setActiveTab('voice_cloning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'voice_cloning' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Cloning</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
              30s
            </span>
          </button>
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'scheduler' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Call Scheduler</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              Robustness
            </span>
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'integrations' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Integrations</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: VISUAL FLOW BUILDER */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <span>Active Flow Pipeline:</span>
                  <span className="text-cyan-300 font-semibold">{flow.name}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{flow.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddNode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold rounded-lg transition-all shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Node</span>
                </button>
                <button
                  onClick={() => alert("Flow configuration JSON successfully exported!")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Interactive Visual Graph Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Node Graph List & Interconnections (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 min-h-[440px] relative overflow-hidden bg-cyber-grid">
                <div className="space-y-4">
                  {flow.nodes.map((node, index) => {
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white font-mono">{node.title}</span>
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-purple-300">
                                {node.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{node.description}</p>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-slate-500">
                          ID: {node.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Node Inspector Panel (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    Node Inspector
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedNode?.id}</span>
                </div>

                {selectedNode ? (
                  <div className="space-y-4 text-xs font-mono">
                    <div>
                      <label className="text-slate-400 block mb-1">Title</label>
                      <input
                        type="text"
                        value={selectedNode.title}
                        onChange={(e) => {
                          const updated = { ...selectedNode, title: e.target.value };
                          setSelectedNode(updated);
                          setFlow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === updated.id ? updated : n)
                          }));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Node Type</label>
                      <select
                        value={selectedNode.type}
                        onChange={(e) => {
                          const updated = { ...selectedNode, type: e.target.value as any };
                          setSelectedNode(updated);
                          setFlow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === updated.id ? updated : n)
                          }));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      >
                        <option value="greeting">greeting</option>
                        <option value="biometric_auth">biometric_auth</option>
                        <option value="intent_router">intent_router</option>
                        <option value="sentiment_guard">sentiment_guard</option>
                        <option value="crm_action">crm_action</option>
                        <option value="transfer">transfer</option>
                        <option value="sms_followup">sms_followup</option>
                        <option value="end">end</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Configuration (JSON)</label>
                      <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-green-300 overflow-x-auto">
                        {JSON.stringify(selectedNode.config, null, 2)}
                      </pre>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Live Changes Auto-Saved</span>
                      <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Synced
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Select any node on the left to configure.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: SYSTEM EVENT STREAM */}
        {activeTab === 'stream' && (
          <SystemEventStream />
        )}

        {/* TAB 2: LIVE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-mono text-white font-bold">
                  BigQuery Telephony Stream & Gemini NLU Insights
                </span>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  Live Sync
                </span>
              </div>

              <button
                onClick={() => {
                  setIsAnalyticsLoading(true);
                  setTimeout(() => {
                    setIsAnalyticsLoading(false);
                  }, 850);
                }}
                disabled={isAnalyticsLoading}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-200 hover:text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyticsLoading ? 'animate-spin' : ''}`} />
                <span>{isAnalyticsLoading ? 'Buffering Stream...' : 'Refresh Telemetry Feed'}</span>
              </button>
            </div>

            {/* If loading, display AnalyticsDashboardSkeleton */}
            {isAnalyticsLoading ? (
              <AnalyticsDashboardSkeleton />
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-xs font-mono text-slate-400 uppercase">Self-Service Resolution</span>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">94.2%</div>
                    <span className="text-[10px] font-mono text-emerald-300/80">+3.8% from last week</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-xs font-mono text-slate-400 uppercase">Average Handle Time</span>
                    <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">1m 14s</div>
                    <span className="text-[10px] font-mono text-cyan-300/80">42% faster than human</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-xs font-mono text-slate-400 uppercase">First Contact CSAT</span>
                    <div className="text-2xl font-bold font-mono text-purple-300 mt-1">4.85 / 5.0</div>
                    <span className="text-[10px] font-mono text-purple-300/80">Based on 14,280 reviews</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-xs font-mono text-slate-400 uppercase">Monthly Net Savings</span>
                    <div className="text-2xl font-bold font-mono text-amber-300 mt-1">$482,900</div>
                    <span className="text-[10px] font-mono text-amber-300/80">Target: $450,000</span>
                  </div>
                </div>

            {/* Intent Distribution & Sentiment Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-300 mb-4">
                  Top Inbound Call Intents
                </h4>
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between mb-1 text-slate-300">
                      <span>track_shipment / order_status</span>
                      <span className="text-cyan-300">42% (6,120 calls)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-[42%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-300">
                      <span>dispute_charge / refund_request</span>
                      <span className="text-purple-300">28% (4,080 calls)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 w-[28%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-300">
                      <span>flight_rebooking_and_status</span>
                      <span className="text-blue-300">18% (2,620 calls)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 w-[18%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-300">
                      <span>technical_smart_hub_support</span>
                      <span className="text-amber-300">12% (1,750 calls)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 w-[12%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 mb-4">
                    Sentiment Transition Trajectory
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Callers starting in an angry/frustrated state (-0.8) were successfully de-escalated to satisfied (+0.7) in <strong>89.4% of cases</strong> through early acknowledgement and immediate self-service transaction fulfillment.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-red-400 font-bold">Start: Angry (-0.82)</span>
                  <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-green-400 rounded-full" />
                  <span className="text-green-400 font-bold">End: Satisfied (+0.78)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )}

        {/* TAB 3: CALL TRANSCRIPTS & LOGS */}
        {activeTab === 'logs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Session Search & List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by phone, intent, or transcript text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredLogs.map(session => {
                  const isSelected = selectedSession?.id === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white font-mono">{session.callerProfile?.name || session.callerPhone}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20">
                          {session.resolution?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{session.summary}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
                        <span>Duration: {session.durationSeconds}s</span>
                        <span>CSAT: {session.csatScore}/5 ★</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Transcript Viewer (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
              {selectedSession ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">{selectedSession.callerProfile?.name} ({selectedSession.callerPhone})</h4>
                      <p className="text-xs text-cyan-300 font-mono">Intent: {selectedSession.intentsDetected[0]?.intent_name}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{selectedSession.startedAt}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                    <strong className="text-white block mb-1 font-mono uppercase text-[10px] text-purple-400">Gemini Executive Summary:</strong>
                    {selectedSession.summary}
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedSession.transcript.map(t => (
                      <div key={t.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                          {t.speaker} • {t.timestamp}
                        </span>
                        <p className="text-slate-200">{t.text}</p>
                        {t.actionExecuted && (
                          <div className="mt-1 text-[10px] font-mono text-cyan-300">
                            Action: {t.actionExecuted.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Select any call session on the left to view transcript.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: KNOWLEDGE BASE */}
        {activeTab === 'kb' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold font-mono text-white">Semantic Knowledge Base & FAQ Documents</h4>
              <button
                onClick={() => alert("New FAQ article added to vector database index!")}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-mono text-xs font-bold"
              >
                + Ingest New Article
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeList.map(kb => (
                <div key={kb.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-cyan-300 font-mono">{kb.question}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{kb.category}</span>
                  </div>
                  <p className="text-xs text-slate-300">{kb.answer}</p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {kb.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        #{kw}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                    <span>Usage: {kb.usageCount.toLocaleString()} times</span>
                    <span>Success: {Math.round(kb.successRate * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: INTEGRATIONS & COMPLIANCE */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Salesforce CRM</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400">Two-way sync of caller profiles, notes, and resolution records.</p>
              <div className="text-[10px] font-mono text-emerald-400">Status: CONNECTED (REST API v58)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Twilio SIP Trunking</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400">Programmable Voice SIP gateway with automatic PSTN routing.</p>
              <div className="text-[10px] font-mono text-emerald-400">Status: CONNECTED (TLS/SRTP Active)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Stripe Billing Engine</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400">Autonomous refund and credit issuance with PCI-DSS auto-redaction.</p>
              <div className="text-[10px] font-mono text-emerald-400">Status: CONNECTED (Level 1 Compliant)</div>
            </div>
          </div>
        )}

        {/* TAB 6: VOICE CLONING & CUSTOM SYNTHETIC PROFILES */}
        {activeTab === 'voice_cloning' && (
          <VoiceCloningSettings />
        )}

        {/* TAB 7: SIMULATED RECURRING CALL SCENARIO SCHEDULER & ROBUSTNESS */}
        {activeTab === 'scheduler' && (
          <SimulatedCallScheduler />
        )}
      </div>
    </div>
  );
};
