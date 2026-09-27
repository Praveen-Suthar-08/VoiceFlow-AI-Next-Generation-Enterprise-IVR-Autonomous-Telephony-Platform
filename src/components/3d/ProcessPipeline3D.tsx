import React, { useState } from 'react';
import { Mic, Fingerprint, BrainCircuit, HeartHandshake, Wrench, Volume2, ArrowRight, CheckCircle2 } from 'lucide-react';

interface StageInfo {
  id: number;
  title: string;
  subTitle: string;
  icon: any;
  color: string;
  inputExample: string;
  processingLogic: string;
  outputArtifact: string;
}

const PIPELINE_STAGES: StageInfo[] = [
  {
    id: 1,
    title: '1. Spoken Audio Capture',
    subTitle: 'Acoustic STT & Noise Filtering',
    icon: Mic,
    color: '#00D4FF',
    inputExample: '"I need to check where my package ORD-45678 is right now!"',
    processingLogic: 'Google Cloud Speech-to-Text V2 with dynamic beam search, acoustic noise reduction, and background environment classification.',
    outputArtifact: 'Confidence: 0.96 | Language: en-US | Audio Quality: 0.91'
  },
  {
    id: 2,
    title: '2. Voice Biometrics & Identity',
    subTitle: 'Passive Acoustic Verification',
    icon: Fingerprint,
    color: '#3B42D4',
    inputExample: 'Acoustic frequency harmonic match against voiceprint DB',
    processingLogic: 'Zero-touch voice biometrics matching against encrypted mathematical voice features (95%+ threshold) or ANI account lookup.',
    outputArtifact: 'Caller: John Smith (ACC-12093) | Voice Match: 97.4% Verified'
  },
  {
    id: 3,
    title: '3. Gemini NLU & Intent Engine',
    subTitle: 'Multi-Intent & Slot Extraction',
    icon: BrainCircuit,
    color: '#A855F7',
    inputExample: 'Text Token stream -> Zero-shot reasoning -> Slot extraction',
    processingLogic: 'Gemini 3.8 model classifies primary intent (track_shipment), extracts entities (order_number: "ORD-45678"), and verifies required slots.',
    outputArtifact: 'Intent: track_shipment (0.95) | Entity: ORD-45678'
  },
  {
    id: 4,
    title: '4. Sentiment & Emotion Radar',
    subTitle: 'Dynamic Tone & Empathy Guard',
    icon: HeartHandshake,
    color: '#EC4899',
    inputExample: 'Pacing: urgent | Tone: anxious/impatient | Trajectory: stable',
    processingLogic: 'Measures emotion intensity (0.6), urgency (high), and caller patience. Selects CONCISE communication style with proactive empathy.',
    outputArtifact: 'Emotion: anxious (0.6) | Style: Concise & Reassuring'
  },
  {
    id: 5,
    title: '5. Action Engine & CRM Sync',
    subTitle: 'Autonomous Tool Invocations',
    icon: Wrench,
    color: '#22C55E',
    inputExample: 'API Call: check_order_status("ORD-45678")',
    processingLogic: 'Directly executes webhook integration with UPS Logistics Gateway, retrieving real-time vehicle GPS status and scheduled delivery window.',
    outputArtifact: 'Status: In Transit (UPS) | Delivery: Tomorrow 2:00 PM'
  },
  {
    id: 6,
    title: '6. Neural TTS & Omnichannel Handoff',
    subTitle: 'Human-like Voice Synthesis',
    icon: Volume2,
    color: '#F59E0B',
    inputExample: 'Synthesized voice + SMS tracking link dispatch',
    processingLogic: 'Generates warm, natural-sounding voice response in under 280ms, accompanied by simultaneous Twilio SMS delivery to caller.',
    outputArtifact: 'Speech: 24kHz PCM | SMS Dispatched | CSAT Implied: 5/5'
  }
];

export const ProcessPipeline3D: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(3);
  const currentStage = PIPELINE_STAGES[activeStep - 1];

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl glass-card border border-slate-700/80 p-3.5 sm:p-6 lg:p-10 shadow-2xl shadow-cyan-950/20">
      {/* Step Waypoint Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3.5 mb-6 sm:mb-8">
        {PIPELINE_STAGES.map(stage => {
          const isCurrent = stage.id === activeStep;
          const isPassed = stage.id < activeStep;
          const IconComponent = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStep(stage.id)}
              className={`relative flex flex-col items-center text-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-[#0E1438] border-cyan-400 shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-400/50'
                  : isPassed
                  ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-slate-500'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <div
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 sm:mb-2.5 transition-transform hover:scale-110 shrink-0"
                style={{
                  backgroundColor: `${stage.color}25`,
                  color: stage.color,
                  boxShadow: isCurrent ? `0 0 20px ${stage.color}80` : 'none'
                }}
              >
                <IconComponent className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-sm font-bold text-white truncate w-full">{stage.title.split('. ')[1]}</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-cyan-300/80 truncate w-full mt-0.5 sm:mt-1 font-medium">{stage.subTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Showcase Card */}
      <div className="bg-[#0B0F2F]/95 rounded-xl sm:rounded-2xl border border-slate-700/80 p-4 sm:p-8 relative overflow-hidden shadow-2xl">
        <div 
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: currentStage.color }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 sm:mb-6 border-b border-slate-700/80 pb-4 sm:pb-5">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div
              className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-lg shrink-0"
              style={{
                backgroundColor: `${currentStage.color}25`,
                borderColor: `${currentStage.color}60`,
                color: currentStage.color
              }}
            >
              <currentStage.icon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-lg sm:text-2xl font-bold text-white flex flex-wrap items-center gap-2">
                <span>{currentStage.title}</span>
                <span className="text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 font-bold shrink-0">
                  Active Stage
                </span>
              </h4>
              <p className="text-xs sm:text-sm font-mono text-cyan-300/90 mt-0.5 truncate">{currentStage.subTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setActiveStep(prev => (prev > 1 ? prev - 1 : 6))}
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/90 text-xs sm:text-sm font-mono text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep(prev => (prev < 6 ? prev + 1 : 1))}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs sm:text-sm font-mono font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all hover:scale-105"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Input Data Stream */}
          <div className="bg-slate-900/95 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-700/80 shadow-lg">
            <div className="text-[10px] sm:text-[11px] uppercase font-mono text-cyan-300 tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              <span>Stage Input Data</span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-100 bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800 leading-relaxed break-words">
              {currentStage.inputExample}
            </p>
          </div>

          {/* AI Processing Logic */}
          <div className="bg-slate-900/95 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-700/80 shadow-lg">
            <div className="text-[10px] sm:text-[11px] uppercase font-mono text-purple-300 tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
              <span>Gemini Transformation</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-100 bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800 leading-relaxed font-sans break-words">
              {currentStage.processingLogic}
            </p>
          </div>

          {/* Output Artifact */}
          <div className="bg-slate-900/95 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-700/80 shadow-lg">
            <div className="text-[10px] sm:text-[11px] uppercase font-mono text-emerald-300 tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Output Artifact</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-2.5 bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed font-semibold break-words">
                {currentStage.outputArtifact}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
