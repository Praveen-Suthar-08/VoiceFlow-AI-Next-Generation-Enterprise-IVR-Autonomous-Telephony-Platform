import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  Zap, 
  Trash2, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Clock, 
  MessageSquare,
  FileText,
  Download,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { SpeechService } from '../../services/speechService';
import { systemLogService } from '../../services/systemLogService';
import { TranscriptEntry } from '../../types/ivr';

export interface TranscriptionHistoryItem {
  id: string;
  timestamp: string;
  callerUtterance: string;
  engineResponse: string;
  detectedIntent: string;
  intentConfidence: number;
  sentiment: string;
  sentimentScore: number;
  dialectCode: string;
  dialectFlag: string;
  dialectName: string;
  voiceMode: 'synthetic' | 'human-like';
  actionExecuted?: string;
  latencyMs: number;
}

export const INITIAL_TEST_TRANSCRIPTIONS: TranscriptionHistoryItem[] = [
  {
    id: 'tx_seed_1',
    timestamp: '10:14:28 AM',
    callerUtterance: "I've been charged twice for my subscription! Fix this immediately!",
    engineResponse: "I understand your frustration with the double charge, Sarah. I have verified duplicate transaction TX-98412 and processed an autonomous refund of $49.00 back to your card ending in 4242.",
    detectedIntent: 'billing_dispute',
    intentConfidence: 0.98,
    sentiment: 'angry',
    sentimentScore: -0.82,
    dialectCode: 'en-US',
    dialectFlag: '🇺🇸',
    dialectName: 'English (US)',
    voiceMode: 'human-like',
    actionExecuted: 'Refund $49.00 via Stripe API (Confirmed)',
    latencyMs: 210
  },
  {
    id: 'tx_seed_2',
    timestamp: '10:08:15 AM',
    callerUtterance: "Yes, please rebook me on the earliest flight to Chicago.",
    engineResponse: "I have reserved seat 14B for you on American Airlines flight AA-1082 departing at 11:30 AM today. A mobile boarding pass has been dispatched to your verified phone.",
    detectedIntent: 'flight_rebooking',
    intentConfidence: 0.97,
    sentiment: 'anxious',
    sentimentScore: -0.35,
    dialectCode: 'en-US',
    dialectFlag: '🇺🇸',
    dialectName: 'English (US)',
    voiceMode: 'human-like',
    actionExecuted: 'GDS Sabre Rebooking AA-1082 (Success)',
    latencyMs: 185
  },
  {
    id: 'tx_seed_3',
    timestamp: '09:52:40 AM',
    callerUtterance: "Where is my package ORD-45678 right now?",
    engineResponse: "Your package ORD-45678 is currently on the delivery vehicle with FedEx and is scheduled to arrive at your address before 4:30 PM today.",
    detectedIntent: 'order_tracking',
    intentConfidence: 0.96,
    sentiment: 'neutral',
    sentimentScore: 0.15,
    dialectCode: 'en-GB',
    dialectFlag: '🇬🇧',
    dialectName: 'English (UK)',
    voiceMode: 'synthetic',
    actionExecuted: 'FedEx Tracking API Query (On-Vehicle)',
    latencyMs: 170
  },
  {
    id: 'tx_seed_4',
    timestamp: '09:34:11 AM',
    callerUtterance: "¿Puedo cambiar la dirección de entrega de mi pedido?",
    engineResponse: "Con mucho gusto, Elena. He actualizado la dirección de entrega a su domicilio registrado en Madrid sin costo adicional.",
    detectedIntent: 'address_update',
    intentConfidence: 0.99,
    sentiment: 'satisfied',
    sentimentScore: 0.75,
    dialectCode: 'es-ES',
    dialectFlag: '🇪🇸',
    dialectName: 'Spanish (ES)',
    voiceMode: 'human-like',
    actionExecuted: 'CRM Address Modified (Verified)',
    latencyMs: 230
  },
  {
    id: 'tx_seed_5',
    timestamp: '09:12:05 AM',
    callerUtterance: "I need to speak to a senior supervisor immediately regarding an unresolved dispute.",
    engineResponse: "I am initiating an immediate warm priority handoff to our Senior Escalations Team. Your call summary and sentiment trajectory have been transferred to supervisor agent Mark.",
    detectedIntent: 'agent_escalation',
    intentConfidence: 0.95,
    sentiment: 'angry',
    sentimentScore: -0.90,
    dialectCode: 'en-AU',
    dialectFlag: '🇦🇺',
    dialectName: 'English (AU)',
    voiceMode: 'human-like',
    actionExecuted: 'Escalation Packet Dispatched to Tier-2 Queue',
    latencyMs: 260
  }
];

export interface ChatHistorySidebarProps {
  history: TranscriptionHistoryItem[];
  isOpen: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  onLoadScenario: (utterance: string) => void;
  onClearHistory: () => void;
  onResetHistory: () => void;
  currentTranscript?: TranscriptEntry[];
  callerName?: string;
  dialectName?: string;
  dialectCode?: string;
  voiceMode?: string;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  history,
  isOpen,
  onClose,
  onToggle,
  onLoadScenario,
  onClearHistory,
  onResetHistory,
  currentTranscript = [],
  callerName = 'Alex Morgan',
  dialectName,
  dialectCode,
  voiceMode
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(history[0]?.id || null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExportTextTranscript = () => {
    setIsExporting(true);
    try {
      let textContent = '';
      const now = new Date().toLocaleString();

      textContent += `=================================================================\n`;
      textContent += `VOICEFLOW AI - CONVERSATION & TELEPHONY SIMULATOR TRANSCRIPT\n`;
      textContent += `Export Generated: ${now}\n`;
      textContent += `Caller Persona: ${callerName}\n`;
      if (dialectName) textContent += `Dialect & Regional Accent: ${dialectName} (${dialectCode || 'en-US'})\n`;
      if (voiceMode) textContent += `Voice Processing Mode: ${voiceMode === 'human-like' ? 'Neural 48kHz HD Empathy' : 'Synthetic Touch-Tone 8kHz'}\n`;
      textContent += `Active Dialogue Turns: ${currentTranscript?.length || 0}\n`;
      textContent += `Stored Scenario Memories: ${history.length}\n`;
      textContent += `=================================================================\n\n`;

      if (currentTranscript && currentTranscript.length > 0) {
        textContent += `--- ACTIVE CALL CONVERSATION RECORD ---\n\n`;
        currentTranscript.forEach((entry, idx) => {
          const speaker = entry.speaker === 'caller' 
            ? `[CALLER: ${callerName}]` 
            : `[VOICEFLOW GEMINI AI (${voiceMode || 'human-like'})]`;

          textContent += `TURN #${idx + 1} | ${speaker} | ${entry.timestamp}\n`;
          textContent += `Utterance: "${entry.text}"\n`;
          if (entry.confidence !== undefined) {
            textContent += `Confidence: ${Math.round(entry.confidence * 100)}%\n`;
          }
          if (entry.actionExecuted) {
            textContent += `CRM / System Action: [${entry.actionExecuted.name}] - ${entry.actionExecuted.details} (Status: ${entry.actionExecuted.status})\n`;
          }
          textContent += `\n-----------------------------------------------------------------\n\n`;
        });
      }

      if (history.length > 0) {
        textContent += `\n--- LAST 5 VOICE ENGINE TEST SCENARIOS STORED ---\n\n`;
        history.slice(0, 5).forEach((item, idx) => {
          textContent += `SCENARIO #${idx + 1} | Time: ${item.timestamp} | Dialect: ${item.dialectName} (${item.dialectCode})\n`;
          textContent += `Caller Transcription: "${item.callerUtterance}"\n`;
          textContent += `Voice Engine Synthesis: "${item.engineResponse}"\n`;
          textContent += `Detected Intent: ${item.detectedIntent} (${Math.round(item.intentConfidence * 100)}%)\n`;
          textContent += `Sentiment: ${item.sentiment.toUpperCase()} (Score: ${item.sentimentScore > 0 ? '+' : ''}${item.sentimentScore.toFixed(2)})\n`;
          textContent += `Latency: ${item.latencyMs}ms | Synthesis Mode: ${item.voiceMode}\n`;
          if (item.actionExecuted) {
            textContent += `Transaction: ${item.actionExecuted}\n`;
          }
          textContent += `\n`;
        });
      }

      textContent += `=================================================================\n`;
      textContent += `End of Conversation & Voice Engine Log\n`;
      textContent += `Generated by VoiceFlow AI Bridge | Enterprise Telephony Compliant\n`;
      textContent += `=================================================================\n`;

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedName = callerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `voiceflow_transcript_${sanitizedName}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      systemLogService.log('INFO', `Downloaded conversation text transcript for [${callerName}].`);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const handleExportJSON = () => {
    const fullTranscriptReport = JSON.stringify(history, null, 2);
    const blob = new Blob([fullTranscriptReport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceflow_chat_history_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePlayVoice = (item: TranscriptionHistoryItem) => {
    if (playingId === item.id) {
      SpeechService.stopSpeaking();
      setPlayingId(null);
      return;
    }

    setPlayingId(item.id);
    systemLogService.log('AUDIO', `Auditioning stored voice transcription [${item.id}]: "${item.engineResponse.slice(0, 45)}..." in ${item.dialectName}`);

    const rate = item.voiceMode === 'synthetic' ? 1.08 : (item.sentiment === 'angry' ? 0.95 : 1.0);
    const pitch = item.voiceMode === 'synthetic' ? 0.82 : 1.0;

    SpeechService.speak(
      item.engineResponse,
      item.dialectCode,
      rate,
      pitch,
      item.voiceMode,
      () => setPlayingId(null),
      () => setPlayingId(null)
    );
  };

  const handleCopyTranscript = (item: TranscriptionHistoryItem) => {
    const text = `[CALLER (${item.timestamp})]: ${item.callerUtterance}\n[VOICE ENGINE (${item.dialectName} - ${item.voiceMode})]: ${item.engineResponse}\n[INTENT]: ${item.detectedIntent} (${Math.round(item.intentConfidence * 100)}%)\n[SENTIMENT]: ${item.sentiment} (${item.sentimentScore > 0 ? '+' : ''}${item.sentimentScore.toFixed(2)})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      id="chat-history-section" 
      className="w-full rounded-3xl glass-card border border-slate-700/80 overflow-hidden bg-slate-950/90 shadow-2xl transition-all"
    >
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0E1438]/90 backdrop-blur-md gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/10 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-mono font-bold text-white uppercase tracking-wider">
                Chat History: Last 5 Voice Transcriptions
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/25 text-cyan-300 border border-cyan-400/40">
                {history.length}/5 Stored
              </span>
              <span className="text-[11px] font-mono text-cyan-400/90 hidden md:inline">
                • Gemini 3.8 Scenario Context
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Audition synthesized voice responses, review NLU intent & sentiment metrics, or load scenarios back into the simulator
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Transcript (.txt) Button */}
          <button
            onClick={handleExportTextTranscript}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-purple-500/25 hover:from-cyan-500/35 hover:to-purple-500/35 border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 hover:text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Download the conversation as a formatted .txt text file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isExporting ? 'Exporting...' : 'Export Transcript (.txt)'}</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-200 font-mono text-xs transition-all cursor-pointer"
            title="Download raw JSON data"
          >
            Export JSON
          </button>

          {/* Reset Baseline Scenarios */}
          <button
            onClick={onResetHistory}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-200 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Restore 5 baseline test scenarios"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          {/* Clear History */}
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-red-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Clear all stored transcriptions"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Expand/Collapse Toggle */}
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isOpen ? "Collapse Chat History section" : "Expand Chat History section"}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isOpen && (
        <div className="p-5 sm:p-6 bg-slate-950/70">
          {history.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center font-mono">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm text-slate-200 font-bold mb-1">No Stored Transcriptions in Memory</h4>
              <p className="text-xs text-slate-400 max-w-md mb-4">
                As you speak or send utterances in the live simulator, the simulated voice engine will log the latest 5 transcriptions here.
              </p>
              <button
                onClick={onResetHistory}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-mono transition-all flex items-center gap-2 cursor-pointer font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore 5 Pre-Configured Test Scenarios</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {history.slice(0, 5).map((item, index) => {
                const isSelected = selectedTxId === item.id;
                const isPlaying = playingId === item.id;
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTxId(item.id)}
                    className={`rounded-2xl border p-4 text-xs font-mono flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0E1540]/90 border-cyan-400/80 shadow-xl shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                        : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                    }`}
                  >
                    <div>
                      {/* Card Header: Index, Time, Dialect & Emotion */}
                      <div className="flex items-center justify-between gap-1 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            index === 0
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{item.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span 
                            title={`${item.dialectName} (${item.dialectCode})`}
                            className="px-1.5 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-medium"
                          >
                            {item.dialectFlag} {item.dialectCode}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                            item.sentiment === 'angry' || item.sentiment === 'frustrated'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : item.sentiment === 'satisfied' || item.sentiment === 'happy'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {item.sentiment}
                          </span>
                        </div>
                      </div>

                      {/* Caller Utterance Quote */}
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 mb-2.5">
                        <div className="text-[10px] text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>Caller Transcription:</span>
                        </div>
                        <p className="text-slate-200 text-xs italic leading-relaxed line-clamp-3">
                          "{item.callerUtterance}"
                        </p>
                      </div>

                      {/* Simulated Voice Engine Spoken Response */}
                      <div className="bg-[#0B1033] p-2.5 rounded-xl border border-cyan-500/25 mb-3">
                        <div className="text-[10px] text-purple-300 font-semibold mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            {item.voiceMode === 'human-like' ? (
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <Bot className="w-3 h-3 text-amber-400" />
                            )}
                            <span>Voice Engine ({item.voiceMode}):</span>
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400">{item.latencyMs}ms</span>
                        </div>
                        <p className="text-slate-100 text-xs leading-relaxed line-clamp-4">
                          {item.engineResponse}
                        </p>
                      </div>

                      {/* Detected Intent & CRM Action */}
                      <div className="space-y-1.5 mb-3 text-[10px]">
                        <div className="flex items-center justify-between bg-purple-950/40 px-2 py-1 rounded-lg border border-purple-500/30 text-purple-200">
                          <span className="text-purple-400 font-medium">Intent:</span>
                          <span className="font-bold truncate max-w-[130px]">{item.detectedIntent}</span>
                          <span className="text-[9px] text-purple-300">({Math.round(item.intentConfidence * 100)}%)</span>
                        </div>

                        {item.actionExecuted && (
                          <div className="flex items-center gap-1.5 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/30 text-emerald-200">
                            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate text-[10px]">{item.actionExecuted}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons: Audition, Re-test, Copy */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVoice(item);
                        }}
                        className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold text-[11px] ${
                          isPlaying
                            ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/40 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-slate-700 hover:border-cyan-400/60'
                        }`}
                        title="Audition voice synthesis response"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? 'Playing...' : 'Audition'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyTranscript(item);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                          title="Copy turn transcript"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadScenario(item.callerUtterance);
                            // Smooth scroll up to simulator
                            const simEl = document.getElementById('live-simulator-container');
                            if (simEl) {
                              simEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 hover:border-cyan-400 flex items-center gap-1 transition-all cursor-pointer font-bold text-[11px]"
                          title="Load this test scenario into the live IVR simulator and scroll to conversation"
                        >
                          <span>Re-test</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
