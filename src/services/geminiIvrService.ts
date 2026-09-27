import { GoogleGenAI } from '@google/genai';
import { CallerProfile, SentimentPoint, Entity, IntentDetection, TranscriptEntry } from '../types/ivr';
import { PRESET_KNOWLEDGE_BASE } from '../data/ivrData';

const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return '';
};

import { VOICE_PERSONAS, VoicePersonaId, getPersonaById } from '../data/voicePersonas';

export interface ProcessCallResult {
  responseText: string;
  detectedIntent: IntentDetection;
  sentiment: SentimentPoint;
  entities: Entity[];
  actionExecuted?: {
    name: string;
    status: 'success' | 'failed' | 'pending';
    details: string;
  };
  shouldEscalate: boolean;
  escalationPacket?: {
    callerName: string;
    reason: string;
    department: string;
    priority: string;
    summary: string;
    sentimentScore: number;
  };
}

export class GeminiIVRService {
  /**
   * Process a caller utterance in real-time
   */
  public static async processUtterance(
    userInput: string,
    history: TranscriptEntry[],
    callerProfile: CallerProfile | null,
    currentLanguage: string = 'en-US',
    voicePersonaId: VoicePersonaId = 'professional'
  ): Promise<ProcessCallResult> {
    const inputLower = userInput.toLowerCase();
    const personaConfig = getPersonaById(voicePersonaId);

    // 1. Analyze Sentiment
    const sentiment = this.analyzeSentiment(userInput, history);

    // 2. Extract Entities
    const entities = this.extractEntities(userInput, callerProfile);

    // 3. Classify Intent
    const detectedIntent = this.classifyIntent(userInput, inputLower, entities);

    // 4. Check if escalation is required
    const isEscalationDemanded = 
      inputLower.includes('human') ||
      inputLower.includes('real person') ||
      inputLower.includes('agent') ||
      inputLower.includes('representative') ||
      inputLower.includes('operator') ||
      inputLower.includes('lawyer') ||
      inputLower.includes('lawsuit');

    const isSeverelyAngry = sentiment.label === 'angry' && sentiment.intensity > 0.82 && history.length >= 2;
    const shouldEscalate = isEscalationDemanded || isSeverelyAngry;

    // 5. Execute Action based on Intent & Context
    let actionExecuted: { name: string; status: 'success' | 'failed' | 'pending'; details: string } | undefined;
    let responseText = '';

    // Handle Predictive Intent for David Patel (Cancelled Flight)
    if (callerProfile?.id === 'caller_102' && (inputLower.includes('yes') || inputLower.includes('option 2') || inputLower.includes('11:30') || inputLower.includes('american'))) {
      actionExecuted = {
        name: 'rebook_flight',
        status: 'success',
        details: 'Rebooked on American Airlines AA-321 (11:30 AM). Charged $45 fare difference to card *5432.'
      };
      if (voicePersonaId === 'empathetic') {
        responseText = "I completely understand how stressful travel delays are, David! I've personally made sure you're confirmed on American Airlines flight AA-321 at 11:30 AM. Your updated itinerary is safely in your inbox.";
      } else if (voicePersonaId === 'fast-paced') {
        responseText = "Confirmed! AA-321 rebooked for 11:30 AM. $45 fare diff charged to card ending 5432. Receipt emailed instantly.";
      } else if (voicePersonaId === 'casual') {
        responseText = "Great choice, David! You're all set on flight AA-321 at 11:30 AM. Check your email for the new confirmation details!";
      } else {
        responseText = "I have confirmed your rebooking on American Airlines flight AA-321, departing at 11:30 AM and arriving at Chicago O'Hare at 1:45 PM. The $45 fare difference has been charged to your card ending in 5432.";
      }
    }
    // Handle Refund / Billing Dispute for Sarah Jenkins or general duplicate charge
    else if (detectedIntent.intent_name === 'dispute_charge' || inputLower.includes('charged twice') || inputLower.includes('double charge') || inputLower.includes('refund')) {
      const amount = entities.find(e => e.type === 'amount')?.value || '$49.99';
      actionExecuted = {
        name: 'process_refund',
        status: 'success',
        details: `Processed immediate refund of ${amount} via Stripe + added $20 VIP courtesy credit.`
      };
      const nameGreeting = callerProfile?.name ? `${callerProfile.name}` : '';
      if (voicePersonaId === 'empathetic') {
        responseText = `Oh, I am so sorry you had to deal with this duplicate charge ${nameGreeting}! I have processed a full refund of ${amount} immediately, plus a $20 courtesy credit to turn your day around.`;
      } else if (voicePersonaId === 'fast-paced') {
        responseText = `Duplicate charge reversed! ${amount} refunded instantly via Stripe plus $20 courtesy credit applied to account.`;
      } else if (voicePersonaId === 'casual') {
        responseText = `No worries at all ${nameGreeting}! I just sent back that ${amount} refund right now and added a extra $20 credit on us!`;
      } else {
        responseText = `I have immediately processed a full refund of ${amount} back to your card on file, and I've also applied a $20 courtesy credit to your next invoice as an apology.`;
      }
    }
    // Handle Order Tracking / Where is my package
    else if (detectedIntent.intent_name === 'track_shipment' || inputLower.includes('package') || inputLower.includes('tracking') || inputLower.includes('where is my order')) {
      const order = callerProfile?.recentOrders?.[0] || {
        id: 'ORD-45678',
        item: 'Smart Security Hub',
        status: 'In Transit',
        carrier: 'UPS',
        estDelivery: 'Tomorrow afternoon'
      };
      actionExecuted = {
        name: 'check_order_status',
        status: 'success',
        details: `Queried UPS Logistics API for ${order.id}. Status: ${order.status}, Carrier: ${order.carrier}.`
      };
      if (voicePersonaId === 'empathetic') {
        responseText = `Good news! Your order ${order.id} for the ${order.item} is safely ${order.status.toLowerCase()} with ${order.carrier}, set to arrive ${order.estDelivery}. I just sent live tracking to your mobile!`;
      } else if (voicePersonaId === 'fast-paced') {
        responseText = `Order ${order.id} status: ${order.status} via ${order.carrier}. Expected delivery ${order.estDelivery}. Live SMS link dispatched.`;
      } else if (voicePersonaId === 'casual') {
        responseText = `Awesome! Your package ${order.id} is on its way with ${order.carrier} and arriving ${order.estDelivery}. SMS link sent to your phone!`;
      } else {
        responseText = `I found your order ${order.id} for the ${order.item}. It is currently ${order.status.toLowerCase()} with ${order.carrier}, scheduled for delivery ${order.estDelivery}.`;
      }
    }
    // Handle Spanish / Multi-language support
    else if (currentLanguage.startsWith('es') || inputLower.includes('hola') || inputLower.includes('pedido') || inputLower.includes('ayuda') || inputLower.includes('gracias')) {
      responseText = "¡Hola! He detectado su preferencia de idioma en Español. He consultado el estado de su pedido reciente de los Auriculares Inalámbricos Studio: está siendo preparado por DHL Express y llegará en 2 días hábiles. ¿Desea recibir el número de seguimiento por SMS?";
      actionExecuted = {
        name: 'language_switch_and_query',
        status: 'success',
        details: 'Language switched to Spanish (es-ES). Order status retrieved from DHL.'
      };
    }
    // Handle Escalation
    else if (shouldEscalate) {
      actionExecuted = {
        name: 'transfer_to_agent',
        status: 'pending',
        details: 'Initiated priority warm transfer to Tier-2 Customer Support specialist.'
      };
      if (voicePersonaId === 'empathetic') {
        responseText = "I completely hear you, and I want to ensure you get the absolute best care. I am connecting you immediately with a senior support specialist with all your notes attached.";
      } else if (voicePersonaId === 'fast-paced') {
        responseText = "Initiating direct priority transfer to senior support specialist. Full transcript attached. Connecting now.";
      } else {
        responseText = "I am transferring you directly to a senior customer support specialist with your complete account history and notes. Please hold for just a few seconds while I connect you.";
      }
    }
    // Handle Knowledge Base & General Inquiries
    else {
      const kbMatch = this.searchKnowledgeBase(userInput);
      if (kbMatch) {
        actionExecuted = {
          name: 'search_knowledge_base',
          status: 'success',
          details: `Retrieved article ${kbMatch.id} (${kbMatch.category}) with 96% semantic relevance.`
        };
        responseText = `${kbMatch.answer} Would you like me to walk you through any additional steps?`;
      } else {
        const apiKey = getApiKey();
        if (apiKey) {
          try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `You are VoiceFlow AI, an intelligent IVR system for enterprise customer support.
Caller: "${userInput}"
Caller Profile: ${callerProfile ? `${callerProfile.name}, Tier: ${callerProfile.loyaltyTier}` : 'Unknown caller'}
Detected Intent: ${detectedIntent.intent_name}
Sentiment: ${sentiment.label}
Target Language and Regional Dialect: ${currentLanguage}
ACTIVE AI VOICE PERSONA: ${personaConfig.name.toUpperCase()}
TONE DIRECTIVE: ${personaConfig.promptDirective}

Reply as the phone IVR assistant.
Rules:
- Keep the response concise (1 to 2 short sentences, under 40 words).
- STRICTLY embody the tone directive of the selected persona (${personaConfig.name}).
- End with a helpful, natural question or verification step.
- CRITICAL: Respond fluently in the requested language and regional dialect (${currentLanguage}).
- Do NOT use bullet points, markdown, emojis, or say "I am an AI". Speak naturally as an enterprise phone voice assistant.`;

            const aiResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });

            if (aiResponse.text && aiResponse.text.trim()) {
              responseText = aiResponse.text.trim();
              actionExecuted = {
                name: 'gemini_nlu_generation',
                status: 'success',
                details: `Live response synthesized via Gemini [Persona: ${personaConfig.name}, Dialect: ${currentLanguage}].`
              };
            } else {
              responseText = this.getLocalizedFallback(currentLanguage);
            }
          } catch (e) {
            console.warn('Gemini API call failed, using dialogue manager fallback:', e);
            responseText = this.getLocalizedFallback(currentLanguage);
          }
        } else {
          responseText = this.getLocalizedFallback(currentLanguage);
        }
      }
    }

    let escalationPacket;
    if (shouldEscalate) {
      escalationPacket = {
        callerName: callerProfile?.name || 'Valued Customer',
        reason: isEscalationDemanded ? 'Direct human representative request' : 'Critical sentiment escalation',
        department: detectedIntent.category === 'BILLING' ? 'Billing Operations' : 'Technical Support',
        priority: sentiment.urgency === 'critical' || isSeverelyAngry ? 'CRITICAL (Tier-1)' : 'NORMAL',
        summary: `Caller is inquiring about ${detectedIntent.intent_name}. Real-time sentiment: ${sentiment.label} (intensity ${Math.round(sentiment.intensity * 100)}%).`,
        sentimentScore: sentiment.score
      };
    }

    return {
      responseText,
      detectedIntent,
      sentiment,
      entities,
      actionExecuted,
      shouldEscalate,
      escalationPacket
    };
  }

  /**
   * Sentiment & Emotion Analysis Engine
   */
  private static analyzeSentiment(input: string, history: TranscriptEntry[]): SentimentPoint {
    const text = input.toLowerCase();

    // Angry / Frustrated keywords
    const angryWords = ['terrible', 'ridiculous', 'awful', 'hate', 'lawyer', 'lawsuit', 'angry', 'pissed', 'scam', 'unacceptable', 'worst', 'charged twice', 'again', 'nobody is fixing', 'fed up', 'shut up'];
    const anxiousWords = ['cancelled', 'flight', 'urgent', 'worried', 'stranded', 'emergency', 'help me', 'asap', 'missed'];
    const happyWords = ['thank', 'great', 'awesome', 'wonderful', 'perfect', 'appreciate', 'fast', 'helpful', 'fantastic'];

    let score = 0.0;
    let label: SentimentPoint['label'] = 'neutral';
    let intensity = 0.2;
    let urgency: SentimentPoint['urgency'] = 'low';
    let patience: SentimentPoint['patience'] = 'moderate';
    let trajectory: SentimentPoint['trajectory'] = 'stable';

    const hasAngry = angryWords.some(w => text.includes(w));
    const hasAnxious = anxiousWords.some(w => text.includes(w));
    const hasHappy = happyWords.some(w => text.includes(w));

    if (hasAngry) {
      label = 'angry';
      score = -0.85;
      intensity = 0.88;
      urgency = 'high';
      patience = 'low';
      trajectory = history.length > 2 ? 'escalating' : 'stable';
    } else if (hasAnxious) {
      label = 'anxious';
      score = -0.45;
      intensity = 0.65;
      urgency = 'critical';
      patience = 'moderate';
      trajectory = 'stable';
    } else if (hasHappy) {
      label = 'happy';
      score = 0.85;
      intensity = 0.75;
      urgency = 'low';
      patience = 'patient';
      trajectory = 'de-escalating';
    } else if (text.includes('confused') || text.includes('how do i') || text.includes('not sure')) {
      label = 'confused';
      score = -0.15;
      intensity = 0.4;
      urgency = 'medium';
      patience = 'moderate';
      trajectory = 'stable';
    }

    return {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      score,
      label,
      confidence: 0.94,
      intensity,
      urgency,
      patience,
      trajectory
    };
  }

  /**
   * Entity Extractor
   */
  private static extractEntities(input: string, callerProfile: CallerProfile | null): Entity[] {
    const entities: Entity[] = [];
    const text = input;

    // Order number regex (e.g. ORD-12345 or ORD12345)
    const orderMatch = text.match(/ORD-?[0-9]{4,6}/i);
    if (orderMatch) {
      entities.push({
        type: 'order_number',
        value: orderMatch[0].toUpperCase(),
        confidence: 0.99
      });
    }

    // Account number regex (e.g. ACC-12345)
    const accountMatch = text.match(/ACC-?[0-9]{4,6}/i);
    if (accountMatch) {
      entities.push({
        type: 'account_number',
        value: accountMatch[0].toUpperCase(),
        confidence: 0.98
      });
    }

    // Currency amount (e.g. $49.99 or 49.99 dollars or 50)
    const amountMatch = text.match(/\$[0-9]+(\.[0-9]{2})?|[0-9]+(\.[0-9]{2})?\s*(dollars|bucks)/i);
    if (amountMatch) {
      entities.push({
        type: 'amount',
        value: amountMatch[0].startsWith('$') ? amountMatch[0] : `$${amountMatch[0]}`,
        confidence: 0.95
      });
    }

    // Flight number (e.g. UA-456 or AA-321)
    const flightMatch = text.match(/(UA|AA|DL|BA|LH)-?[0-9]{3,4}/i);
    if (flightMatch) {
      entities.push({
        type: 'flight_number',
        value: flightMatch[0].toUpperCase(),
        confidence: 0.97
      });
    }

    if (callerProfile) {
      entities.push({
        type: 'person_name',
        value: callerProfile.name,
        confidence: 1.0
      });
    }

    return entities;
  }

  /**
   * Intent Classifier
   */
  private static classifyIntent(input: string, inputLower: string, entities: Entity[]): IntentDetection {
    let intent_name = 'general_inquiry';
    let category: IntentDetection['category'] = 'GENERAL';
    let confidence = 0.88;

    if (inputLower.includes('charge') || inputLower.includes('refund') || inputLower.includes('balance') || inputLower.includes('bill') || inputLower.includes('payment') || inputLower.includes('subscription')) {
      intent_name = 'dispute_charge';
      category = 'BILLING';
      confidence = 0.96;
    } else if (inputLower.includes('flight') || inputLower.includes('chicago') || inputLower.includes('airline') || inputLower.includes('rebook') || inputLower.includes('airport')) {
      intent_name = 'flight_rebooking';
      category = 'ORDER';
      confidence = 0.98;
    } else if (inputLower.includes('order') || inputLower.includes('package') || inputLower.includes('track') || inputLower.includes('shipping') || inputLower.includes('delivery')) {
      intent_name = 'track_shipment';
      category = 'ORDER';
      confidence = 0.95;
    } else if (inputLower.includes('password') || inputLower.includes('address') || inputLower.includes('update info') || inputLower.includes('account')) {
      intent_name = 'update_account_info';
      category = 'ACCOUNT';
      confidence = 0.91;
    } else if (inputLower.includes('reset') || inputLower.includes('setup') || inputLower.includes('not working') || inputLower.includes('wifi') || inputLower.includes('broken')) {
      intent_name = 'technical_support';
      category = 'SUPPORT';
      confidence = 0.93;
    }

    const entityRecord: Record<string, string> = {};
    entities.forEach(e => {
      entityRecord[e.type] = e.value;
    });

    return {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      intent_name,
      confidence,
      category,
      entities: entityRecord,
      resolved: true
    };
  }

  /**
   * Semantic Knowledge Base Search
   */
  private static searchKnowledgeBase(query: string) {
    const q = query.toLowerCase();
    return PRESET_KNOWLEDGE_BASE.find(k => 
      k.keywords.some(kw => q.includes(kw)) ||
      q.includes(k.category.toLowerCase()) ||
      k.question.toLowerCase().split(' ').some(word => word.length > 4 && q.includes(word))
    );
  }

  /**
   * Localized fallback responses for global dialects when offline
   */
  private static getLocalizedFallback(langCode: string): string {
    const code = langCode.toLowerCase();
    if (code.startsWith('es')) {
      return "Con mucho gusto le ayudo con su consulta. ¿Podría proporcionarme más detalles o su número de cuenta para revisar su caso?";
    }
    if (code.startsWith('fr')) {
      return "Je serais ravi de vous aider. Pourriez-vous me fournir quelques détails ou votre numéro de compte afin d'accéder à votre dossier ?";
    }
    if (code.startsWith('de')) {
      return "Gerne helfe ich Ihnen dabei. Könnten Sie mir bitte weitere Details oder Ihre Kundennummer mitteilen, damit ich Ihre Akte aufrufen kann?";
    }
    if (code.startsWith('ja')) {
      return "喜んでサポートいたします。お客様のファイルを確認するため、詳細または口座番号をお教えいただけますでしょうか？";
    }
    if (code.startsWith('zh')) {
      return "非常乐意为您协助。能否请您提供更多细节或您的账户号码，以便我调取您的档案？";
    }
    if (code.startsWith('pt')) {
      return "Com certeza posso te ajudar com isso. Você poderia me passar mais detalhes ou seu número de conta para eu acessar seu cadastro?";
    }
    if (code.startsWith('ar')) {
      return "يسعدني جداً مساعدتك في ذلك. هل يمكنك تزويدي بمزيد من التفاصيل أو رقم حسابك لأتمكن من استرجاع ملفك؟";
    }
    if (code.startsWith('hi')) {
      return "मैं इस मामले में आपकी सहायता करने के लिए तैयार हूँ। क्या आप मुझे कुछ और विवरण या अपना खाता नंबर बता सकते हैं?";
    }
    if (code === 'en-gb') {
      return "I would be delighted to assist you with that straight away. Could you kindly provide your account number or a few more details so I can look into this?";
    }
    if (code === 'en-au') {
      return "No worries, I'd be happy to sort that out for you! Could you give me your account number or a few details so I can pull up your file?";
    }
    if (code === 'en-in') {
      return "I would be glad to assist you with this matter. Kindly provide your account number or a few details so I can verify your account.";
    }
    return "I would be glad to help you with that. Could you provide a few more details or your account number so I can retrieve your file?";
  }
}
