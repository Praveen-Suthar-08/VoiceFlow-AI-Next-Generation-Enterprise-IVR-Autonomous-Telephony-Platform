import { CallerProfile, KnowledgeEntry, IVRFlow, CallSession } from '../types/ivr';

export const PRESET_CALLER_PROFILES: CallerProfile[] = [
  {
    id: 'caller_101',
    name: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    phoneHash: 'e7a1f...92d',
    accountNumber: 'ACC-78904',
    voiceSignatureVerified: true,
    languagePreference: 'en-US',
    communicationStyle: 'concise',
    loyaltyTier: 'gold',
    currentBalance: 49.99,
    openTickets: [
      { id: 'TKT-456', issue: 'Duplicate subscription billing dispute ($49.99)', status: 'Pending Review', createdAt: '2 days ago' }
    ],
    notes: ['Called 3 times previously regarding duplicate charges', 'High churn risk, apply VIP empathy protocol'],
    recentOrders: [
      { id: 'ORD-78901', item: 'Smart Thermostat Pro', status: 'Delivered', carrier: 'FedEx', trackingNumber: 'FX-9920192', estDelivery: 'Yesterday' }
    ]
  },
  {
    id: 'caller_102',
    name: 'David Patel',
    phone: '+1 (555) 876-5432',
    phoneHash: 'b4c91...11e',
    accountNumber: 'ACC-33412',
    voiceSignatureVerified: true,
    languagePreference: 'en-US',
    communicationStyle: 'detailed',
    loyaltyTier: 'platinum',
    notes: ['Frequent business traveler', 'Flight UA-456 to Chicago cancelled 2 hours ago by airline due to weather'],
    recentFlights: [
      {
        id: 'FLT-902',
        flightNumber: 'UA-456',
        route: 'SFO -> ORD (Chicago)',
        status: 'cancelled',
        originalTime: '10:00 AM Today',
        alternativeOptions: ['UA-789 (2:15 PM, Free rebook)', 'AA-321 (11:30 AM, +$45 diff)', 'Full Refund ($380)']
      }
    ]
  },
  {
    id: 'caller_103',
    name: 'John Smith',
    phone: '+1 (555) 432-1098',
    phoneHash: 'a8d2e...44b',
    accountNumber: 'ACC-12093',
    voiceSignatureVerified: true,
    languagePreference: 'en-US',
    communicationStyle: 'guided',
    loyaltyTier: 'standard',
    recentOrders: [
      { id: 'ORD-45678', item: 'Ultra 4K Home Security Hub', status: 'In Transit', carrier: 'UPS', trackingNumber: '1Z999AA10123456', estDelivery: 'Tomorrow, 2:00 PM' }
    ],
    notes: ['Prefers SMS tracking link notifications']
  },
  {
    id: 'caller_104',
    name: 'Elena Rostova',
    phone: '+34 612 345 678',
    phoneHash: 'c991a...88a',
    accountNumber: 'ACC-55209',
    voiceSignatureVerified: false,
    languagePreference: 'es-ES',
    communicationStyle: 'patient',
    loyaltyTier: 'silver',
    recentOrders: [
      { id: 'ORD-99214', item: 'Auriculares Inalámbricos Studio', status: 'Preparando envío', carrier: 'DHL Express', trackingNumber: 'DHL-887192', estDelivery: 'En 2 días' }
    ],
    notes: ['Speaks Spanish, automatic language routing enabled']
  }
];

export const PRESET_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'kb_01',
    category: 'Billing',
    question: 'How do refunds work for duplicate charges?',
    answer: 'Duplicate charges can be refunded instantly by the AI system up to $100 with immediate ledger credit and confirmation SMS.',
    keywords: ['refund', 'duplicate', 'double charged', 'dispute', 'charge error'],
    usageCount: 1420,
    successRate: 0.98,
    lastUpdated: '2026-09-20'
  },
  {
    id: 'kb_02',
    category: 'Orders',
    question: 'What is the standard delivery and tracking timeframe?',
    answer: 'Standard delivery is 2-4 business days. Real-time carrier tracking links can be sent instantly via SMS or read over the phone.',
    keywords: ['tracking', 'where is package', 'order status', 'delivery date', 'carrier'],
    usageCount: 3890,
    successRate: 0.99,
    lastUpdated: '2026-09-22'
  },
  {
    id: 'kb_03',
    category: 'Travel & Flight',
    question: 'What are passenger options when a flight is cancelled?',
    answer: 'Passengers can be rebooked on the next scheduled flight at zero cost, rebooked on partner airlines with fare differential calculation, or granted an immediate full refund to the original payment method.',
    keywords: ['flight cancelled', 'rebook', 'cancelled flight', 'delay', 'airline option'],
    usageCount: 840,
    successRate: 0.96,
    lastUpdated: '2026-09-24'
  },
  {
    id: 'kb_04',
    category: 'Technical Support',
    question: 'How do I reset my IoT Smart Hub device?',
    answer: 'Hold the rear reset button for 10 seconds until the amber LED flashes 3 times, then reopen the mobile app to re-pair via Bluetooth.',
    keywords: ['reset', 'troubleshooting', 'blinking amber', 'offline', 'setup device'],
    usageCount: 1120,
    successRate: 0.94,
    lastUpdated: '2026-09-18'
  }
];

export const INITIAL_DEFAULT_FLOW: IVRFlow = {
  id: 'flow_enterprise_main',
  name: 'Enterprise Natural Language Pipeline v3.8',
  version: 3,
  description: 'Full multi-modal contextual IVR flow with sentiment escalation, predictive routing and biometrics',
  active: true,
  updatedAt: '2026-09-25 18:30 UTC',
  nodes: [
    {
      id: 'node_1',
      type: 'greeting',
      title: 'Contextual Voice Greeting',
      description: 'Identifies caller ANI, checks recent open events, greets naturally',
      config: { dynamicNameGreeting: true, checkOutagesFirst: true },
      position: { x: 50, y: 150 }
    },
    {
      id: 'node_2',
      type: 'biometric_auth',
      title: 'Voice Biometrics & ANI Match',
      description: 'Passive acoustic frequency authentication (95%+ match threshold)',
      config: { confidenceThreshold: 0.95, fallbackToPasscode: true },
      position: { x: 320, y: 150 }
    },
    {
      id: 'node_3',
      type: 'intent_router',
      title: 'Gemini NLU & Intent Engine',
      description: 'Zero-shot classification across 45+ intents with slot filling',
      config: { model: 'gemini-3.8-flash', temperature: 0.2 },
      position: { x: 600, y: 150 }
    },
    {
      id: 'node_4',
      type: 'sentiment_guard',
      title: 'Real-Time Sentiment Guardian',
      description: 'Evaluates anger, urgency & patience. Escalates if anger > 0.7',
      config: { angerThreshold: 0.7, deescalationScript: 'empathy_first' },
      position: { x: 600, y: 320 }
    },
    {
      id: 'node_5',
      type: 'crm_action',
      title: 'Automated CRM & Action Engine',
      description: 'Executes Stripe refunds, UPS tracking lookup, or Flight rebooking API',
      config: { integrations: ['Salesforce', 'Stripe', 'Twilio', 'Zendesk'] },
      position: { x: 900, y: 150 }
    },
    {
      id: 'node_6',
      type: 'transfer',
      title: 'Warm Human Agent Escalation',
      description: 'Transfers live call with complete AI transcript, summary & sentiment packet',
      config: { queue: 'tier_2_vip', packetFormat: 'json_crm_sync' },
      position: { x: 900, y: 320 }
    },
    {
      id: 'node_7',
      type: 'sms_followup',
      title: 'Omnichannel SMS & Ticket Sync',
      description: 'Sends confirmation receipt, tracking link or calendar invite',
      config: { autoSendReceipt: true, csatSurveyAfterSec: 120 },
      position: { x: 1180, y: 150 }
    },
    {
      id: 'node_8',
      type: 'end',
      title: 'Graceful Call Resolution',
      description: 'Logs analytics, updates BigQuery vector store, closes session',
      config: { logBigQuery: true, triggerFeedback: true },
      position: { x: 1420, y: 150 }
    }
  ],
  edges: [
    { id: 'e1', sourceNode: 'node_1', targetNode: 'node_2', label: 'Call Connected' },
    { id: 'e2', sourceNode: 'node_2', targetNode: 'node_3', label: 'Voiceprint Verified' },
    { id: 'e3', sourceNode: 'node_3', targetNode: 'node_4', label: 'Emotion Checked' },
    { id: 'e4', sourceNode: 'node_3', targetNode: 'node_5', condition: 'sentiment_ok', label: 'High Confidence (>85%)' },
    { id: 'e5', sourceNode: 'node_4', targetNode: 'node_6', condition: 'anger > 0.7', label: 'High Distress Escalation' },
    { id: 'e6', sourceNode: 'node_5', targetNode: 'node_7', label: 'Transaction Approved' },
    { id: 'e7', sourceNode: 'node_7', targetNode: 'node_8', label: 'Resolved (Self-Service)' }
  ]
};

export const RECENT_CALL_SESSIONS_MOCK: CallSession[] = [
  {
    id: 'call_live_01',
    callerPhone: '+1 (555) 234-5678',
    callerId: 'caller_101',
    callerProfile: PRESET_CALLER_PROFILES[0],
    language: 'en-US',
    startedAt: '10:42 AM',
    durationSeconds: 94,
    status: 'completed',
    resolution: 'self_served',
    sentimentTrajectory: [
      { timestamp: '10:42:05', score: -0.85, label: 'angry', confidence: 0.95, intensity: 0.88, urgency: 'high', patience: 'low', trajectory: 'stable' },
      { timestamp: '10:42:40', score: -0.2, label: 'neutral', confidence: 0.89, intensity: 0.3, urgency: 'medium', patience: 'moderate', trajectory: 'de-escalating' },
      { timestamp: '10:43:30', score: 0.75, label: 'satisfied', confidence: 0.96, intensity: 0.7, urgency: 'low', patience: 'patient', trajectory: 'de-escalating' }
    ],
    intentsDetected: [
      { timestamp: '10:42:15', intent_name: 'dispute_charge', confidence: 0.97, category: 'BILLING', entities: { amount: '$49.99' }, resolved: true, resolution_method: 'instant_refund_credit' }
    ],
    transcript: [
      { id: 't1', timestamp: '10:42:02', speaker: 'system', text: 'Thank you for calling TechCorp. How can I help you today?', confidence: 1.0 },
      { id: 't2', timestamp: '10:42:12', speaker: 'caller', text: "I've been charged TWICE for my subscription and nobody is fixing this!", confidence: 0.96, intent: 'dispute_charge' },
      { id: 't3', timestamp: '10:42:25', speaker: 'system', text: "I'm really sorry about this duplicate charge of $49.99, Sarah. I have processed an immediate refund plus a $20 courtesy credit on your account.", confidence: 0.98, actionExecuted: { name: 'process_refund', status: 'success', details: 'Refunded $49.99 to Visa *5678 + $20 VIP Credit' } },
      { id: 't4', timestamp: '10:43:10', speaker: 'caller', text: 'Oh wow, thank you so much! That was super fast.', confidence: 0.98 }
    ],
    summary: 'Caller was distressed over duplicate subscription fee ($49.99). AI validated voiceprint, acknowledged emotion, refunded $49.99 immediately via Stripe, applied $20 credit, and logged ticket closure.',
    csatScore: 5,
    crmRecordUpdated: true
  },
  {
    id: 'call_live_02',
    callerPhone: '+1 (555) 876-5432',
    callerId: 'caller_102',
    callerProfile: PRESET_CALLER_PROFILES[1],
    language: 'en-US',
    startedAt: '10:35 AM',
    durationSeconds: 112,
    status: 'completed',
    resolution: 'self_served',
    sentimentTrajectory: [
      { timestamp: '10:35:05', score: -0.4, label: 'anxious', confidence: 0.91, intensity: 0.6, urgency: 'high', patience: 'moderate', trajectory: 'de-escalating' },
      { timestamp: '10:36:20', score: 0.8, label: 'satisfied', confidence: 0.98, intensity: 0.8, urgency: 'low', patience: 'patient', trajectory: 'de-escalating' }
    ],
    intentsDetected: [
      { timestamp: '10:35:10', intent_name: 'flight_rebooking', confidence: 0.99, category: 'ORDER', entities: { flight: 'UA-456', alternative: 'AA-321' }, resolved: true }
    ],
    transcript: [],
    summary: 'Predictive intent triggered for cancelled flight UA-456. Caller accepted alternative flight AA-321 (11:30 AM). Fare difference of $45 charged, new boarding pass emailed.',
    csatScore: 5,
    crmRecordUpdated: true
  },
  {
    id: 'call_live_03',
    callerPhone: '+1 (555) 432-1098',
    callerId: 'caller_103',
    callerProfile: PRESET_CALLER_PROFILES[2],
    language: 'en-US',
    startedAt: '10:20 AM',
    durationSeconds: 48,
    status: 'completed',
    resolution: 'self_served',
    sentimentTrajectory: [
      { timestamp: '10:20:05', score: 0.1, label: 'neutral', confidence: 0.92, intensity: 0.1, urgency: 'low', patience: 'patient', trajectory: 'stable' },
      { timestamp: '10:20:45', score: 0.9, label: 'happy', confidence: 0.99, intensity: 0.85, urgency: 'low', patience: 'patient', trajectory: 'stable' }
    ],
    intentsDetected: [
      { timestamp: '10:20:10', intent_name: 'track_shipment', confidence: 0.98, category: 'ORDER', entities: { order_number: 'ORD-45678' }, resolved: true }
    ],
    transcript: [],
    summary: 'Tracked package ORD-45678 (Ultra 4K Security Hub). Delivery confirmed for tomorrow 2:00 PM via UPS. SMS tracking link dispatched.',
    csatScore: 5,
    crmRecordUpdated: true
  },
  {
    id: 'call_live_04',
    callerPhone: '+34 612 345 678',
    callerId: 'caller_104',
    callerProfile: PRESET_CALLER_PROFILES[3],
    language: 'es-ES',
    startedAt: '10:11 AM',
    durationSeconds: 85,
    status: 'completed',
    resolution: 'self_served',
    sentimentTrajectory: [
      { timestamp: '10:11:05', score: 0.0, label: 'neutral', confidence: 0.90, intensity: 0.2, urgency: 'low', patience: 'moderate', trajectory: 'stable' }
    ],
    intentsDetected: [
      { timestamp: '10:11:15', intent_name: 'order_status_es', confidence: 0.95, category: 'ORDER', entities: { order_number: 'ORD-99214' }, resolved: true }
    ],
    transcript: [],
    summary: 'Caller interacted in Spanish. Auto-switched language to es-ES. Confirmed shipping status of Wireless Studio Headphones with DHL Express.',
    csatScore: 5,
    crmRecordUpdated: true
  }
];
