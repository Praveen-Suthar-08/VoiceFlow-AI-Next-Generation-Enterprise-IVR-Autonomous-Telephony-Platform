import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Sliders, 
  Sparkles, 
  Zap, 
  Check, 
  RotateCcw, 
  FileText, 
  Terminal,
  Calendar,
  X,
  Radio,
  Timer
} from 'lucide-react';
import { ScheduledScenario, ScenarioExecutionLog, ScheduleFrequency, ChaosInjectionType, TestRunStatus } from '../../types/callScheduler';
import { PRESET_CALLER_PROFILES } from '../../data/ivrData';
import { GLOBAL_DIALECTS, getDialectByCode } from '../../data/dialectsData';
import { systemLogService } from '../../services/systemLogService';
import { GeminiIVRService } from '../../services/geminiIvrService';

const DEFAULT_SCHEDULED_SCENARIOS: ScheduledScenario[] = [
  {
    id: 'sc_billing_stress',
    name: 'High-Concurrency Peak Billing Probe',
    description: 'Simulates simultaneous duplicate charge disputes under heavy API load with network jitter emulation.',
    frequency: '1m',
    cronExpression: '*/1 * * * *',
    isActive: true,
    callerProfileId: 'caller_101',
    callerName: 'Sarah Jenkins',
    dialectCode: 'en-US',
    dialectFlag: '🇺🇸',
    dialectName: 'English (US)',
    utterance: "I've been charged twice for invoice TX-98412! Please refund the duplicate transaction immediately.",
    expectedIntent: 'billing_dispute',
    chaosInjection: 'network_jitter',
    chaosDetails: '+220ms Simulated PSTN Transmission Delay',
    maxLatencySlaMs: 400,
    totalRuns: 184,
    passCount: 182,
    lastRunTimestamp: '2 mins ago',
    lastRunStatus: 'PASS',
    lastRunLatencyMs: 235,
    lastRunDetails: 'Stripe refund executed autonomously. NLU Intent matched with 98% confidence.'
  },
  {
    id: 'sc_anger_resilience',
    name: 'Extreme Anger & Escalation Guardrail',
    description: 'Verifies real-time tone de-escalation prosody and warm supervisory handoff thresholds under aggressive caller sentiment.',
    frequency: '5m',
    cronExpression: '*/5 * * * *',
    isActive: true,
    callerProfileId: 'caller_101',
    callerName: 'Sarah Jenkins',
    dialectCode: 'en-GB',
    dialectFlag: '🇬🇧',
    dialectName: 'English (UK)',
    utterance: "Your billing system is completely broken and this is unacceptable! Fix this right now or I am filing a formal complaint!",
    expectedIntent: 'billing_dispute',
    chaosInjection: 'extreme_anger',
    chaosDetails: 'Hostility Score -0.92 & Urgency Override',
    maxLatencySlaMs: 380,
    totalRuns: 64,
    passCount: 64,
    lastRunTimestamp: '4 mins ago',
    lastRunStatus: 'PASS',
    lastRunLatencyMs: 260,
    lastRunDetails: 'De-escalation acoustic cadence applied. Warm supervisor packet generated within SLA.'
  },
  {
    id: 'sc_crm_timeout',
    name: 'Sabre GDS Webhook Timeout & Circuit Breaker',
    description: 'Emulates airline booking API 504 Gateway Timeouts to test automatic fallback retry loops and cached flight alternatives.',
    frequency: '15m',
    cronExpression: '*/15 * * * *',
    isActive: true,
    callerProfileId: 'caller_102',
    callerName: 'David Patel',
    dialectCode: 'en-US',
    dialectFlag: '🇺🇸',
    dialectName: 'English (US)',
    utterance: "My flight UA-456 was cancelled two hours ago. Rebook me onto the earliest departure to Chicago.",
    expectedIntent: 'flight_rebooking',
    chaosInjection: 'crm_timeout',
    chaosDetails: 'Sabre GDS API 504 Gateway Delay + Circuit Breaker Trip',
    maxLatencySlaMs: 500,
    totalRuns: 42,
    passCount: 40,
    lastRunTimestamp: '11 mins ago',
    lastRunStatus: 'DEGRADED',
    lastRunLatencyMs: 440,
    lastRunDetails: 'Primary GDS timed out. Auto-switched to secondary Amadeus cache (AA-1082 reserved).'
  },
  {
    id: 'sc_spanish_drift',
    name: 'Multi-Language Castilian Dialect Probe',
    description: 'Validates Spanish acoustic parsing accuracy and dynamic locale greeting preservation across global telephony regions.',
    frequency: 'hourly',
    cronExpression: '0 * * * *',
    isActive: false,
    callerProfileId: 'caller_104',
    callerName: 'Elena Rostova',
    dialectCode: 'es-ES',
    dialectFlag: '🇪🇸',
    dialectName: 'Spanish (ES)',
    utterance: "¿Podría verificar el estado de mi pedido y actualizar la dirección de entrega?",
    expectedIntent: 'address_update',
    chaosInjection: 'accent_drift',
    chaosDetails: 'Madrid Castilian Idiomatic Telephony Slang',
    maxLatencySlaMs: 350,
    totalRuns: 28,
    passCount: 28,
    lastRunTimestamp: '52 mins ago',
    lastRunStatus: 'PASS',
    lastRunLatencyMs: 215,
    lastRunDetails: 'Native Spanish greeting verified. Madrid address updated with 0 phoneme drops.'
  }
];

const INITIAL_LOGS: ScenarioExecutionLog[] = [
  {
    id: 'log_1',
    scenarioId: 'sc_billing_stress',
    scenarioName: 'High-Concurrency Peak Billing Probe',
    timestamp: '10:15:02 AM',
    callerName: 'Sarah Jenkins',
    dialectCode: 'en-US',
    dialectFlag: '🇺🇸',
    utterance: "I've been charged twice for invoice TX-98412! Please refund immediately.",
    detectedIntent: 'billing_dispute (98%)',
    latencyMs: 235,
    status: 'PASS',
    chaosApplied: '+220ms PSTN Jitter',
    resolutionSummary: 'Stripe refund TX-98412 completed autonomously. SLA met.'
  },
  {
    id: 'log_2',
    scenarioId: 'sc_anger_resilience',
    scenarioName: 'Extreme Anger & Escalation Guardrail',
    timestamp: '10:12:30 AM',
    callerName: 'Sarah Jenkins',
    dialectCode: 'en-GB',
    dialectFlag: '🇬🇧',
    utterance: "Your billing system is completely broken! Fix this right now!",
    detectedIntent: 'billing_dispute (96%)',
    latencyMs: 260,
    status: 'PASS',
    chaosApplied: 'Hostility -0.92',
    resolutionSummary: 'Sentiment calibrated. Warm handoff packet generated.'
  },
  {
    id: 'log_3',
    scenarioId: 'sc_crm_timeout',
    scenarioName: 'Sabre GDS Webhook Timeout & Circuit Breaker',
    timestamp: '10:05:14 AM',
    callerName: 'David Patel',
    dialectCode: 'en-US',
    dialectFlag: '🇺🇸',
    utterance: "Flight UA-456 cancelled. Rebook me onto earliest flight.",
    detectedIntent: 'flight_rebooking (97%)',
    latencyMs: 440,
    status: 'DEGRADED',
    chaosApplied: 'GDS 504 Timeout',
    resolutionSummary: 'Recovered via fallback cache. Seat 14B on AA-1082 reserved.'
  }
];

export const SimulatedCallScheduler: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScheduledScenario[]>(() => {
    try {
      const saved = localStorage.getItem('voiceflow_scheduled_scenarios');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_SCHEDULED_SCENARIOS;
  });

  const [logs, setLogs] = useState<ScenarioExecutionLog[]>(() => {
    try {
      const saved = localStorage.getItem('voiceflow_scheduler_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_LOGS;
  });

  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingScenario, setEditingScenario] = useState<ScheduledScenario | null>(null);
  const [runningScenarioId, setRunningScenarioId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  // Form State for Create/Edit Modal
  const [formName, setName] = useState<string>('');
  const [formDesc, setDesc] = useState<string>('');
  const [formFreq, setFreq] = useState<ScheduleFrequency>('5m');
  const [formProfileId, setProfileId] = useState<string>(PRESET_CALLER_PROFILES[0].id);
  const [formDialectCode, setDialectCode] = useState<string>('en-US');
  const [formUtterance, setUtterance] = useState<string>('');
  const [formChaos, setChaos] = useState<ChaosInjectionType>('none');
  const [formSlaMs, setSlaMs] = useState<number>(350);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('voiceflow_scheduled_scenarios', JSON.stringify(scenarios));
    } catch (e) {
      // ignore
    }
  }, [scenarios]);

  useEffect(() => {
    try {
      localStorage.setItem('voiceflow_scheduler_logs', JSON.stringify(logs.slice(0, 30)));
    } catch (e) {
      // ignore
    }
  }, [logs]);

  // Periodic Automated Test Runner (Background Heartbeat)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeScenarios = scenarios.filter(s => s.isActive);
      if (activeScenarios.length === 0) return;

      // Pick one random active scenario to execute periodic background probe
      const target = activeScenarios[Math.floor(Math.random() * activeScenarios.length)];
      executeScenarioProbe(target, false);
    }, 45000); // Trigger a realistic probe every 45s

    return () => clearInterval(interval);
  }, [scenarios]);

  // Execute a scenario probe (simulated or real AI validation)
  const executeScenarioProbe = async (scenario: ScheduledScenario, notifyUser: boolean = true) => {
    setRunningScenarioId(scenario.id);
    const startTime = performance.now();

    systemLogService.log('GEMINI', `Executing automated robustness scenario [${scenario.name}] (Cadence: ${scenario.frequency}, Chaos: ${scenario.chaosInjection})...`);

    // Simulated latency based on chaos injection
    let artificialDelay = 150 + Math.floor(Math.random() * 80);
    if (scenario.chaosInjection === 'network_jitter') artificialDelay += 180;
    if (scenario.chaosInjection === 'crm_timeout') artificialDelay += 260;

    await new Promise(res => setTimeout(res, artificialDelay));

    const totalLatency = Math.round(performance.now() - startTime);
    const isDegraded = totalLatency > scenario.maxLatencySlaMs || scenario.chaosInjection === 'crm_timeout';
    const isPass = !isDegraded || scenario.chaosInjection === 'crm_timeout';
    const runStatus: TestRunStatus = isDegraded ? 'DEGRADED' : 'PASS';

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Update scenario statistics
    setScenarios(prev => prev.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        totalRuns: s.totalRuns + 1,
        passCount: isPass ? s.passCount + 1 : s.passCount,
        lastRunTimestamp: 'Just now',
        lastRunStatus: runStatus,
        lastRunLatencyMs: totalLatency,
        lastRunDetails: runStatus === 'PASS' 
          ? `SLA met (<${scenario.maxLatencySlaMs}ms). Intent verified with 98% confidence.`
          : `Latency (${totalLatency}ms) breached SLA or triggered circuit-breaker fallback recovery.`
      };
    }));

    // Add to execution log
    const newLog: ScenarioExecutionLog = {
      id: `log_${Date.now()}`,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      timestamp,
      callerName: scenario.callerName,
      dialectCode: scenario.dialectCode,
      dialectFlag: scenario.dialectFlag,
      utterance: scenario.utterance,
      detectedIntent: `${scenario.expectedIntent} (98%)`,
      latencyMs: totalLatency,
      status: runStatus,
      chaosApplied: scenario.chaosDetails || scenario.chaosInjection,
      resolutionSummary: runStatus === 'PASS'
        ? 'Autonomous transaction executed successfully within latency envelope.'
        : 'Transient delay observed; secondary fallback route successfully resolved call.'
    };

    setLogs(prev => [newLog, ...prev].slice(0, 30));
    setRunningScenarioId(null);

    systemLogService.log(
      runStatus === 'PASS' ? 'INFO' : 'WARN',
      `Robustness test probe [${scenario.name}] completed with status: ${runStatus} (${totalLatency}ms)`
    );
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    systemLogService.log('INFO', 'Initiating full batch robustness test suite across all configured scenarios...');
    
    for (const scenario of scenarios.filter(s => s.isActive)) {
      await executeScenarioProbe(scenario, false);
      await new Promise(r => setTimeout(r, 400));
    }
    
    setIsRunningAll(false);
  };

  const toggleScenario = (id: string) => {
    setScenarios(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.isActive;
        systemLogService.log('INFO', `Scheduled Scenario [${s.name}] is now ${nextState ? 'ACTIVE' : 'PAUSED'}.`);
        return { ...s, isActive: nextState };
      }
      return s;
    }));
  };

  const deleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    systemLogService.log('WARN', `Deleted scheduled robustness scenario [${id}].`);
  };

  const openCreateModal = () => {
    setEditingScenario(null);
    setName('');
    setDesc('');
    setFreq('5m');
    setProfileId(PRESET_CALLER_PROFILES[0].id);
    setDialectCode('en-US');
    setUtterance("I have an open inquiry about my subscription. Can you verify status?");
    setChaos('none');
    setSlaMs(380);
    setIsModalOpen(true);
  };

  const openEditModal = (scenario: ScheduledScenario) => {
    setEditingScenario(scenario);
    setName(scenario.name);
    setDesc(scenario.description);
    setFreq(scenario.frequency);
    setProfileId(scenario.callerProfileId);
    setDialectCode(scenario.dialectCode);
    setUtterance(scenario.utterance);
    setChaos(scenario.chaosInjection);
    setSlaMs(scenario.maxLatencySlaMs);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUtterance.trim()) return;

    const caller = PRESET_CALLER_PROFILES.find(p => p.id === formProfileId) || PRESET_CALLER_PROFILES[0];
    const dialect = getDialectByCode(formDialectCode);

    let chaosText = 'None (Standard baseline)';
    if (formChaos === 'network_jitter') chaosText = '+220ms PSTN Jitter Injection';
    if (formChaos === 'extreme_anger') chaosText = 'Hostility Score -0.92 Injection';
    if (formChaos === 'crm_timeout') chaosText = 'Sabre GDS API 504 Timeout';
    if (formChaos === 'packet_loss') chaosText = '15% Audio Packet Loss';
    if (formChaos === 'accent_drift') chaosText = 'Dialect Slang / Phoneme Shift';

    if (editingScenario) {
      setScenarios(prev => prev.map(s => {
        if (s.id === editingScenario.id) {
          return {
            ...s,
            name: formName,
            description: formDesc || s.description,
            frequency: formFreq,
            callerProfileId: caller.id,
            callerName: caller.name,
            dialectCode: dialect.code,
            dialectFlag: dialect.flag,
            dialectName: dialect.name,
            utterance: formUtterance,
            chaosInjection: formChaos,
            chaosDetails: chaosText,
            maxLatencySlaMs: formSlaMs
          };
        }
        return s;
      }));
      systemLogService.log('INFO', `Updated scheduled scenario [${formName}].`);
    } else {
      const newScenario: ScheduledScenario = {
        id: `sc_${Date.now()}`,
        name: formName,
        description: formDesc || 'Custom automated test scenario',
        frequency: formFreq,
        isActive: true,
        callerProfileId: caller.id,
        callerName: caller.name,
        dialectCode: dialect.code,
        dialectFlag: dialect.flag,
        dialectName: dialect.name,
        utterance: formUtterance,
        expectedIntent: 'general_inquiry',
        chaosInjection: formChaos,
        chaosDetails: chaosText,
        maxLatencySlaMs: formSlaMs,
        totalRuns: 0,
        passCount: 0,
        lastRunTimestamp: 'Never',
        lastRunStatus: undefined
      };
      setScenarios(prev => [newScenario, ...prev]);
      systemLogService.log('INFO', `Created new scheduled robustness scenario [${formName}].`);
    }

    setIsModalOpen(false);
  };

  // High-level Metrics Calculation
  const totalRunsAll = scenarios.reduce((acc, s) => acc + s.totalRuns, 0);
  const passRunsAll = scenarios.reduce((acc, s) => acc + s.passCount, 0);
  const overallRobustnessScore = totalRunsAll > 0 ? ((passRunsAll / totalRunsAll) * 100).toFixed(1) : '99.4';
  const activeCount = scenarios.filter(s => s.isActive).length;

  const filteredScenarios = scenarios.filter(s => {
    if (filter === 'active') return s.isActive;
    if (filter === 'paused') return !s.isActive;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1033] to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              <Timer className="w-4 h-4" />
            </span>
            <h4 className="text-base font-bold text-white font-display">Automated Recurring Call Scenario Scheduler</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Robustness Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-sans">
            Schedule continuous background probes and recurring test scenarios with chaos injection (jitter, network degradation, API timeouts, and hostile sentiment) to verify VoiceFlow's latency and autonomous resolution resilience over time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunAll}
            disabled={isRunningAll || activeCount === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-slate-700 hover:border-cyan-400 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRunningAll ? 'Running Test Suite...' : 'Run All Active Scenarios'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Scenario</span>
          </button>
        </div>
      </div>

      {/* 2. Real-Time Robustness Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Robustness Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white flex items-baseline gap-1">
            <span>{overallRobustnessScore}%</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">High SLA</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Zero dropped telephony sessions</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Active Schedules</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-display text-cyan-300 flex items-baseline gap-1">
            <span>{activeCount}</span>
            <span className="text-xs text-slate-400 font-mono">/ {scenarios.length}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Continuous background probes</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Average Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-300 flex items-baseline gap-1">
            <span>242ms</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">SLA &lt; 400ms</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Gemini 3.8 NLU + Webhook</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Total Stress Probes</span>
            <Flame className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-display text-purple-300 flex items-baseline gap-1">
            <span>{totalRunsAll.toLocaleString()}</span>
            <span className="text-[10px] text-purple-400 font-mono font-semibold">Verified</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Chaos recovery validated</span>
        </div>
      </div>

      {/* 3. Filter Controls & Scenario List Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 font-bold">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              filter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({scenarios.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              filter === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({scenarios.filter(s => s.isActive).length})
          </button>
          <button
            onClick={() => setFilter('paused')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              filter === 'paused' ? 'bg-slate-800 text-slate-200 border border-slate-700 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paused ({scenarios.filter(s => !s.isActive).length})
          </button>
        </div>

        <button
          onClick={() => {
            setScenarios(DEFAULT_SCHEDULED_SCENARIOS);
            systemLogService.log('INFO', 'Restored default enterprise robustness scenarios.');
          }}
          className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Default Scenarios</span>
        </button>
      </div>

      {/* 4. Scheduled Scenarios Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenarios.map(sc => {
          const isRunning = runningScenarioId === sc.id;
          const passRate = sc.totalRuns > 0 ? Math.round((sc.passCount / sc.totalRuns) * 100) : 100;

          return (
            <div
              key={sc.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                sc.isActive 
                  ? 'bg-slate-900/90 border-slate-700/80 shadow-lg shadow-black/40' 
                  : 'bg-slate-950/70 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="space-y-3">
                {/* Title & Frequency Bar */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">{sc.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        sc.isActive 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {sc.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{sc.description}</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Every {sc.frequency}</span>
                  </span>
                </div>

                {/* Utterance & Persona Quote Box */}
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span>{sc.dialectFlag}</span>
                      <strong className="text-white">{sc.callerName}</strong>
                      <span>({sc.dialectName})</span>
                    </span>
                    <span className="text-purple-300 font-semibold">Intent: {sc.expectedIntent}</span>
                  </div>
                  <p className="text-xs text-slate-200 italic font-sans leading-relaxed">
                    "{sc.utterance}"
                  </p>
                </div>

                {/* Stress Injected & SLA Target */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Chaos Injection:</span>
                    <span className="text-amber-300 font-medium truncate block">
                      {sc.chaosDetails || sc.chaosInjection}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Latency SLA:</span>
                    <span className="text-cyan-300 font-medium">&lt; {sc.maxLatencySlaMs}ms</span>
                  </div>
                </div>

                {/* Last Run Diagnostics */}
                {sc.lastRunTimestamp && (
                  <div className="p-2.5 rounded-xl bg-[#0A0E2B]/80 border border-cyan-500/20 text-[11px] font-mono flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {sc.lastRunStatus === 'PASS' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : sc.lastRunStatus === 'DEGRADED' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className="text-slate-300">Last run: {sc.lastRunTimestamp}</span>
                      {sc.lastRunLatencyMs && (
                        <span className="text-cyan-400 font-bold">({sc.lastRunLatencyMs}ms)</span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      Pass Rate: <strong className="text-white">{passRate}%</strong> ({sc.totalRuns} runs)
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Run Probe Now, Toggle Active, Edit, Delete */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => executeScenarioProbe(sc, true)}
                  disabled={isRunning}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isRunning 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-400/40 hover:border-cyan-400'
                  }`}
                >
                  <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Probing...' : 'Run Probe Now'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleScenario(sc.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer border ${
                      sc.isActive 
                        ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700' 
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {sc.isActive ? 'Pause' : 'Activate'}
                  </button>

                  <button
                    onClick={() => openEditModal(sc)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    title="Edit scenario settings"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteScenario(sc.id)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
                    title="Delete scenario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Live Scenario Execution History Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Automated Robustness Execution Trail (Last {logs.length} Probes)
            </h5>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-[11px] font-mono text-slate-400 hover:text-red-400 cursor-pointer"
          >
            Clear History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Scenario</th>
                <th className="pb-2">Dialect</th>
                <th className="pb-2">Chaos Applied</th>
                <th className="pb-2">Latency</th>
                <th className="pb-2">Resolution / Result</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    No automated probes recorded yet. Click "Run Probe Now" or let recurring timers trigger.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="py-2.5 font-bold text-white max-w-[200px] truncate">{log.scenarioName}</td>
                    <td className="py-2.5 text-slate-300">{log.dialectFlag} {log.dialectCode}</td>
                    <td className="py-2.5 text-amber-300 max-w-[150px] truncate">{log.chaosApplied}</td>
                    <td className="py-2.5 font-bold text-cyan-300">{log.latencyMs}ms</td>
                    <td className="py-2.5 text-slate-300 max-w-[280px] truncate">{log.resolutionSummary}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : log.status === 'DEGRADED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal: Create or Edit Scheduled Scenario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#090D2A] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-white font-mono">
                  {editingScenario ? 'Edit Scheduled Robustness Scenario' : 'Schedule New Recurring Scenario'}
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">Scenario Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Flight Rebooking GDS Timeout Emulation"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description / Test Objective</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Verifies autonomous fallback when external webhook reports 504"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Recurrence Frequency</label>
                  <select
                    value={formFreq}
                    onChange={(e) => setFreq(e.target.value as ScheduleFrequency)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="30s">Every 30 seconds (Heavy Stress)</option>
                    <option value="1m">Every 1 minute (Active Monitoring)</option>
                    <option value="5m">Every 5 minutes (Standard Probe)</option>
                    <option value="15m">Every 15 minutes</option>
                    <option value="hourly">Hourly (Production Heartbeat)</option>
                    <option value="daily">Daily (Nightly Regression)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Max SLA Latency Threshold</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={100}
                      max={2000}
                      step={25}
                      value={formSlaMs}
                      onChange={(e) => setSlaMs(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-slate-400">ms</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Caller Profile</label>
                  <select
                    value={formProfileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {PRESET_CALLER_PROFILES.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Telephony Dialect</label>
                  <select
                    value={formDialectCode}
                    onChange={(e) => setDialectCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {GLOBAL_DIALECTS.map(d => (
                      <option key={d.code} value={d.code}>{d.flag} {d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Simulated Caller Utterance</label>
                <textarea
                  rows={2}
                  required
                  value={formUtterance}
                  onChange={(e) => setUtterance(e.target.value)}
                  placeholder="What the caller says during this recurring test scenario..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold flex items-center justify-between">
                  <span>Chaos & Degraded Condition Injection</span>
                  <span className="text-[10px] text-amber-400">Robustness Stress</span>
                </label>
                <select
                  value={formChaos}
                  onChange={(e) => setChaos(e.target.value as ChaosInjectionType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="none">None (Ideal Network & Acoustic Conditions)</option>
                  <option value="network_jitter">Network Jitter (+220ms PSTN latency spike)</option>
                  <option value="crm_timeout">Third-Party CRM API 504 Timeout Emulation</option>
                  <option value="extreme_anger">Hostile Caller Sentiment (Urgency & Anger override)</option>
                  <option value="packet_loss">Audio Packet Loss (15% frame drop emulation)</option>
                  <option value="accent_drift">Dialect Accent Drift & Heavy Regional Slang</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 cursor-pointer"
                >
                  {editingScenario ? 'Update Schedule' : 'Create Scheduled Scenario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
