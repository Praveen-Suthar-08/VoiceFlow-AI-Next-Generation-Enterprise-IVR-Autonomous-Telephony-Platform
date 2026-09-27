/**
 * Speech Service: Web Speech Synthesis, Recognition, and Web Audio Frequency Analyser
 */

export class SpeechService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;
  private static audioCtx: AudioContext | null = null;
  private static analyser: AnalyserNode | null = null;
  private static isSpeakingNow: boolean = false;

  public static isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && ('speechSynthesis' in window);
  }

  public static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Speak text with specific language, emotional modulation, and synthetic vs human-like processing
   */
  public static speak(
    text: string,
    lang: string = 'en-US',
    rate: number = 1.0,
    pitch: number = 1.0,
    voiceMode: 'synthetic' | 'human-like' = 'human-like',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      if (onStart) onStart();
      if (onEnd) setTimeout(onEnd, 2000);
      return;
    }

    // Cancel ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Apply voice mode characteristics
    if (voiceMode === 'synthetic') {
      // Robotic, monotone cadence characteristic of legacy telecom IVRs
      utterance.rate = 1.08;
      utterance.pitch = 0.82;
      const voices = this.synth.getVoices();
      // Try finding a more classic/robotic system voice if present
      const robotVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && (v.name.includes('Microsoft') || v.name.includes('David') || v.name.includes('Fred') || v.name.includes('Zira') || !v.name.includes('Natural')));
      if (robotVoice) {
        utterance.voice = robotVoice;
      }
    } else {
      // Human-like natural cadence with conversational sentiment inflection
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Pick high-fidelity natural neural voice matching dialect if available
      const voices = this.synth.getVoices();
      const normalizedLang = lang.toLowerCase().replace('_', '-');
      // 1. Try exact dialect match (e.g., en-GB, en-AU, es-MX, fr-CA)
      const exactDialectVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === normalizedLang);
      // 2. Try natural neural voice within dialect
      const naturalDialectVoice = voices.find(v => 
        v.lang.toLowerCase().replace('_', '-') === normalizedLang && 
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Premium'))
      );
      // 3. Fallback to general language group
      const languageGroupVoice = voices.find(v => v.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase()));

      if (naturalDialectVoice) {
        utterance.voice = naturalDialectVoice;
      } else if (exactDialectVoice) {
        utterance.voice = exactDialectVoice;
      } else if (languageGroupVoice) {
        utterance.voice = languageGroupVoice;
      }
    }

    utterance.onstart = () => {
      this.isSpeakingNow = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeakingNow = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingNow = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public static stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingNow = false;
    }
  }

  public static isSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  /**
   * Start microphone listening
   */
  public static startListening(
    lang: string = 'en-US',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void
  ): any {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Speech Recognition is not supported in this browser. Please type your message.');
      return null;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang;

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript, true);
        } else if (interimTranscript) {
          onResult(interimTranscript, false);
        }
      };

      rec.onerror = (event: any) => {
        onError(event.error);
      };

      rec.start();
      this.recognition = rec;
      return rec;
    } catch (e) {
      onError(e);
      return null;
    }
  }

  public static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
  }

  /**
   * Initialize Web Audio Analyser for real-time waveform visualization
   */
  public static getAudioAnalyser(): { analyser: AnalyserNode; getFrequencyData: () => Uint8Array } | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;
        this.audioCtx = new AudioCtx();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
      }

      const analyser = this.analyser;
      if (!analyser) return null;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      return {
        analyser,
        getFrequencyData: () => {
          analyser.getByteFrequencyData(dataArray);
          return dataArray;
        }
      };
    } catch (e) {
      return null;
    }
  }
}
