import React, { useState } from 'react';
import { Rocket, Sparkles, Send, ShieldCheck, CheckCircle2, Lock, PhoneCall, ArrowUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CtaFooterSectionProps {
  isFullWidth?: boolean;
}

export const CtaFooterSection: React.FC<CtaFooterSectionProps> = ({ isFullWidth = true }) => {
  const [email, setEmail] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsBooked(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.7 }
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative pt-10 pb-12 border-t border-slate-800 bg-slate-950 overflow-hidden w-full">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
        {/* Large Final CTA Banner */}
        <div className="rounded-3xl glass-card border-2 border-cyan-400/40 p-8 sm:p-14 text-center relative overflow-hidden bg-gradient-to-b from-[#111642] via-slate-900 to-slate-950 shadow-2xl shadow-cyan-950/40">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 font-mono text-xs font-bold shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Deploy In Less Than 14 Days</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-tight tracking-tight">
              Ready to Transform Your Phone Menus into Intelligent Conversations?
            </h2>

            <p className="text-slate-200 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
              Connect VoiceFlow AI to your existing Twilio, Genesys, or Cisco telephony trunks in minutes with native CRM integrations.
            </p>

            {isBooked ? (
              <div className="bg-emerald-950/60 border border-emerald-400/60 p-5 rounded-2xl flex items-center justify-center gap-3 text-emerald-200 font-mono text-sm sm:text-base font-bold shadow-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                <span>Thank you! Our solutions architect will reach out within 2 hours with your pilot setup.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your enterprise email..."
                  className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-5 py-3.5 text-sm text-white placeholder-slate-400 font-medium focus:outline-none shadow-inner"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 font-mono font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Request Custom Pilot</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Compliance Icons */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-6 text-xs sm:text-sm font-mono text-slate-200">
              <span className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>SOC-2 Type II Certified</span>
              </span>
              <span className="flex items-center gap-2 font-medium">
                <Lock className="w-5 h-5 text-purple-400" />
                <span>PCI-DSS Level 1 Compliant</span>
              </span>
              <span className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>HIPAA & GDPR Ready</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold text-sm">VoiceFlow AI</span>
            <span className="text-slate-400">— Intelligent Gemini IVR Platform</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 text-emerald-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span>All Systems Operational (99.99% SLA)</span>
            </span>

            <button
              onClick={scrollToTop}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Back to Top"
            >
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
