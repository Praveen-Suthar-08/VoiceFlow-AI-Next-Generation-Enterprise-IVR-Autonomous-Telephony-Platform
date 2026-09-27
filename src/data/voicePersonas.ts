/**
 * AI Voice Personas Data & Configurations
 */

export type VoicePersonaId = 'professional' | 'empathetic' | 'fast-paced' | 'casual';

export interface VoicePersona {
  id: VoicePersonaId;
  name: string;
  tagline: string;
  iconName: 'Briefcase' | 'Heart' | 'Zap' | 'Smile';
  color: string;
  borderColor: string;
  bgGlow: string;
  badgeBg: string;
  badgeText?: string;
  speechRate: number;
  speechPitch: number;
  promptDirective: string;
  description: string;
  sampleGreeting: string;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'professional',
    name: 'Professional Executive',
    tagline: 'Formal & Direct • 1.0x',
    iconName: 'Briefcase',
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400/80',
    bgGlow: 'bg-cyan-500/15',
    badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
    speechRate: 1.0,
    speechPitch: 1.0,
    promptDirective: 'Respond in a crisp, executive, highly professional enterprise tone. Be precise, polite, and direct without fluff.',
    description: 'Crisp corporate tone engineered for enterprise operations and VIP account management.',
    sampleGreeting: 'Good day. VoiceFlow Executive System standing by. How may I assist your inquiry today?'
  },
  {
    id: 'empathetic',
    name: 'Empathetic Support',
    tagline: 'Warm & Reassuring • 0.9x',
    iconName: 'Heart',
    color: 'text-rose-300',
    borderColor: 'border-rose-400/80',
    bgGlow: 'bg-rose-500/15',
    badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-400/50',
    speechRate: 0.92,
    speechPitch: 1.04,
    promptDirective: 'Respond with deep warmth, active listening, and genuine empathy. Validate customer feelings first before offering a solution.',
    description: 'Patience-first tone optimized for billing disputes, escalations, and sensitive inquiries.',
    sampleGreeting: 'Hello there. I hear you, and I am right here with you to make sure everything gets solved smoothly.'
  },
  {
    id: 'fast-paced',
    name: 'Fast-Paced Dispatch',
    tagline: 'Rapid & Concise • 1.25x',
    iconName: 'Zap',
    color: 'text-amber-300',
    borderColor: 'border-amber-400/80',
    bgGlow: 'bg-amber-500/15',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
    speechRate: 1.25,
    speechPitch: 0.98,
    promptDirective: 'Respond at high velocity and maximum conciseness. Skip preamble and provide instant action status and key metrics.',
    description: 'High-throughput cadence designed for logistics, flight dispatch, and high-volume queues.',
    sampleGreeting: 'VoiceFlow Dispatch online. State your order or account number for instant resolution.'
  },
  {
    id: 'casual',
    name: 'Casual & Friendly',
    tagline: 'Upbeat & Conversational • 1.05x',
    iconName: 'Smile',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-400/80',
    bgGlow: 'bg-emerald-500/15',
    badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
    speechRate: 1.05,
    speechPitch: 1.06,
    promptDirective: 'Respond in a friendly, relaxed, upbeat conversational tone. Use welcoming phrasing as if talking to a friend.',
    description: 'Approachable, humanized cadence for consumer apps, loyalty perks, and general help.',
    sampleGreeting: 'Hey! Thanks for calling. What can I help you take care of today?'
  }
];

export const getPersonaById = (id: VoicePersonaId): VoicePersona => {
  return VOICE_PERSONAS.find(p => p.id === id) || VOICE_PERSONAS[0];
};
