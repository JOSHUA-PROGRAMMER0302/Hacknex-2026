import React, { useState } from 'react';
import type { VideoAnalysisResult, TrackedEntitySummary, AnomalyEvent, PipelineConfig } from '../types';
import { WarehouseCctvPlayer } from './WarehouseCctvPlayer';
import { CheckCircle2, AlertOctagon, Play, Pause, RotateCcw, Sliders, Bug } from 'lucide-react';

interface AnalysisDashboardProps {
  result: VideoAnalysisResult;
  onReset: () => void;
  config: PipelineConfig;
  onConfigChange: (newConfig: PipelineConfig) => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  result,
  onReset,
  config,
  onConfigChange
}) => {
  const initialTime = result.events.length > 0 ? result.events[0].timestamp : 0;
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(
    result.entities.length > 0 ? result.entities[0].track_id : null
  );
  const [selectedEvent, setSelectedEvent] = useState<AnomalyEvent | null>(
    result.events.length > 0 ? result.events[0] : null
  );
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);

  const handleEntitySelect = (entity: TrackedEntitySummary) => {
    setSelectedTrackId(entity.track_id);
    const matched = result.events.find(e => e.track_id === entity.track_id);
    if (matched) {
      setSelectedEvent(matched);
      setCurrentTime(matched.timestamp);
    }
  };

  const handleEventSelect = (evt: AnomalyEvent) => {
    setSelectedEvent(evt);
    setSelectedTrackId(evt.track_id);
    setCurrentTime(evt.timestamp); // Seeks video to exact event timestamp!
    setIsPlaying(false);
  };

  return (
    <section className="py-20 sm:py-28 border-t border-ink-900/10 bg-paper">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        {/* Banner: Analysis Complete with Real Counts */}
        <div className="p-8 border border-ink-900 bg-background shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-ink-900/10 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-safety-safe text-paper flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500">
                    INFERENCE ID: {result.analysis_id}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-ink-900 text-paper font-semibold">
                    {result.is_demo ? 'DEMO VIDEO' : 'LIVE INFERENCE'}
                  </span>
                </div>
                <h2 className="font-display text-3xl font-normal text-ink-900">
                  ANALYSIS COMPLETE
                </h2>
                <p className="text-xs font-mono text-ink-600 mt-0.5">
                  SOURCE FILE: {result.video_name} ({result.metadata.duration}s // {result.metadata.total_frames} FRAMES) · ENGINE: {result.metadata.model_engine}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar from Real Inference */}
            <div className="flex flex-wrap items-center gap-8 text-xs font-mono">
              <div>
                <span className="text-ink-400 uppercase text-[10px] block">PEOPLE TRACKED</span>
                <span className="text-2xl font-bold text-ink-900">{result.summary.people_tracked}</span>
              </div>
              <div className="border-l border-ink-900/15 pl-6">
                <span className="text-ink-400 uppercase text-[10px] block">EVENTS DETECTED</span>
                <span className="text-2xl font-bold text-ink-900">{result.summary.events_detected}</span>
              </div>
              <div className="border-l border-ink-900/15 pl-6">
                <span className="text-safety-alert uppercase text-[10px] block font-semibold">CRITICAL EVENTS</span>
                <span className="text-2xl font-bold text-safety-alert">{result.summary.critical_events}</span>
              </div>
              <div className="border-l border-ink-900/15 pl-6 flex items-center gap-3">
                <button
                  onClick={() => onConfigChange({ ...config, debugMode: !config.debugMode })}
                  className={`px-3 py-2 border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                    config.debugMode
                      ? 'bg-ink-900 text-paper border-ink-900'
                      : 'border-ink-900/30 text-ink-900 hover:border-ink-900'
                  }`}
                  title="Toggle real-time debug telemetry"
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>DEBUG {config.debugMode ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                  className="px-3 py-2 border border-ink-900/30 text-ink-900 hover:border-ink-900 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>CONFIG</span>
                </button>
                <button
                  onClick={onReset}
                  className="px-4 py-2 bg-ink-900 text-paper hover:bg-ink-800 text-xs font-mono uppercase tracking-wider"
                >
                  ANALYZE ANOTHER
                </button>
              </div>
            </div>
          </div>

          {/* Config Drawer for thresholds */}
          {showConfigDrawer && (
            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono border-t border-ink-900/10 mt-4">
              <div>
                <label className="text-ink-500 block mb-1.5 uppercase font-semibold">
                  PERSON CONFIDENCE: {Math.round(config.personConfidenceThreshold * 100)}%
                </label>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={config.personConfidenceThreshold}
                  onChange={(e) => onConfigChange({ ...config, personConfidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-ink-900 cursor-pointer"
                />
                <span className="text-[10px] text-ink-400 block mt-1">Filters out detections below this YOLO score</span>
              </div>
              <div>
                <label className="text-ink-500 block mb-1.5 uppercase font-semibold">
                  STATIONARY TIME THRESHOLD: {config.stationaryTimeThreshold}s
                </label>
                <input
                  type="range"
                  min="3.0"
                  max="20.0"
                  step="1.0"
                  value={config.stationaryTimeThreshold}
                  onChange={(e) => onConfigChange({ ...config, stationaryTimeThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-ink-900 cursor-pointer"
                />
                <span className="text-[10px] text-ink-400 block mt-1">Seconds of motionless dwell before STATIONARY triggers</span>
              </div>
              <div>
                <label className="text-ink-500 block mb-1.5 uppercase font-semibold">
                  RESTRICTED ZONE COORDINATES
                </label>
                <div className="text-[10px] text-ink-600 bg-paper p-2 border border-ink-900/10">
                  Polygon: [({config.restrictedPolygon.map(p => `${p[0]},${p[1]}`).join(') → (')})]
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unified Dashboard Grid: VIDEO + LIVE EVENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Video Player with Frame-Synchronized CV Graphics */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative border border-ink-900/20 bg-[#0D0E12] shadow-xl overflow-hidden aspect-[16/9]">
              <WarehouseCctvPlayer
                videoUrl={result.video_url}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onTimeUpdate={setCurrentTime}
                frames={result.frames}
                selectedTrackId={selectedTrackId}
                selectedEvent={selectedEvent}
                onSelectTrack={setSelectedTrackId}
                config={config}
                onConfigChange={onConfigChange}
                isDemo={result.is_demo}
              />

              {/* Status Header Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
                <span className="bg-black/80 px-2.5 py-1 text-[10px] font-mono text-paper border border-white/10 uppercase tracking-widest">
                  SYNCHRONIZED INFERENCE // {result.video_name}
                </span>
              </div>
            </div>

            {/* Video Controls & Scrubber */}
            <div className="p-4 bg-background border border-ink-900/10 flex items-center justify-between gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-ink-900 text-paper flex items-center justify-center hover:bg-ink-800"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="font-mono text-xs text-ink-900">
                00:{Math.floor(currentTime).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 10)} / 00:{Math.floor(result.metadata.duration).toString().padStart(2, '0')}
              </div>
              <input
                type="range"
                min="0"
                max={result.metadata.duration || 45}
                step="0.2"
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="flex-1 accent-ink-900 cursor-pointer h-1.5 bg-ink-900/20"
              />
              <button
                onClick={() => setCurrentTime(0)}
                className="p-1 text-ink-600 hover:text-ink-900"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Live Events Feed from Real Inference */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 bg-background border border-ink-900/15">
              <div className="flex items-center justify-between pb-3 border-b border-ink-900/10 mb-4">
                <h3 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink-900">
                  DETECTED EVENTS
                </h3>
                <span className="text-[10px] font-mono text-ink-400">
                  {result.events.length} ANOMALIES DETECTED
                </span>
              </div>

              {result.events.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-ink-500 bg-paper border border-ink-900/10">
                  No anomalous events detected in this video stream.
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {result.events.map((evt) => {
                    const isSelected = selectedEvent?.id === evt.id;
                    const isCrit = evt.severity === 'CRITICAL';
                    const isViol = evt.severity === 'VIOLATION';

                    return (
                      <div
                        key={evt.id}
                        onClick={() => handleEventSelect(evt)}
                        className={`p-4 border transition-all cursor-pointer ${
                          isSelected
                            ? isCrit
                              ? 'border-safety-alert bg-safety-alert-subtle shadow-sm'
                              : 'border-ink-900 bg-surface-subtle shadow-sm'
                            : 'border-ink-900/10 bg-paper hover:border-ink-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className={`font-semibold uppercase ${isCrit ? 'text-safety-alert' : isViol ? 'text-safety-alert' : 'text-amber-800'}`}>
                            {evt.severity}
                          </span>
                          <span className="font-bold text-ink-700">00:{Math.floor(evt.timestamp).toString().padStart(2, '0')}</span>
                        </div>
                        <div className="font-sans font-semibold text-sm text-ink-900">
                          {evt.who} — {evt.what}
                        </div>
                        <div className="text-[11px] text-ink-600 mt-1 font-mono">
                          {evt.location} · {Math.round(evt.confidence * 100)}% conf
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Tracked Entities (Dynamically Generated from Tracker) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink-900/15 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink-500">
                PERSISTENT MULTI-OBJECT TRACKS
              </span>
              <h3 className="font-display text-2xl text-ink-900 font-normal">
                TRACKED ENTITIES ({result.entities.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-ink-500">
              BYTETRACK PERSISTENT RE-IDENTIFICATION
            </span>
          </div>

          {result.entities.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-ink-500 bg-paper border border-ink-900/10">
              No human entities tracked above {Math.round(config.personConfidenceThreshold * 100)}% confidence threshold.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.entities.map((entity) => {
                const isSelected = selectedTrackId === entity.track_id;
                const isCrit = entity.status === 'CRITICAL';
                const isViol = entity.status === 'VIOLATION';
                const isUnusual = entity.status === 'UNUSUAL';

                return (
                  <div
                    key={entity.track_id}
                    onClick={() => handleEntitySelect(entity)}
                    className={`p-6 border transition-all cursor-pointer bg-background ${
                      isSelected
                        ? isCrit
                          ? 'border-safety-alert shadow-md bg-safety-alert-subtle ring-1 ring-safety-alert'
                          : 'border-ink-900 shadow-md bg-paper'
                        : 'border-ink-900/15 hover:border-ink-900'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-ink-900/10 mb-4">
                      <span className="font-mono text-xs font-bold text-ink-900">
                        {entity.id}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border font-semibold ${
                        isCrit
                          ? 'border-safety-alert text-safety-alert bg-red-100'
                          : isViol
                          ? 'border-safety-alert text-safety-alert bg-red-50'
                          : isUnusual
                          ? 'border-amber-300 text-amber-800 bg-amber-50'
                          : 'border-safety-safe text-safety-safe bg-green-50'
                      }`}>
                        {entity.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono text-ink-700">
                      <div className="flex justify-between">
                        <span className="text-ink-400">BEHAVIOR:</span>
                        <span className="font-semibold text-ink-900">{entity.current_behavior}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400">TRACKED:</span>
                        <span>{entity.tracked_duration_sec} sec</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400">DISTANCE:</span>
                        <span>{entity.distance_traveled_px} px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400">CONFIDENCE:</span>
                        <span>{Math.round(entity.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: Strict 6-Field Anomaly Forensic Record */}
        {selectedEvent && (
          <div className="p-8 border border-safety-alert/40 bg-[#0E0F12] text-paper shadow-xl">
            <div className="flex items-center gap-3 text-safety-alert font-mono text-xs tracking-widest uppercase mb-4">
              <AlertOctagon className="w-4 h-4" />
              <span>INCIDENT FORENSIC RECORD // FULL 6-ATTRIBUTE SPECIFICATION</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-xs font-mono mb-4">
              <div>
                <span className="text-paper/50 block text-[10px] uppercase">WHO</span>
                <span className="font-bold text-paper text-sm">{selectedEvent.who}</span>
              </div>
              <div>
                <span className="text-paper/50 block text-[10px] uppercase">WHAT</span>
                <span className="font-bold text-safety-alert text-sm">{selectedEvent.what}</span>
              </div>
              <div>
                <span className="text-paper/50 block text-[10px] uppercase">WHEN</span>
                <span className="font-bold text-paper text-sm">00:{Math.floor(selectedEvent.timestamp).toString().padStart(2, '0')}</span>
              </div>
              <div>
                <span className="text-paper/50 block text-[10px] uppercase">WHERE</span>
                <span className="font-bold text-paper text-sm">{selectedEvent.location}</span>
              </div>
              <div>
                <span className="text-paper/50 block text-[10px] uppercase">CONFIDENCE</span>
                <span className="font-bold text-green-400 text-sm">{Math.round(selectedEvent.confidence * 100)}%</span>
              </div>
              <div>
                <span className="text-paper/50 block text-[10px] uppercase">SEVERITY</span>
                <span className="font-bold text-safety-alert text-sm uppercase">{selectedEvent.severity}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-paper/15 text-xs font-sans text-paper/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong>Structured Alert:</strong> “{selectedEvent.who} — {selectedEvent.what} — 00:{Math.floor(selectedEvent.timestamp).toString().padStart(2, '0')} — {selectedEvent.location} — {Math.round(selectedEvent.confidence * 100)}% confidence.”
              </div>
              <div className="font-mono text-[10px] text-paper/40">
                FRAME TIME-LOCKED TELEMETRY
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
