/**
 * VoiceFlow AI - Comprehensive IVR Data Models & Schemas
 */

export type CallStatus = 'active' | 'completed' | 'transferred' | 'abandoned';

export type ResolutionType = 'self_served' | 'escalated' | 'abandoned' | 'callback_scheduled';

export type PrimaryEmotion = 'angry' | 'frustrated' | 'anxious' | 'neutral' | 'satisfied' | 'happy' | 'confused';

export type EmotionTrajectory = 'escalating' | 'stable' | 'de-escalating';

export type CommunicationStyle = 'concise' | 'detailed' | 'guided' | 'patient';

export interface SentimentPoint {
  timestamp: string;
  score: number; // -1.0 to 1.0
  label: PrimaryEmotion;
  confidence: number;
  intensity: number; // 0.0 to 1.0
  urgency: 'low' | 'medium' | 'high' | 'critical';
  patience: 'exhausted' | 'low' | 'moderate' | 'patient';
  trajectory: EmotionTrajectory;
}

export interface Entity {
  type: 'order_number' | 'account_number' | 'phone_number' | 'date' | 'amount' | 'product_name' | 'person_name' | 'email' | 'address' | 'duration' | 'flight_number';
  value: string;
  confidence: number;
  rawText?: string;
}

export interface IntentDetection {
  timestamp: string;
  intent_name: string;
  confidence: number;
  category: 'BILLING' | 'SUPPORT' | 'ACCOUNT' | 'ORDER' | 'GENERAL' | 'EMERGENCY';
  entities: Record<string, string>;
  resolved: boolean;
  resolution_method?: string;
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  speaker: 'caller' | 'system' | 'agent';
  text: string;
  audioUrl?: string;
  confidence: number;
  intent?: string;
  sentiment?: SentimentPoint;
  entities?: Entity[];
  actionExecuted?: {
    name: string;
    status: 'success' | 'failed' | 'pending';
    details: string;
  };
}

export interface CallerProfile {
  id: string;
  name: string;
  phone: string;
  phoneHash: string;
  accountNumber: string;
  voiceSignatureVerified: boolean;
  languagePreference: string;
  communicationStyle: CommunicationStyle;
  loyaltyTier: 'standard' | 'silver' | 'gold' | 'platinum';
  currentBalance?: number;
  openTickets?: Array<{
    id: string;
    issue: string;
    status: string;
    createdAt: string;
  }>;
  recentOrders?: Array<{
    id: string;
    item: string;
    status: string;
    carrier: string;
    trackingNumber: string;
    estDelivery: string;
  }>;
  recentFlights?: Array<{
    id: string;
    flightNumber: string;
    route: string;
    status: 'on-time' | 'delayed' | 'cancelled';
    originalTime: string;
    alternativeOptions?: string[];
  }>;
  notes: string[];
}

export interface CallSession {
  id: string;
  callerPhone: string;
  callerId?: string;
  callerProfile?: CallerProfile;
  language: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  status: CallStatus;
  sentimentTrajectory: SentimentPoint[];
  intentsDetected: IntentDetection[];
  resolution?: ResolutionType;
  transcript: TranscriptEntry[];
  summary?: string;
  csatScore?: number;
  departmentTransferred?: string;
  crmRecordUpdated: boolean;
}

export interface FlowNode {
  id: string;
  type: 'greeting' | 'listen' | 'intent_router' | 'biometric_auth' | 'sentiment_guard' | 'crm_action' | 'transfer' | 'sms_followup' | 'end';
  title: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  sourceNode: string;
  targetNode: string;
  condition?: string;
  label?: string;
}

export interface IVRFlow {
  id: string;
  name: string;
  version: number;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  updatedAt: string;
  active: boolean;
}

export interface KnowledgeEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  usageCount: number;
  successRate: number;
  lastUpdated: string;
}

export interface CallMetrics {
  totalCallsToday: number;
  aiResolvedCount: number;
  escalatedCount: number;
  abandonedCount: number;
  avgDurationSeconds: number;
  avgSentimentScore: number;
  resolutionRatePct: number;
  estimatedCostSavingsUSD: number;
  csatAverage: number;
}
