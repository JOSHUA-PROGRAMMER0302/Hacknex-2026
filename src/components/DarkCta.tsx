import React from 'react';
import { ChevronRight } from 'lucide-react';

interface DarkCtaProps {
  onAnalyzeClick: () => void;
}

export const DarkCta: React.FC<DarkCtaProps> = ({ onAnalyzeClick }) => {
  return (
    <section className="relative min-h-[85vh] sm:min-h-screen bg-[#0D0E12] text-paper flex flex-col justify-between py-24 sm:py-32 px-6 sm:px-8 overflow-hidden select-none">
      {/* Background Subtle Tech Grid & Radial Vignette */}
      <div className="absolute inset-0 bg-grid-tech-dark opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0D0E12]/80 to-[#0D0E12] pointer-events-none" />

      {/* Top Banner */}
      <div className="max-w-7xl mx-auto w-full z-10 flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-safety-alert animate-ping" />
          <span className="text-[11px] font-mono tracking-widest-2xl text-paper/60 uppercase">
            SAFEWATCH CORE ENGINE // READY
          </span>
        </div>
        <span className="text-[10px] font-mono text-paper/40 hidden sm:inline uppercase">
          SPATIAL DETECTION · TEMPORAL UNDERSTANDING · REAL-TIME ARTIFACTS
        </span>
      </div>

      {/* Main Centerpiece Statement */}
      <div className="max-w-5xl mx-auto w-full z-10 my-auto py-12 text-center flex flex-col items-center">
        <div className="inline-block px-3 py-1 mb-8 border border-white/15 text-[10px] font-mono uppercase tracking-widest text-paper/70 bg-white/5">
          TIME-AWARE REVOLUTION IN SURVEILLANCE
        </div>

        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.02] tracking-tighter text-paper mb-8">
          DON’T JUST DETECT. <br />
          <span className="italic font-light text-paper/70">UNDERSTAND.</span>
        </h2>

        <p className="text-base sm:text-xl text-paper/70 font-sans font-light max-w-2xl leading-relaxed mb-12">
          SafeWatch AI turns video into meaningful, time-aware events.
        </p>

        <button
          onClick={onAnalyzeClick}
          className="group inline-flex items-center justify-center gap-4 px-10 py-4 bg-paper text-ink-900 font-mono text-xs uppercase tracking-widest hover:bg-white transition-all shadow-2xl hover:scale-[1.02]"
        >
          <span>ANALYZE A VIDEO</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Bottom Technical Telemetry Ribbon */}
      <div className="max-w-7xl mx-auto w-full z-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-paper/50 gap-4">
        <div className="flex items-center gap-4">
          <span>YOLOv8x POSE</span>
          <span>·</span>
          <span>BYTETRACK v2</span>
          <span>·</span>
          <span>SPATIO-TEMPORAL GCN</span>
        </div>
        <div>
          <span>ZERO-RETENTION ARCHITECTURE // LATENCY &lt;15MS</span>
        </div>
      </div>
    </section>
  );
};
