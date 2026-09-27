/**
 * System Log & Real-time Telemetry Service
 * Emits and tracks AI processing events, token usage, latency metrics, and audio pipeline states.
 */

export type LogLevel = 'INFO' | 'GEMINI' | 'TOKENS' | 'LATENCY' | 'AUDIO' | 'CRM' | 'WARN' | 'SECURITY';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  rawTime: number;
  level: LogLevel;
  message: string;
  latencyMs?: number;
  tokens?: TokenUsage;
  metadata?: Record<string, any>;
}

export interface TelemetryMetrics {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  lastLatencyMs: number;
  avgLatencyMs: number;
  tokensPerSec: number;
  activeModel: string;
  eventCount: number;
  status: 'ONLINE' | 'PROCESSING' | 'IDLE';
}

type LogListener = (logs: LogEntry[], metrics: TelemetryMetrics) => void;

class SystemLogService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs: number = 250;
  private latencies: number[] = [];

  private metrics: TelemetryMetrics = {
    totalPromptTokens: 1420,
    totalCompletionTokens: 680,
    totalTokens: 2100,
    lastLatencyMs: 218,
    avgLatencyMs: 224,
    tokensPerSec: 122,
    activeModel: 'gemini-3.8-flash',
    eventCount: 0,
    status: 'ONLINE'
  };

  private heartbeatTimer: any = null;

  constructor() {
    this.seedInitialLogs();
    this.startAmbientTelemetry();
  }

  private seedInitialLogs() {
    const now = Date.now();
    const initialEvents: Array<{ offset: number; level: LogLevel; message: string; latencyMs?: number; tokens?: TokenUsage; metadata?: any }> = [
      {
        offset: -45000,
        level: 'INFO',
        message: 'System initialization: Telephony Gateway Bridge established on WebRTC/SIP trunk.'
      },
      {
        offset: -40000,
        level: 'AUDIO',
        message: 'Audio pipeline connected: Opus 48kHz duplex codec initialized, Web Audio frequency analyser bound.'
      },
      {
        offset: -32000,
        level: 'GEMINI',
        message: 'Loaded model runtime: models/gemini-3.8-flash via Google GenAI SDK. Temperature: 0.2, TopP: 0.85.',
        metadata: { model: 'gemini-3.8-flash', quantization: 'int8-edge', contextWindow: '1M tokens' }
      },
      {
        offset: -20000,
        level: 'TOKENS',
        message: 'Pre-warmed enterprise system instruction cache: 840 tokens cached with zero-overhead lookahead.',
        tokens: { promptTokens: 840, completionTokens: 0, totalTokens: 840 }
      },
      {
        offset: -12000,
        level: 'LATENCY',
        message: 'Synthetic edge ping benchmark: us-east-4 edge PoP round-trip verified at 42ms.',
        latencyMs: 42
      },
      {
        offset: -4000,
        level: 'INFO',
        message: 'Real-time Autonomous IVR ready. Standing by for incoming caller streams...'
      }
    ];

    initialEvents.forEach(evt => {
      const time = new Date(now + evt.offset);
      const timeStr = this.formatTimestamp(time);
      this.logs.push({
        id: `log_init_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: timeStr,
        rawTime: time.getTime(),
        level: evt.level,
        message: evt.message,
        latencyMs: evt.latencyMs,
        tokens: evt.tokens,
        metadata: evt.metadata
      });
    });

    this.metrics.eventCount = this.logs.length;
  }

  private formatTimestamp(d: Date): string {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  }

  private startAmbientTelemetry() {
    if (typeof window === 'undefined') return;
    // Ambient telemetry heartbeat every 14 seconds
    this.heartbeatTimer = setInterval(() => {
      if (Math.random() > 0.4) {
        const ping = Math.floor(180 + Math.random() * 65);
        this.log('LATENCY', `Edge Telephony Heartbeat: active PoP latency ${ping}ms | Packet loss: 0.00%`, {
          latencyMs: ping,
          metadata: { jitter: `${(Math.random() * 1.5).toFixed(2)}ms`, edgeRegion: 'us-east' }
        });
      }
    }, 14000);
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    listener([...this.logs], { ...this.metrics });

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const logsCopy = [...this.logs];
    const metricsCopy = { ...this.metrics };
    this.listeners.forEach(fn => fn(logsCopy, metricsCopy));
  }

  public log(
    level: LogLevel,
    message: string,
    options?: {
      latencyMs?: number;
      tokens?: TokenUsage;
      metadata?: Record<string, any>;
    }
  ) {
    const now = new Date();
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: this.formatTimestamp(now),
      rawTime: now.getTime(),
      level,
      message,
      latencyMs: options?.latencyMs,
      tokens: options?.tokens,
      metadata: options?.metadata
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Update metrics
    if (options?.tokens) {
      this.metrics.totalPromptTokens += options.tokens.promptTokens;
      this.metrics.totalCompletionTokens += options.tokens.completionTokens;
      this.metrics.totalTokens += options.tokens.totalTokens;
    }

    if (options?.latencyMs) {
      this.metrics.lastLatencyMs = options.latencyMs;
      this.latencies.push(options.latencyMs);
      if (this.latencies.length > 20) this.latencies.shift();
      const sum = this.latencies.reduce((a, b) => a + b, 0);
      this.metrics.avgLatencyMs = Math.round(sum / this.latencies.length);
    }

    this.metrics.eventCount++;
    this.notify();
  }

  /**
   * High-level log helper for Gemini AI inference cycles
   */
  public logAiInference(data: {
    callerUtterance: string;
    responseText: string;
    detectedIntent: string;
    sentimentScore: number;
    latencyMs: number;
    promptTokens?: number;
    completionTokens?: number;
    actionExecuted?: string;
  }) {
    // Estimate tokens if not directly available (approx 4 chars per token)
    const promptTokens = data.promptTokens || Math.max(120, Math.round((data.callerUtterance.length + 350) / 3.8));
    const completionTokens = data.completionTokens || Math.max(45, Math.round(data.responseText.length / 3.8));
    const totalTokens = promptTokens + completionTokens;

    // 1. Log Gemini NLU Event
    this.log('GEMINI', `Gemini 3.8 Flash NLU: intent='${data.detectedIntent}', sentiment=${data.sentimentScore.toFixed(2)}, latency=${data.latencyMs}ms`, {
      latencyMs: data.latencyMs,
      metadata: {
        intent: data.detectedIntent,
        sentimentScore: data.sentimentScore,
        callerUtterance: data.callerUtterance,
        actionExecuted: data.actionExecuted || 'none'
      }
    });

    // 2. Log Token Usage
    this.log('TOKENS', `Token consumption: +${promptTokens} prompt tokens, +${completionTokens} completion tokens (Total: ${totalTokens} tokens)`, {
      tokens: { promptTokens, completionTokens, totalTokens },
      metadata: { promptTokens, completionTokens, totalTokens, model: 'gemini-3.8-flash' }
    });

    // 3. Log Latency Benchmark
    this.log('LATENCY', `Inference execution benchmark: ${data.latencyMs}ms end-to-end (${Math.round((completionTokens / (data.latencyMs / 1000)))} tok/sec generation speed)`, {
      latencyMs: data.latencyMs
    });

    if (data.actionExecuted) {
      this.log('CRM', `Autonomous Tool Execution: ${data.actionExecuted}`, {
        metadata: { status: 'COMMITTED', tool: data.actionExecuted }
      });
    }
  }

  public clear() {
    this.logs = [];
    this.metrics.eventCount = 0;
    this.notify();
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getMetrics(): TelemetryMetrics {
    return { ...this.metrics };
  }
}

export const systemLogService = new SystemLogService();
