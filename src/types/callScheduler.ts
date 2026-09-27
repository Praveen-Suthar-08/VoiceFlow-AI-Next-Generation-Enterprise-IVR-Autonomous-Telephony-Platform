export type ScheduleFrequency = '30s' | '1m' | '5m' | '15m' | 'hourly' | 'daily' | 'cron';

export type ChaosInjectionType = 'none' | 'network_jitter' | 'packet_loss' | 'extreme_anger' | 'crm_timeout' | 'accent_drift';

export type TestRunStatus = 'PASS' | 'DEGRADED' | 'FAIL' | 'RUNNING';

export interface ScheduledScenario {
  id: string;
  name: string;
  description: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  isActive: boolean;
  callerProfileId: string;
  callerName: string;
  dialectCode: string;
  dialectFlag: string;
  dialectName: string;
  utterance: string;
  expectedIntent: string;
  chaosInjection: ChaosInjectionType;
  chaosDetails?: string;
  maxLatencySlaMs: number;
  totalRuns: number;
  passCount: number;
  lastRunTimestamp?: string;
  lastRunStatus?: TestRunStatus;
  lastRunLatencyMs?: number;
  lastRunDetails?: string;
}

export interface ScenarioExecutionLog {
  id: string;
  scenarioId: string;
  scenarioName: string;
  timestamp: string;
  callerName: string;
  dialectCode: string;
  dialectFlag: string;
  utterance: string;
  detectedIntent: string;
  latencyMs: number;
  status: TestRunStatus;
  chaosApplied: string;
  resolutionSummary: string;
}
