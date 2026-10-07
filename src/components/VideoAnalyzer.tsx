import React, { useState } from 'react';
import { WarehouseCctvPlayer } from './WarehouseCctvPlayer';
import type { AnomalyEvent } from '../types';
import { DEMO_REFERENCE_ANALYSIS } from '../services/demoData';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface VideoAnalyzerProps {
  onOpenUploadModal?: () => void;
  onOpenWorkspace?: () => void;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ onOpenUploadModal, onOpenWorkspace }) => {
  const [currentTime, setCurrentTime] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AnomalyEvent | null>(null);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);

  // Jump to specific event
  const handleEventClick = (event: AnomalyEvent) => {
    setSelectedEvent(event);
    setSelectedTrackId(event.track_id);
    setCurrentTime(event.timestamp);
    setIsPlaying(false);
  };

  const resetPlayback = () => {
    setCurrentTime(0);
    setSelectedTrackId(null);
    setSelectedEvent(null);
    setIsPlaying(true);
  };

  return (
    <section id="demo" className="py-24 sm:py-32 border-t border-ink-900/10 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-mono tracking-widest-2xl text-ink-500 uppercase">
                SECTION // 02 — LIVE INTELLIGENCE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-safety-alert animate-ping" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink-900 font-normal tracking-tight">
              Warehouse CCTV Stream <span className="font-mono text-xl sm:text-2xl text-ink-400">#04</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                showBoxes
                  ? 'bg-ink-900 text-paper border-ink-900'
                  : 'bg-transparent text-ink-700 border-ink-900/20 hover:border-ink-900'
              }`}
            >
              BOUNDING BOXES
            </button>
            <button
              onClick={() => setShowTrails(!showTrails)}
              className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                showTrails
                  ? 'bg-ink-900 text-paper border-ink-900'
                  : 'bg-transparent text-ink-700 border-ink-900/20 hover:border-ink-900'
              }`}
            >
              TRAJECTORIES
            </button>
            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-mono bg-paper text-ink-900 border border-ink-900/30 hover:border-ink-900"
              >
                UPLOAD VIDEO
              </button>
            )}
          </div>
        </div>

        {/* Main Two-Column Product Demonstration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Large Video Player with Realistic CV Overlay */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div className="relative border border-ink-900/20 bg-[#0D0E12] shadow-xl overflow-hidden aspect-[16/10] sm:aspect-[16/9]">
              <WarehouseCctvPlayer
                currentTime={currentTime}
                isPlaying={isPlaying}
                onTimeUpdate={setCurrentTime}
                frames={DEMO_REFERENCE_ANALYSIS.frames}
                selectedTrackId={selectedTrackId}
                selectedEvent={selectedEvent}
                onSelectTrack={setSelectedTrackId}
                isDemo={true}
              />

              {/* Live Overlay Banner */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
                <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-paper/90 border border-white/10 uppercase tracking-widest">
                  CAM 04 · SECTOR 2B · REAL-TIME INFERENCE
                </span>
              </div>

              {/* Watermark Reticle info */}
              <div className="absolute bottom-4 left-4 z-20 hidden sm:block bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[9px] font-mono text-white/60 border border-white/5">
                INTERACTIVE DEMO: CLICK ANY EVENT ON RIGHT TO JUMP
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 bg-paper border border-ink-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full bg-ink-900 text-paper flex items-center justify-center hover:bg-ink-800 transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={resetPlayback}
                  className="w-9 h-9 border border-ink-900/20 text-ink-800 flex items-center justify-center hover:bg-ink-900/5 transition-colors"
                  title="Reset to 00:00"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="font-mono text-xs text-ink-800 tracking-wider">
                  00:{Math.floor(currentTime).toString().padStart(2, '0')} <span className="text-ink-400">/ 00:45</span>
                </div>
              </div>

              {/* Interactive Scrubber */}
              <div className="flex-1 w-full sm:w-auto mx-0 sm:mx-4">
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="0.5"
                  value={currentTime}
                  onChange={(e) => {
                    setCurrentTime(parseFloat(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full accent-ink-900 cursor-pointer h-1.5 bg-ink-900/20"
                />
              </div>

              {/* Quick Jump Event Markers */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-ink-600">
                <span className="hidden sm:inline uppercase text-ink-400">JUMP:</span>
                <button
                  onClick={() => { setCurrentTime(18); setIsPlaying(false); }}
                  className="px-2 py-1 border border-ink-900/15 hover:border-ink-900 hover:text-ink-900"
                >
                  00:18
                </button>
                <button
                  onClick={() => { setCurrentTime(27); setIsPlaying(false); }}
                  className="px-2 py-1 border border-ink-900/15 hover:border-ink-900 hover:text-ink-900"
                >
                  00:27
                </button>
                <button
                  onClick={() => { setCurrentTime(34); setIsPlaying(false); }}
                  className="px-2 py-1 border border-safety-alert text-safety-alert hover:bg-safety-alert/5 font-semibold"
                >
                  00:34 [CRITICAL]
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Intelligence Panel */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            {/* Header Telemetry Stat Cards */}
            <div className="p-6 bg-paper border border-ink-900/10 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-ink-900/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-safety-safe animate-pulse" />
                  <span className="font-mono text-xs font-semibold tracking-widest uppercase text-ink-900">
                    LIVE ANALYSIS
                  </span>
                </div>
                <span className="font-mono text-[10px] text-ink-500 uppercase">
                  DEMO BENCHMARK
                </span>
              </div>

              {/* Dynamic Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 pt-5">
                <div className="border-l-2 border-ink-900 pl-3">
                  <div className="font-display text-3xl font-normal text-ink-900">03</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500">
                    PEOPLE TRACKED
                  </div>
                </div>
                <div className="border-l-2 border-ink-900/40 pl-3">
                  <div className="font-display text-3xl font-normal text-ink-900">
                    {DEMO_REFERENCE_ANALYSIS.events.filter(e => e.timestamp <= currentTime).length}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500">
                    EVENTS (TO TIME)
                  </div>
                </div>
                <div className="border-l-2 border-safety-warn pl-3">
                  <div className="font-display text-3xl font-normal text-safety-warn">
                    {DEMO_REFERENCE_ANALYSIS.events.filter(e => e.timestamp <= currentTime && e.severity === 'VIOLATION').length}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500">
                    ZONE VIOLATIONS
                  </div>
                </div>
                <div className="border-l-2 border-safety-alert pl-3">
                  <div className="font-display text-3xl font-normal text-safety-alert">
                    {DEMO_REFERENCE_ANALYSIS.events.filter(e => e.timestamp <= currentTime && e.severity === 'CRITICAL').length}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500">
                    CRITICAL FALLS
                  </div>
                </div>
              </div>
            </div>

            {/* Time-Synchronized Event Feed */}
            <div className="p-6 bg-paper border border-ink-900/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-ink-900/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-widest-xl text-ink-900 font-semibold">
                    EVENT STREAM
                  </span>
                  <span className="text-[10px] font-mono text-ink-400">
                    (UP TO 00:{Math.floor(currentTime).toString().padStart(2, '0')})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-ink-400">
                  TEMPORAL CAUSALITY ACTIVE
                </span>
              </div>

              {DEMO_REFERENCE_ANALYSIS.events.filter(e => e.timestamp <= currentTime).length === 0 ? (
                <div className="py-6 text-center text-xs font-mono text-ink-400">
                  No events recorded up to current timestamp (00:{Math.floor(currentTime).toString().padStart(2, '0')}).
                </div>
              ) : (
                <div className="space-y-3">
                  {DEMO_REFERENCE_ANALYSIS.events
                    .filter(evt => evt.timestamp <= currentTime)
                    .map((evt) => {
                      const isSelected = selectedEvent?.id === evt.id;
                      const isCrit = evt.severity === 'CRITICAL';
                      const isViol = evt.severity === 'VIOLATION';

                      return (
                        <div
                          key={evt.id}
                          onClick={() => handleEventClick(evt)}
                          className={`p-3.5 border transition-all cursor-pointer relative group ${
                            isSelected
                              ? isCrit
                                ? 'border-safety-alert bg-safety-alert-subtle shadow-sm'
                                : 'border-safety-warn bg-amber-50 shadow-sm'
                              : 'border-ink-900/10 bg-background hover:border-ink-900/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                            <span className={`font-semibold flex items-center gap-1.5 ${isCrit ? 'text-safety-alert' : isViol ? 'text-safety-warn' : 'text-ink-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isCrit ? 'bg-safety-alert' : isViol ? 'bg-safety-warn' : 'bg-ink-700'}`} />
                              EVENT // {evt.severity}
                            </span>
                            <span className="text-ink-500 font-bold">00:{Math.floor(evt.timestamp).toString().padStart(2, '0')}.{Math.floor((evt.timestamp % 1) * 100).toString().padStart(2, '0')}</span>
                          </div>
                          <div className="text-sm font-sans font-semibold text-ink-900">
                            {evt.who} — {evt.what}
                          </div>
                          <div className="text-[11px] font-sans text-ink-600 mt-0.5">
                            {evt.location} · {Math.round(evt.confidence * 100)}% Confidence
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Transition to Full Operations Workspace Button */}
              {onOpenWorkspace && (
                <div className="pt-2">
                  <button
                    onClick={onOpenWorkspace}
                    className="w-full py-3 bg-ink-900 text-paper font-mono text-xs uppercase tracking-widest hover:bg-ink-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>OPEN FULL OPERATIONS CONSOLE (/analysis)</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>

            {/* Active Inspector Card if selected */}
            {selectedEvent && (
              <div className="p-5 border border-ink-900 bg-ink-900 text-paper shadow-md">
                <div className="flex items-center justify-between border-b border-paper/10 pb-2 mb-3 text-[10px] font-mono uppercase tracking-widest text-paper/70">
                  <span>TELEMETRY DETAIL</span>
                  <span>{selectedEvent.who}</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-paper/60">WHO:</span>
                    <span className="font-bold">{selectedEvent.who}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-paper/60">WHAT:</span>
                    <span className="font-bold text-safety-alert">{selectedEvent.what}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-paper/60">WHEN:</span>
                    <span>00:{Math.floor(selectedEvent.timestamp).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-paper/60">WHERE:</span>
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-paper/60">CONFIDENCE:</span>
                    <span>{Math.round(selectedEvent.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-paper/60">SEVERITY:</span>
                    <span className="uppercase text-safety-alert font-bold">{selectedEvent.severity}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
