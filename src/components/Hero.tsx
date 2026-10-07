import React, { useState } from 'react';
import { WarehouseCctvPlayer } from './WarehouseCctvPlayer';
import { Play, Pause, ChevronRight, Cpu } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onLiveDemoClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onLiveDemoClick }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [heroTime, setHeroTime] = useState(12);

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between pt-28 pb-12 px-6 sm:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Top Section: Editorial Category / Subtitle */}
      <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-end justify-between border-b border-ink-900/10 gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest-xl text-ink-500 block mb-1">
            AUTONOMOUS COMPUTER VISION & BEHAVIOR UNDERSTANDING
          </span>
          <p className="text-xs font-mono text-ink-700">
            WORKPLACE & WAREHOUSE SAFETY // VERSION 2.4.0
          </p>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-mono text-ink-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-safety-safe" />
            ZERO-LATENCY INFERENCE
          </span>
          <span>SPATIAL-TEMPORAL GRAPHS</span>
        </div>
      </div>

      {/* Main Centerpiece: Headline + Immersive Warehouse CCTV Hero Video */}
      <div className="my-auto py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Oversized Editorial Headline */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-7">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-normal leading-[1.04] tracking-tighter text-ink-900">
            WE DON’T JUST <br />
            <span className="italic font-light">SEE</span> PEOPLE. <br />
            WE UNDERSTAND <br />
            <span className="font-semibold underline decoration-1 decoration-ink-900/20 underline-offset-8">
              WHAT THEY DO.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-ink-700 font-sans font-light max-w-xl leading-relaxed">
            Autonomous vision for tracking, behavior understanding, and workplace safety.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onAnalyzeClick}
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-ink-900 text-paper font-mono text-xs uppercase tracking-widest hover:bg-ink-800 transition-all border border-ink-900 shadow-sm"
            >
              <span>ANALYZE VIDEO</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onLiveDemoClick}
              className="inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-transparent hover:bg-ink-900/5 text-ink-900 font-mono text-xs uppercase tracking-widest transition-all border border-ink-900/30 hover:border-ink-900"
            >
              <span>VIEW LIVE DEMO</span>
            </button>
          </div>
        </div>

        {/* Right Column: Large Immersive Warehouse CCTV Visual Centerpiece */}
        <div className="lg:col-span-6">
          <div className="relative border border-ink-900/20 bg-[#0D0E12] shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9]">
            {/* Embedded Live Warehouse CCTV Canvas */}
            <WarehouseCctvPlayer
              currentTime={heroTime}
              isPlaying={isPlaying}
              onTimeUpdate={setHeroTime}
              selectedTrackId={null}
              selectedEvent={null}
              onSelectTrack={() => {}}
              isDemo={true}
            />

            {/* Play/Pause Minimal Overlay Button */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-ink-900/80 backdrop-blur-md text-paper border border-white/20 flex items-center justify-center hover:bg-ink-900 transition-colors"
                title={isPlaying ? "Pause CCTV feed" : "Play CCTV feed"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            </div>

            {/* Hero Quick Telemetry Ribbon */}
            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono text-paper/80 border border-white/10 uppercase tracking-widest">
              PRIMARY FEED // WHSE-BAY-04
            </div>
          </div>

          {/* Under-video metadata bar */}
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-ink-500 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-ink-700" />
              <span>YOLOv8x + BYTETRACK SPATIO-TEMPORAL</span>
            </span>
            <span>FEED 04 · LIVE INFERENCE</span>
          </div>
        </div>
      </div>

      {/* Bottom Technical Information Banner */}
      <div className="pt-6 border-t border-ink-900/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="flex flex-col items-center justify-center py-2 px-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500 mb-1">01</span>
          <span className="text-xs sm:text-sm font-mono font-medium uppercase tracking-widest text-ink-900">
            OBJECT DETECTION
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-2 px-3 border-l sm:border-l border-ink-900/10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500 mb-1">02</span>
          <span className="text-xs sm:text-sm font-mono font-medium uppercase tracking-widest text-ink-900">
            MULTI-OBJECT TRACKING
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-2 px-3 sm:border-l border-ink-900/10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500 mb-1">03</span>
          <span className="text-xs sm:text-sm font-mono font-medium uppercase tracking-widest text-ink-900">
            BEHAVIOR ANALYSIS
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-2 px-3 border-l border-ink-900/10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500 mb-1">04</span>
          <span className="text-xs sm:text-sm font-mono font-medium uppercase tracking-widest text-ink-900">
            EVENT DETECTION
          </span>
        </div>
      </div>
    </section>
  );
};
