import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, CheckCircle, RefreshCw, UserCheck, ShieldAlert, PhoneForwarded, MessageSquare, ArrowRight, Zap, Bot, Sliders, Radio, Languages, ChevronDown, Globe, History, Fingerprint, ShieldCheck, Smile, Briefcase, Heart } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import confetti from 'canvas-confetti';
import { PRESET_CALLER_PROFILES } from '../../data/ivrData';
import { GLOBAL_DIALECTS, getDialectByCode, GlobalDialect } from '../../data/dialectsData';
import { VOICE_PERSONAS, VoicePersonaId, getPersonaById } from '../../data/voicePersonas';
import { CallerProfile, TranscriptEntry, SentimentPoint, IntentDetection, Entity } from '../../types/ivr';
import { GeminiIVRService, ProcessCallResult } from '../../services/geminiIvrService';
import { SpeechService } from '../../services/speechService';
import { systemLogService } from '../../services/systemLogService';
import { ChatHistorySidebar, TranscriptionHistoryItem, INITIAL_TEST_TRANSCRIPTIONS } from './ChatHistorySidebar';

export const InteractiveLiveDemoSection: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<CallerProfile>(PRESET_CALLER_PROFILES[0]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<VoicePersonaId>('professional');
  const [selectedDialect, setSelectedDialect] = useState<GlobalDialect>(() => 
    getDialectByCode(PRESET_CALLER_PROFILES[0].languagePreference || 'en-US')
  );
  const [isDialectDropdownOpen, setIsDialectDropdownOpen] = useState<boolean>(false);
  const [isHeaderDialectDropdownOpen, setIsHeaderDialectDropdownOpen] = useState<boolean>(false);
  const [voiceMode, setVoiceMode] = useState<'synthetic' | 'human-like'>('human-like');
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(true);
  const [biometricMatchScore, setBiometricMatchScore] = useState<number>(99.4);
  const [biometricVerificationStatus, setBiometricVerificationStatus] = useState<'Verified' | 'Checking' | 'Failed' | 'Disabled'>('Verified');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customCallerName, setCustomCallerName] = useState<string>('Alex Morgan');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTTSActive, setIsTTSActive] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentSentiment, setCurrentSentiment] = useState<SentimentPoint | null>(null);
  const [currentIntent, setCurrentIntent] = useState<IntentDetection | null>(null);
  const [extractedEntities, setExtractedEntities] = useState<Entity[]>([]);
  const [actionLog, setActionLog] = useState<Array<{ name: string; status: string; details: string; time: string }>>([]);
  const [escalationData, setEscalationData] = useState<any>(null);
  const [isResolved, setIsResolved] = useState<boolean>(false);

  // Real-Time Customer Satisfaction (CSAT) Recharts state
  const [csatHistory, setCsatHistory] = useState<Array<{ turn: string; csat: number; sentimentScore: number }>>([
    { turn: 'Turn 1', csat: 38, sentimentScore: -0.65 },
    { turn: 'Turn 2', csat: 62, sentimentScore: 0.12 },
    { turn: 'Turn 3', csat: 84, sentimentScore: 0.78 },
    { turn: 'Turn 4', csat: 95, sentimentScore: 0.92 },
  ]);

  // Chat History Sidebar State: persists the last 5 transcriptions from the simulated voice engine
  const [chatHistory, setChatHistory] = useState<TranscriptionHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('voiceflow_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_TEST_TRANSCRIPTIONS;
  });
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(true);

  // Sync chat history changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('voiceflow_chat_history', JSON.stringify(chatHistory.slice(0, 5)));
    } catch (e) {
      // ignore
    }
  }, [chatHistory]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const dialectDropdownRef = useRef<HTMLDivElement>(null);
  const headerDialectDropdownRef = useRef<HTMLDivElement>(null);

  // Close dialect dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialectDropdownRef.current && !dialectDropdownRef.current.contains(e.target as Node)) {
        setIsDialectDropdownOpen(false);
      }
      if (headerDialectDropdownRef.current && !headerDialectDropdownRef.current.contains(e.target as Node)) {
        setIsHeaderDialectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize or reset session when profile changes
  useEffect(() => {
    const profileDialect = getDialectByCode(selectedProfile.languagePreference || 'en-US');
    setSelectedDialect(profileDialect);
    resetDemoSession(selectedProfile, profileDialect);
  }, [selectedProfile]);

  useEffect(() => {
    if (transcriptEndRef.current && transcript.length > 0) {
      const parent = transcriptEndRef.current.parentElement;
      if (parent) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [transcript]);

  const handleSelectDialect = (dialect: GlobalDialect) => {
    setSelectedDialect(dialect);
    setIsDialectDropdownOpen(false);
    setIsHeaderDialectDropdownOpen(false);

    systemLogService.log('AUDIO', `Voice Engine dialect updated to [${dialect.name} - ${dialect.code}]: Regional accent '${dialect.telephonyAccent}' engaged.`);

    if (isTTSActive) {
      SpeechService.speak(
        dialect.sampleGreeting,
        dialect.code,
        voiceMode === 'synthetic' ? 1.08 : 1.0,
        voiceMode === 'synthetic' ? 0.82 : 1.0,
        voiceMode
      );
    }
  };

  const handleSelectPersona = (personaId: VoicePersonaId) => {
    setSelectedPersonaId(personaId);
    const persona = getPersonaById(personaId);
    systemLogService.log(
      'AUDIO',
      `AI Voice Persona updated to [${persona.name}]: Tone directive '${persona.promptDirective}' engaged with ${persona.speechRate}x cadence.`
    );

    if (isTTSActive) {
      SpeechService.speak(
        persona.sampleGreeting,
        selectedDialect.code,
        persona.speechRate,
        persona.speechPitch,
        voiceMode
      );
    }
  };

  const toggleBiometrics = () => {
    setIsBiometricsEnabled(prev => {
      const next = !prev;
      if (next) {
        setBiometricVerificationStatus('Verified');
        setBiometricMatchScore(99.4);
      } else {
        setBiometricVerificationStatus('Disabled');
      }
      systemLogService.log(
        next ? 'SECURITY' : 'WARN',
        next
          ? 'Voice Biometrics Verification [ACTIVE]: High-security acoustic vocal print feature extraction engaged. Match confidence SLA threshold: 99.4%.'
          : 'Voice Biometrics Verification [BYPASSED]: Acoustic vocal print verification disabled.'
      );
      if (isTTSActive) {
        SpeechService.speak(
          next
            ? 'Voice biometric authentication active. Acoustic vocal print verification enforced.'
            : 'Voice biometric authentication disabled.',
          selectedDialect.code,
          1.0,
          1.0,
          voiceMode
        );
      }
      return next;
    });
  };

  const resetDemoSession = (profile: CallerProfile, dialect: GlobalDialect = selectedDialect) => {
    SpeechService.stopSpeaking();
    SpeechService.stopListening();
    setIsListening(false);
    setIsResolved(false);
    setEscalationData(null);
    setActionLog([]);

    // Initial greeting based on persona & predictive context, customized for dialect
    let initialGreeting = dialect.sampleGreeting;
    let initialIntent: IntentDetection = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent_name: 'greeting',
      confidence: 1.0,
      category: 'GENERAL',
      entities: {},
      resolved: true
    };

    if (profile.id === 'caller_101') {
      // Sarah Jenkins
      initialGreeting = dialect.code.startsWith('en')
        ? `Thank you for calling TechCorp, Sarah. I see you have an open inquiry regarding your billing subscription. How can I assist you right now?`
        : dialect.sampleGreeting;
    } else if (profile.id === 'caller_102') {
      // David Patel (Predictive Flight Cancellation)
      initialGreeting = dialect.code.startsWith('en')
        ? `Hi David, thank you for calling TravelPro Airlines. I see that your flight UA-456 to Chicago was cancelled 2 hours ago. Are you calling to explore your rebooking options?`
        : dialect.sampleGreeting;
      initialIntent.intent_name = 'predictive_flight_inquiry';
    } else if (profile.id === 'caller_104') {
      // Elena (Spanish)
      initialGreeting = dialect.code.startsWith('es')
        ? `Gracias por llamar a TechCorp. He detectado su preferencia en Español. ¿En qué puedo ayudarle hoy?`
        : dialect.sampleGreeting;
    }

    const firstEntry: TranscriptEntry = {
      id: 'msg_0',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      speaker: 'system',
      text: initialGreeting,
      confidence: 1.0
    };

    setTranscript([firstEntry]);
    setCurrentIntent(initialIntent);
    setCurrentSentiment({
      timestamp: firstEntry.timestamp,
      score: 0.0,
      label: 'neutral',
      confidence: 1.0,
      intensity: 0.2,
      urgency: 'low',
      patience: 'patient',
      trajectory: 'stable'
    });
    setExtractedEntities([
      { type: 'person_name', value: profile.name, confidence: 1.0 },
      { type: 'account_number', value: profile.accountNumber, confidence: 1.0 }
    ]);

    if (isTTSActive) {
      SpeechService.speak(initialGreeting, dialect.code, 1.0, 1.0, voiceMode);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputText;
    if (!message.trim() || isProcessing) return;

    setInputText('');
    setIsProcessing(true);
    if (isBiometricsEnabled) {
      setBiometricVerificationStatus('Checking');
    }

    const callerEntry: TranscriptEntry = {
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      speaker: 'caller',
      text: message,
      confidence: 0.97
    };

    const updatedHistory = [...transcript, callerEntry];
    setTranscript(updatedHistory);

    const callStartTime = performance.now();

    try {
      const activeProfile = isCustomMode 
        ? { ...selectedProfile, name: customCallerName } 
        : selectedProfile;

      const result: ProcessCallResult = await GeminiIVRService.processUtterance(
        message,
        updatedHistory,
        activeProfile,
        selectedDialect.code,
        selectedPersonaId
      );

      const latencyMs = Math.round(performance.now() - callStartTime);

      // Update state
      setCurrentSentiment(result.sentiment);
      setCurrentIntent(result.detectedIntent);
      setExtractedEntities(result.entities);

      if (isBiometricsEnabled) {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('spoof') || lowerMsg.includes('hack') || lowerMsg.includes('imposter') || lowerMsg.includes('fake')) {
          setBiometricVerificationStatus('Failed');
          setBiometricMatchScore(31.4);
        } else {
          setBiometricVerificationStatus('Verified');
          setBiometricMatchScore(99.4);
        }
      }

      if (result.sentiment) {
        const scorePct = Math.min(100, Math.max(10, Math.round(((result.sentiment.score + 1) / 2) * 100)));
        setCsatHistory(prev => [
          ...prev.slice(-5),
          { turn: `Turn ${prev.length + 1}`, csat: scorePct, sentimentScore: result.sentiment.score }
        ]);
      }

      // Log AI processing event, tokens, and latency to real-time System Log
      systemLogService.logAiInference({
        callerUtterance: message,
        responseText: result.responseText,
        detectedIntent: result.detectedIntent.intent_name,
        sentimentScore: result.sentiment.score,
        latencyMs: Math.max(160, latencyMs),
        actionExecuted: result.actionExecuted ? `${result.actionExecuted.name} (${result.actionExecuted.details})` : undefined
      });

      if (result.actionExecuted) {
        setActionLog(prev => [
          {
            name: result.actionExecuted!.name,
            status: result.actionExecuted!.status,
            details: result.actionExecuted!.details,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          },
          ...prev
        ]);
      }

      const systemEntry: TranscriptEntry = {
        id: `msg_${Date.now() + 1}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        speaker: 'system',
        text: result.responseText,
        confidence: 0.99,
        actionExecuted: result.actionExecuted
      };

      setTranscript([...updatedHistory, systemEntry]);

      // Store in Chat History sidebar: keep the last 5 transcriptions from the simulated voice engine
      const newTxRecord: TranscriptionHistoryItem = {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        callerUtterance: message,
        engineResponse: result.responseText,
        detectedIntent: result.detectedIntent.intent_name,
        intentConfidence: result.detectedIntent.confidence,
        sentiment: result.sentiment.label,
        sentimentScore: result.sentiment.score,
        dialectCode: selectedDialect.code,
        dialectFlag: selectedDialect.flag,
        dialectName: selectedDialect.name,
        voiceMode: voiceMode,
        actionExecuted: result.actionExecuted ? `${result.actionExecuted.name}: ${result.actionExecuted.details}` : undefined,
        latencyMs: Math.max(160, latencyMs)
      };

      setChatHistory(prev => [newTxRecord, ...prev].slice(0, 5));

      if (result.shouldEscalate && result.escalationPacket) {
        setEscalationData(result.escalationPacket);
        systemLogService.log('WARN', `Live agent escalation triggered for ${activeProfile.name}: ${result.escalationPacket.reason}`, {
          metadata: { escalation: result.escalationPacket }
        });
      } else if (result.actionExecuted && result.actionExecuted.status === 'success') {
        setIsResolved(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (isTTSActive) {
        const personaConfig = getPersonaById(selectedPersonaId);
        // Modulate rate and pitch based on personaConfig and active voice mode
        const rate = voiceMode === 'synthetic' ? 1.08 : personaConfig.speechRate;
        const pitch = voiceMode === 'synthetic' ? 0.82 : personaConfig.speechPitch;
        systemLogService.log('AUDIO', `Dispatching TTS speech: dialect=${selectedDialect.name} (${selectedDialect.code}), persona=${personaConfig.name}, mode=${voiceMode}, rate=${rate.toFixed(2)}, pitch=${pitch.toFixed(2)}`);
        SpeechService.speak(result.responseText, selectedDialect.code, rate, pitch, voiceMode);
      }
    } catch (err) {
      console.error(err);
      systemLogService.log('WARN', `Inference exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      SpeechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      SpeechService.startListening(
        selectedDialect.code,
        (recognizedText, isFinal) => {
          if (isFinal) {
            setIsListening(false);
            handleSendMessage(recognizedText);
          } else {
            setInputText(recognizedText);
          }
        },
        (error) => {
          console.warn('STT info:', error);
          setIsListening(false);
        }
      );
    }
  };

  const toggleAudioMute = () => {
    if (isTTSActive) {
      SpeechService.stopSpeaking();
      setIsTTSActive(false);
      systemLogService.log('AUDIO', 'Simulated voice feedback MUTED by user. Speech output silenced.');
    } else {
      setIsTTSActive(true);
      systemLogService.log('AUDIO', 'Simulated voice feedback UNMUTED by user. Speech synthesis activated.');
    }
  };



  const renderVerificationBadge = () => {
    if (!isBiometricsEnabled || biometricVerificationStatus === 'Disabled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs font-mono font-bold text-slate-400 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline text-slate-400">Voiceprint:</span>
          <span className="text-slate-400">Disabled</span>
        </span>
      );
    }

    if (biometricVerificationStatus === 'Checking') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/25 border border-cyan-400 text-xs font-mono font-bold text-cyan-200 animate-pulse shadow-md shadow-cyan-500/20 select-none">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
          <span className="hidden sm:inline">Voiceprint:</span>
          <span>Checking...</span>
        </span>
      );
    }

    if (biometricVerificationStatus === 'Failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-500/25 border border-red-500 text-xs font-mono font-bold text-red-200 shadow-md shadow-red-500/20 select-none">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          <span className="hidden sm:inline">Voiceprint:</span>
          <span>Failed ({biometricMatchScore}%)</span>
        </span>
      );
    }

    // Verified
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/80 text-xs font-mono font-bold text-emerald-200 shadow-md shadow-emerald-500/10 select-none">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline text-slate-300">Voiceprint:</span>
        <span className="text-emerald-300 font-extrabold">Verified ({biometricMatchScore}%)</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </span>
    );
  };

  const getSentimentBadge = (sentiment: SentimentPoint | null) => {
    if (!sentiment) return null;
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      angry: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/40' },
      frustrated: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
      anxious: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
      neutral: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40' },
      satisfied: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/40' },
      happy: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
      confused: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' }
    };
    const style = colors[sentiment.label] || colors.neutral;

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${style.bg} ${style.text} ${style.border}`}>
        {sentiment.label.toUpperCase()} (Intensity: {Math.round(sentiment.intensity * 100)}%)
      </span>
    );
  };

  return (
    <div id="interactive-demo-container" className="interactive-demo-container flex flex-col gap-6 w-full">
      {/* Persona Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-slate-700/80 bg-[#0B0F2F]/90 shadow-xl">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          <span className="text-sm sm:text-base font-bold text-white">Select Caller Scenario:</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {PRESET_CALLER_PROFILES.map(profile => {
            const isSelected = selectedProfile.id === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => {
                  setSelectedProfile(profile);
                  setIsCustomMode(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
                    : 'bg-slate-900/90 border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{profile.name}</span>
                <span className={`text-[11px] font-semibold ${isSelected ? 'text-slate-900' : 'text-cyan-300/80'}`}>
                  {profile.id === 'caller_101' ? '(Billing Dispute)' : profile.id === 'caller_102' ? '(Flight Cancelled)' : profile.id === 'caller_103' ? '(Order Tracking)' : '(Spanish Auto-Detect)'}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => resetDemoSession(selectedProfile)}
            title="Reset Conversation"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VISUAL TOGGLE & DIALECT CONSOLE: Voice AI Processing Mode & Global Dialects */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-slate-700/80 bg-gradient-to-r from-[#0C123D] via-[#0E1648] to-[#12113A] shadow-xl relative z-40">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border transition-all shadow-md shrink-0 ${
            voiceMode === 'human-like'
              ? 'bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border-cyan-400/50 text-cyan-300 shadow-cyan-500/10'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-amber-500/10'
          }`}>
            {voiceMode === 'human-like' ? (
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            ) : (
              <Bot className="w-5 h-5 text-amber-300" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white font-display">
                Voice AI Engine:
              </span>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                voiceMode === 'human-like'
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60 shadow-sm shadow-cyan-500/20'
                  : 'bg-amber-500/20 text-amber-200 border-amber-500/60 shadow-sm shadow-amber-500/20'
              }`}>
                {voiceMode === 'human-like' ? 'HUMAN-LIKE NEURAL' : 'SYNTHETIC TOUCH-TONE'}
              </span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-200 border border-blue-400/40">
                {selectedDialect.flag} {selectedDialect.name}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-xl">
              {voiceMode === 'human-like'
                ? `Gemini 3.8 emotion-aware prosody configured for ${selectedDialect.telephonyAccent}. Real-time inflection & sub-240ms acoustic streaming.`
                : `Legacy telephony IVR simulation in ${selectedDialect.name}. Monotone mechanical pitch, fixed 1.08x cadence, and robotic prompts.`}
            </p>
          </div>
        </div>

        {/* Right Controls: Mode Toggle & Global Dialect Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dialect Selector Dropdown */}
          <div className="relative z-50" ref={dialectDropdownRef}>
            <button
              onClick={() => setIsDialectDropdownOpen(!isDialectDropdownOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-300 text-xs font-mono text-cyan-100 hover:text-white shadow-lg transition-all cursor-pointer font-bold select-none active:scale-95"
              title="Select simulated voice dialect & language"
              aria-label="Select Voice Dialect"
            >
              <Languages className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex items-center gap-2 text-left">
                <span className="text-base leading-none">{selectedDialect.flag}</span>
                <div>
                  <span className="block text-slate-100 font-bold leading-tight">{selectedDialect.name}</span>
                  <span className="text-[10px] text-cyan-300/80 leading-none">{selectedDialect.telephonyAccent}</span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-cyan-300 ml-1 transition-transform ${isDialectDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dialect Dropdown Menu */}
            {isDialectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-[#090D2A] border-2 border-cyan-400/80 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-[100] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 flex items-center justify-between">
                  <span>Global Telephony Dialects (14)</span>
                  <span className="text-cyan-400">STT + TTS</span>
                </div>

                <div className="space-y-1 mt-1.5">
                  {GLOBAL_DIALECTS.map(dialect => {
                    const isSelected = selectedDialect.code === dialect.code;
                    return (
                      <button
                        key={dialect.code}
                        onClick={() => handleSelectDialect(dialect)}
                        className={`w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all group cursor-pointer ${
                          isSelected 
                            ? 'bg-cyan-500/20 border border-cyan-400/60 text-white' 
                            : 'hover:bg-slate-900/90 text-slate-300 border border-transparent'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{dialect.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold font-mono ${isSelected ? 'text-cyan-200' : 'group-hover:text-white'}`}>
                              {dialect.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {dialect.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {dialect.nativeName}
                          </span>
                          <span className="text-[10px] text-cyan-400/90 block font-mono mt-0.5 truncate">
                            {dialect.telephonyAccent}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-sm shadow-cyan-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* High-Security Voice Biometrics Toggle */}
          <button
            onClick={toggleBiometrics}
            title={isBiometricsEnabled ? "High-Security Voice Biometric Authentication ACTIVE (Click to disable)" : "Click to enable High-Security Voice Biometric Authentication"}
            className={`px-3 py-2 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md select-none active:scale-95 ${
              isBiometricsEnabled
                ? 'bg-emerald-500/20 border-emerald-400/80 text-emerald-200 hover:bg-emerald-500/30 shadow-emerald-500/20'
                : 'bg-slate-950/90 border-slate-700/90 text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            <Fingerprint className={`w-4 h-4 ${isBiometricsEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase font-bold text-slate-300">Biometrics</span>
              <span className={`text-[11px] font-black ${isBiometricsEnabled ? 'text-emerald-300' : 'text-slate-400'}`}>
                {isBiometricsEnabled ? 'VERIFIED (99.4%)' : 'DISABLED'}
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${isBiometricsEnabled ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-slate-600'}`} />
          </button>

          {/* Visual Sliding Segmented Toggle */}
          <div className="bg-slate-950/90 p-1.5 rounded-2xl border border-slate-700/90 flex items-center shrink-0 shadow-inner">
            <button
              onClick={() => {
                setVoiceMode('synthetic');
                systemLogService.log('AUDIO', 'Voice AI Processing Mode toggled to [SYNTHETIC TOUCH-TONE]: Monotone 0.82 pitch, 1.08x cadence, 8kHz telecom filter engaged.');
                if (isTTSActive) {
                  SpeechService.speak('Synthetic processing mode engaged. Reverting to legacy mechanical telecommunication timbre.', selectedDialect.code, 1.08, 0.82, 'synthetic');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                voiceMode === 'synthetic'
                  ? 'bg-amber-500/25 border border-amber-400/80 text-amber-200 shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Synthetic</span>
            </button>

            <button
              onClick={() => {
                setVoiceMode('human-like');
                systemLogService.log('AUDIO', 'Voice AI Processing Mode toggled to [HUMAN-LIKE NEURAL]: Emotion-aware prosody, dynamic inflection, 48kHz HD full-band active.');
                if (isTTSActive) {
                  SpeechService.speak('Human-like neural processing mode activated. Real-time sentiment prosody and conversational empathy restored.', selectedDialect.code, 1.0, 1.0, 'human-like');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                voiceMode === 'human-like'
                  ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 text-slate-950 font-black shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Human-like</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Voice Persona Tone Adaptability Radio Selector */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card border border-purple-500/30 bg-gradient-to-r from-slate-950 via-[#0D102D] to-slate-950 shadow-xl space-y-3 relative z-30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/50 text-purple-300">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-display flex flex-wrap items-center gap-2">
                <span>Gemini AI Voice Personas & Response Tones</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/50 uppercase font-black tracking-wider">
                  Adaptive Response Engine
                </span>
              </h4>
              <p className="text-xs text-slate-300 font-sans">
                Select an AI persona to test how the Gemini engine dynamically adapts its response tone, vocabulary, and prosody.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 shrink-0 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Tone: <strong className="text-purple-300 font-bold">{getPersonaById(selectedPersonaId).name}</strong></span>
          </div>
        </div>

        {/* Radio Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {VOICE_PERSONAS.map((persona) => {
            const isSelected = selectedPersonaId === persona.id;
            const Icon = persona.iconName === 'Briefcase' ? Briefcase 
                       : persona.iconName === 'Heart' ? Heart 
                       : persona.iconName === 'Zap' ? Zap 
                       : Smile;

            return (
              <label
                key={persona.id}
                onClick={() => handleSelectPersona(persona.id)}
                className={`relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none group ${
                  isSelected
                    ? `bg-slate-900/95 ${persona.borderColor} shadow-lg shadow-purple-500/15 ring-2 ring-purple-400/50 scale-[1.02]`
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900/50'
                }`}
              >
                {/* Custom Styled Radio Button Indicator */}
                <div className="flex items-center justify-center mt-0.5 shrink-0">
                  <input
                    type="radio"
                    name="ai_voice_persona"
                    value={persona.id}
                    checked={isSelected}
                    onChange={() => handleSelectPersona(persona.id)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? `${persona.borderColor} bg-purple-500/30` : 'border-slate-600 group-hover:border-slate-400'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#00F0FF]" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? persona.color : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className={`text-xs font-bold font-mono truncate ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {persona.name}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-tight line-clamp-2">
                    {persona.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${persona.badgeBg}`}>
                      {persona.tagline}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-mono text-cyan-300 font-bold animate-pulse">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left: Conversation Stream & Input (7 cols) */}
        <div id="live-simulator-container" className="lg:col-span-7 flex flex-col h-[620px] lg:h-[680px] rounded-3xl glass-card border border-slate-700/80 bg-slate-950/90 shadow-2xl relative z-20">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0E1438]/90 backdrop-blur-md gap-3 rounded-t-3xl relative z-30">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs sm:text-sm font-mono text-cyan-200 font-bold">Active Gemini 3.8 Live Telephony Bridge</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/50 font-bold hidden xl:inline-block">
                Tone: {getPersonaById(selectedPersonaId).name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Voice Biometrics Header Pill */}
              <button
                onClick={toggleBiometrics}
                title="Toggle High-Security Voice Biometrics Authentication"
                className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                {renderVerificationBadge()}
              </button>
              {/* Dialect Selector Pill in Header */}
              <div className="relative z-50" ref={headerDialectDropdownRef}>
                <button
                  onClick={() => setIsHeaderDialectDropdownOpen(!isHeaderDialectDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 hover:border-cyan-400/60 text-xs font-mono text-cyan-200 transition-all cursor-pointer shadow-sm select-none"
                  title="Switch speech synthesis & recognition dialect"
                >
                  <span className="text-sm">{selectedDialect.flag}</span>
                  <span className="font-bold">{selectedDialect.name}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isHeaderDialectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isHeaderDialectDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl bg-[#090D2A] border-2 border-cyan-400/80 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-[100] animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                      Switch Active Dialect
                    </div>
                    <div className="space-y-1 mt-1">
                      {GLOBAL_DIALECTS.map(dialect => (
                        <button
                          key={dialect.code}
                          onClick={() => handleSelectDialect(dialect)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-mono transition-all cursor-pointer ${
                            selectedDialect.code === dialect.code
                              ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-400/40'
                              : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{dialect.flag}</span>
                            <span className="truncate">{dialect.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{dialect.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Header Toggle Switch */}
              <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-700/80 flex items-center text-[11px] font-mono">
                <button
                  onClick={() => setVoiceMode('synthetic')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    voiceMode === 'synthetic'
                      ? 'bg-amber-500/25 border border-amber-400/60 text-amber-200 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3 h-3" />
                  <span>Synthetic</span>
                </button>
                <button
                  onClick={() => setVoiceMode('human-like')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    voiceMode === 'human-like'
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Human-like</span>
                </button>
              </div>

              {/* Mute/Unmute Audio Toggle Button */}
              <button
                onClick={toggleAudioMute}
                title={isTTSActive ? "Mute simulated voice output (Click to silence)" : "Unmute simulated voice output (Click to enable audio feedback)"}
                aria-label={isTTSActive ? "Mute simulated voice output" : "Unmute simulated voice output"}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all cursor-pointer select-none ${
                  isTTSActive 
                    ? 'bg-emerald-500/20 border-emerald-400/80 text-emerald-200 font-semibold shadow-md shadow-emerald-500/10 hover:bg-emerald-500/30' 
                    : 'bg-red-500/15 border-red-500/50 text-red-300 font-semibold hover:bg-red-500/25 shadow-md shadow-red-500/10'
                }`}
              >
                {isTTSActive ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="flex items-center gap-1.5">
                      <span>Audio ON</span>
                      <span className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.15s]" />
                        <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.3s]" />
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Audio Muted</span>
                  </>
                )}
              </button>

              {/* Jump to Chat History Below */}
              <button
                onClick={() => {
                  setIsHistorySidebarOpen(true);
                  const el = document.getElementById('chat-history-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm select-none"
                title="View Chat History & Scenario Memory (Last 5 Transcriptions) down below"
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold hidden sm:inline">Chat History</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-bold">
                  {chatHistory.length}
                </span>
                <span className="text-[10px] text-cyan-400 hidden sm:inline">↓</span>
              </button>
            </div>
          </div>

          {/* Transcript Messages Container (Spacious full width) */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {transcript.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.speaker === 'caller' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                    {msg.speaker === 'caller' ? selectedProfile.name : 'VoiceFlow Gemini AI'}
                  </span>
                  {msg.speaker === 'system' && (
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      voiceMode === 'human-like'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    }`}>
                      {voiceMode === 'human-like' ? 'NEURAL 48kHz' : 'SYNTHETIC 8kHz'}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                    msg.speaker === 'caller'
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-tr-none shadow-cyan-950/30'
                      : 'bg-slate-900/95 text-slate-100 border border-slate-700/90 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* High-Security Voice Biometric Acoustic Verification Badge */}
                  {isBiometricsEnabled && msg.speaker === 'caller' && (
                    <div className="mt-2.5 pt-2 border-t border-cyan-400/30 flex items-center justify-between text-[10px] font-mono text-cyan-100 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-400/40">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Fingerprint className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                        <span>Voiceprint Match: 99.4%</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-400/40 font-extrabold uppercase">
                        AUTHENTICATED
                      </span>
                    </div>
                  )}

                  {/* Executed Action Badge inside transcript */}
                  {msg.actionExecuted && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/90 flex items-start gap-2 text-xs font-mono text-cyan-200 bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/30">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{msg.actionExecuted.details}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono text-cyan-300 bg-slate-900/80 p-3 rounded-2xl border border-cyan-400/40 w-fit shadow-lg">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="font-semibold">Gemini NLU Reasoning & Tone Calibrating...</span>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Preset Quick Prompts for Selected Persona */}
          <div className="px-5 py-2.5 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2.5 overflow-x-auto text-xs font-mono">
            <span className="text-slate-400 font-bold shrink-0">Try Saying:</span>
            {selectedProfile.id === 'caller_101' ? (
              <>
                <button
                  onClick={() => handleSendMessage("I've been charged TWICE for my subscription! Fix this immediately!")}
                  className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-200 border border-red-500/40 whitespace-nowrap cursor-pointer font-medium"
                >
                  "Charged twice, fix this!"
                </button>
                <button
                  onClick={() => handleSendMessage("I want to speak with a manager right now")}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  "Speak with manager"
                </button>
                <button
                  onClick={() => handleSendMessage("Yes, please process the refund and credit")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 whitespace-nowrap cursor-pointer font-medium"
                >
                  "Confirm refund"
                </button>
              </>
            ) : selectedProfile.id === 'caller_102' ? (
              <>
                <button
                  onClick={() => handleSendMessage("Yes, rebook me on the 11:30 AM American Airlines flight")}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/40 whitespace-nowrap cursor-pointer font-medium"
                >
                  "Rebook 11:30 AM flight"
                </button>
                <button
                  onClick={() => handleSendMessage("What other flight options do I have?")}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  "Other flight options?"
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSendMessage("Where is my package ORD-45678 right now?")}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/40 whitespace-nowrap cursor-pointer font-medium"
                >
                  "Where is package ORD-45678?"
                </button>
                <button
                  onClick={() => handleSendMessage("Can you text me the tracking link?")}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  "Text me tracking link"
                </button>
              </>
            )}
          </div>

          {/* User Input Bar with Mic & Send */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={toggleMic}
              title={isListening ? "Stop Listening" : "Speak into Microphone"}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-slate-700 hover:border-cyan-400'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Audio Feedback Mute/Unmute Quick Toggle */}
            <button
              onClick={toggleAudioMute}
              title={isTTSActive ? "Mute Simulated Voice Feedback (Audio is currently ON)" : "Unmute Simulated Voice Feedback (Audio is currently MUTED)"}
              aria-label={isTTSActive ? "Mute Voice Output" : "Unmute Voice Output"}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer border select-none ${
                isTTSActive
                  ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border-slate-700 hover:border-emerald-400/60 shadow-sm'
                  : 'bg-red-500/20 text-red-300 border-red-500/60 hover:bg-red-500/30 shadow-md shadow-red-500/20'
              }`}
            >
              {isTTSActive ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? `Listening in ${selectedDialect.name}...` : `Speak or type in ${selectedDialect.name} (${selectedDialect.telephonyAccent})...`}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-inner font-sans"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isProcessing}
              className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer transition-all hover:scale-105"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Real-Time Diagnostic Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Sentiment Radar Card */}
          <div className="p-5 rounded-3xl glass-card border border-slate-700/80 bg-[#0B0F2F]/90 shadow-xl">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">Emotion & Sentiment Radar</span>
              {getSentimentBadge(currentSentiment)}
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-1.5 font-medium">
                  <span>Sentiment Score (-1.0 to +1.0)</span>
                  <span className={`font-bold ${currentSentiment?.score && currentSentiment.score < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {currentSentiment?.score !== undefined ? currentSentiment.score.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, -(currentSentiment?.score || 0)) * 50}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, currentSentiment?.score || 0) * 50}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Urgency:</span>{' '}
                  <span className="text-amber-300 uppercase font-bold">{currentSentiment?.urgency || 'low'}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Patience:</span>{' '}
                  <span className="text-cyan-200 uppercase font-bold">{currentSentiment?.patience || 'patient'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Customer Satisfaction (CSAT) Recharts Graph */}
          <div className="p-5 rounded-3xl glass-card border border-emerald-500/40 bg-[#0B0F2F]/90 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  CSAT Sentiment Trend (Recharts)
                </span>
              </div>
              <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                Live: {Math.round((((currentSentiment?.score ?? 0.82) + 1) / 2) * 100)}%
              </span>
            </div>

            <p className="text-[11px] font-mono text-slate-400 mb-2">
              Real-time voice acoustics CSAT prediction per dialogue turn
            </p>

            <div className="h-36 w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={csatHistory} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="turn" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070A1E', borderColor: '#10B981', borderRadius: '12px', fontSize: '11px', color: '#F8FAFC' }}
                    formatter={(value: any) => [`${value}%`, 'CSAT Score']}
                  />
                  <ReferenceLine y={75} stroke="#334155" strokeDasharray="3 3" label={{ value: 'Target 75%', fill: '#94A3B8', fontSize: 9, position: 'insideTopRight' }} />
                  <Line
                    type="monotone"
                    dataKey="csat"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ fill: '#059669', r: 4, stroke: '#A7F3D0', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#34D399', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Voice AI Processing Mode Telemetry Card */}
          <div className={`p-5 rounded-3xl glass-card border transition-all shadow-xl ${
            voiceMode === 'human-like' ? 'border-cyan-500/40 bg-[#0B0F2F]/90' : 'border-amber-500/40 bg-[#140F0A]/90'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-mono uppercase tracking-wider font-bold ${
                voiceMode === 'human-like' ? 'text-cyan-300' : 'text-amber-300'
              }`}>
                Voice AI Processing Engine
              </span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                voiceMode === 'human-like'
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50'
                  : 'bg-amber-500/20 text-amber-200 border-amber-500/50'
              }`}>
                {voiceMode === 'human-like' ? 'HUMAN-LIKE NEURAL' : 'SYNTHETIC TOUCH-TONE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Acoustic Cadence:</span>
                <span className="font-bold text-white text-xs">
                  {voiceMode === 'human-like' ? 'Adaptive Sentiment (1.0x)' : 'Fixed Monotone (1.08x)'}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Emotional Prosody:</span>
                <span className={`font-bold text-xs ${voiceMode === 'human-like' ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {voiceMode === 'human-like' ? 'Active De-escalation' : 'Disabled (Mechanical)'}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Frequency Bandwidth:</span>
                <span className="font-bold text-cyan-300 text-xs">
                  {voiceMode === 'human-like' ? '48kHz Full-Band' : '8kHz PSTN Narrowband'}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Synthesis Latency:</span>
                <span className="font-bold text-purple-300 text-xs">
                  {voiceMode === 'human-like' ? '&lt; 280ms (Gemini)' : '&lt; 110ms (Cached)'}
                </span>
              </div>
            </div>
          </div>

          {/* Intent & Entity Extractor Card */}
          <div className="p-5 rounded-3xl glass-card border border-purple-500/40 bg-[#0B0F2F]/90 shadow-xl">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">Intent & Extracted Slots</span>
              <span className="text-xs font-mono text-purple-200 font-semibold bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/40">
                Confidence: {currentIntent ? `${Math.round(currentIntent.confidence * 100)}%` : '95%'}
              </span>
            </div>

            <div className="mb-3.5">
              <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-purple-500/25 text-purple-200 border border-purple-400/50 text-xs sm:text-sm font-bold">
                  {currentIntent?.intent_name || 'general_inquiry'}
                </span>
                <span className="text-xs text-slate-300 font-semibold">[{currentIntent?.category || 'GENERAL'}]</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-slate-300 mb-2 uppercase font-bold">Entities in Memory:</div>
              <div className="flex flex-wrap gap-2">
                {extractedEntities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 shadow-sm"
                  >
                    {ent.type}: <strong className="text-white font-bold">{ent.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Log / Escalation Packet */}
          <div className="flex-1 p-5 rounded-3xl glass-card border border-emerald-500/40 bg-[#0B0F2F]/90 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">CRM & Telephony Actions</span>
                {isResolved && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-200 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/40 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Call Resolved</span>
                  </span>
                )}
              </div>

              {escalationData ? (
                <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span>Warm Agent Handoff Packet Generated</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">{escalationData.summary}</p>
                  <div className="text-xs text-red-200 pt-1 border-t border-red-800">
                    Routing to Queue: <strong className="text-white">{escalationData.department}</strong> ({escalationData.priority})
                  </div>
                </div>
              ) : actionLog.length > 0 ? (
                <div className="space-y-2.5 max-h-40 overflow-y-auto">
                  {actionLog.map((act, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono shadow-sm">
                      <div className="flex justify-between text-cyan-300 font-bold mb-1">
                        <span>{act.name}</span>
                        <span className="text-slate-400 text-[10px]">{act.time}</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">{act.details}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  No external write transactions executed yet. As intents are completed, live Stripe refunds or carrier tracking calls will be recorded here.
                </p>
              )}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-medium">Biometric ANI: +1 (555) 234-5678</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>PCI-DSS Redacted</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat History & Test Scenario Memory Section (Placed DOWN below for spacious, zero-overlap readability) */}
      <div className="w-full mt-8">
        <ChatHistorySidebar
          history={chatHistory}
          isOpen={isHistorySidebarOpen}
          onToggle={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
          onLoadScenario={(utterance) => {
            setInputText(utterance);
          }}
          onClearHistory={() => setChatHistory([])}
          onResetHistory={() => setChatHistory(INITIAL_TEST_TRANSCRIPTIONS)}
          currentTranscript={transcript}
          callerName={isCustomMode ? customCallerName : selectedProfile.name}
          dialectName={selectedDialect.name}
          dialectCode={selectedDialect.code}
          voiceMode={voiceMode}
        />
      </div>
    </div>
  );
};
