export interface GlobalDialect {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  flag: string;
  sampleGreeting: string;
  telephonyAccent: string;
  ttsVoiceHint: string;
}

export const GLOBAL_DIALECTS: GlobalDialect[] = [
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (United States)',
    region: 'North America',
    flag: '🇺🇸',
    sampleGreeting: 'Thank you for calling TechCorp. How can I assist you today?',
    telephonyAccent: 'Standard General American',
    ttsVoiceHint: 'Natural Neural US'
  },
  {
    code: 'en-GB',
    name: 'English (UK)',
    nativeName: 'English (United Kingdom)',
    region: 'Western Europe',
    flag: '🇬🇧',
    sampleGreeting: 'Thank you for calling TechCorp. How may I be of service to you today?',
    telephonyAccent: 'British Received Pronunciation',
    ttsVoiceHint: 'Natural Neural UK'
  },
  {
    code: 'en-AU',
    name: 'English (Australia)',
    nativeName: 'English (Australia)',
    region: 'Oceania',
    flag: '🇦🇺',
    sampleGreeting: 'G\'day, thanks for calling TechCorp. How can I help you out today?',
    telephonyAccent: 'Standard Australian Commonwealth',
    ttsVoiceHint: 'Natural Australian English'
  },
  {
    code: 'en-IN',
    name: 'English (India)',
    nativeName: 'English (India)',
    region: 'South Asia',
    flag: '🇮🇳',
    sampleGreeting: 'Thank you for calling TechCorp. Kindly let me know how I may assist you today.',
    telephonyAccent: 'Subcontinental Indian English',
    ttsVoiceHint: 'Natural Indian English'
  },
  {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español (España)',
    region: 'Western Europe',
    flag: '🇪🇸',
    sampleGreeting: 'Gracias por llamar a TechCorp. ¿En qué podemos ayudarle hoy?',
    telephonyAccent: 'Castilian Spanish (Península)',
    ttsVoiceHint: 'Voz Neural Castellana'
  },
  {
    code: 'es-MX',
    name: 'Spanish (Mexico / LatAm)',
    nativeName: 'Español (México)',
    region: 'Latin America',
    flag: '🇲🇽',
    sampleGreeting: 'Hola, gracias por comunicarte a TechCorp. ¿En qué te puedo apoyar el día de hoy?',
    telephonyAccent: 'Latin American Spanish',
    ttsVoiceHint: 'Voz Neural Mexicana'
  },
  {
    code: 'fr-FR',
    name: 'French (France)',
    nativeName: 'Français (France)',
    region: 'Western Europe',
    flag: '🇫🇷',
    sampleGreeting: 'Merci d\'avoir contacté TechCorp. Comment puis-je vous aider aujourd\'hui ?',
    telephonyAccent: 'Metropolitan Standard French',
    ttsVoiceHint: 'Voix Naturelle Parisienne'
  },
  {
    code: 'fr-CA',
    name: 'French (Canada)',
    nativeName: 'Français (Canada)',
    region: 'North America',
    flag: '🇨🇦',
    sampleGreeting: 'Bonjour et bienvenue chez TechCorp. En quoi puis-je vous être utile aujourd\'hui ?',
    telephonyAccent: 'Québécois French',
    ttsVoiceHint: 'Voix Naturelle Québécoise'
  },
  {
    code: 'de-DE',
    name: 'German (Germany)',
    nativeName: 'Deutsch (Deutschland)',
    region: 'Central Europe',
    flag: '🇩🇪',
    sampleGreeting: 'Willkommen bei TechCorp. Wie kann ich Ihnen heute behilflich sein?',
    telephonyAccent: 'Standard Hochdeutsch',
    ttsVoiceHint: 'Natürliche Deutsche Stimme'
  },
  {
    code: 'ja-JP',
    name: 'Japanese (Japan)',
    nativeName: '日本語 (日本)',
    region: 'East Asia',
    flag: '🇯🇵',
    sampleGreeting: 'TechCorpにお電話いただきありがとうございます。本日はどのようなご用件でしょうか？',
    telephonyAccent: 'Tokyo Standard Keigo',
    ttsVoiceHint: '標準日本語音声'
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Mandarin)',
    nativeName: '中文 (普通话)',
    region: 'East Asia',
    flag: '🇨🇳',
    sampleGreeting: '您好，感谢致电TechCorp客服中心。请问有什么可以协助您的？',
    telephonyAccent: 'Standard Mandarin Putonghua',
    ttsVoiceHint: '标准普通话自然语音'
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    region: 'South America',
    flag: '🇧🇷',
    sampleGreeting: 'Olá, obrigado por ligar para a TechCorp. Como posso te ajudar hoje?',
    telephonyAccent: 'Brazilian Portuguese (Sudeste)',
    ttsVoiceHint: 'Voz Neural Brasileira'
  },
  {
    code: 'ar-SA',
    name: 'Arabic (Gulf / MSA)',
    nativeName: 'العربية (الخليج)',
    region: 'Middle East',
    flag: '🇸🇦',
    sampleGreeting: 'مرحباً بكم في تيك كورب. كيف يمكنني مساعدتكم اليوم؟',
    telephonyAccent: 'Modern Standard Arabic / Gulf',
    ttsVoiceHint: 'صوت عربي رقمي حديث'
  },
  {
    code: 'hi-IN',
    name: 'Hindi (India)',
    nativeName: 'हिन्दी (भारत)',
    region: 'South Asia',
    flag: '🇮🇳',
    sampleGreeting: 'टेककॉर्प में कॉल करने के लिए धन्यवाद। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    telephonyAccent: 'Standard Devanagari Hindi',
    ttsVoiceHint: 'मानक हिन्दी आवाज'
  }
];

export const getDialectByCode = (code: string): GlobalDialect => {
  return GLOBAL_DIALECTS.find(d => d.code.toLowerCase() === code.toLowerCase()) || GLOBAL_DIALECTS[0];
};
