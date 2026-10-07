import React, { useState, useEffect, useRef } from 'react';
import type { VideoAnalysisResult, FrameRecord, FrameTrack, AnomalyEvent, PipelineConfig } from '../types';
import { WarehouseCctvPlayer } from './WarehouseCctvPlayer';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Bug,
  ArrowLeft,
  Upload
} from 'lucide-react';

interface AnalysisWorkspaceProps {
  result: VideoAnalysisResult;
  onReturnToMarketing: () => void;
  onUploadNewVideo: () => void;
  config: PipelineConfig;
  onConfigChange: (newConfig: PipelineConfig) => void;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  result,
  onReturnToMarketing,
  onUploadNewVideo,
  config,
  onConfigChange
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AnomalyEvent | null>(null);
  const [rightTab, setRightTab] = useState<'current' | 'entities'>('current');
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const duration = result.metadata.duration || 17.5;
  const frames = result.frames || [];
  const allEvents = result.events || [];

  // CURRENT STATE: Extract entities present in the current frame
  const currentFrame: FrameRecord | null = frames.length > 0
    ? frames.reduce((prev, curr) =>
        Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) ? curr : prev
      , frames[0])
    : null;

  const currentTracks: FrameTrack[] = currentFrame?.tracks || [];

  // EVENT HISTORY: Only events occurred UP TO current playback timestamp (Temporal Causality)
  const pastAndCurrentEvents = allEvents.filter(e => e.timestamp <= currentTime);

  // Keyboard shortcuts (SPACE = play/pause, LEFT/RIGHT = prev/next event, D = debug, ESC = deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        onConfigChange({ ...config, debugMode: !config.debugMode });
      } else if (e.code === 'Escape') {
        setSelectedTrackId(null);
        setSelectedEvent(null);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousEvent();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextEvent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allEvents, currentTime, config]);

  // Navigate to previous event
  const handlePreviousEvent = () => {
    const prior = [...allEvents]
      .filter(e => e.timestamp < currentTime - 0.2)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (prior.length > 0) {
      seekToEvent(prior[0]);
    } else {
      setCurrentTime(0);
    }
  };

  // Navigate to next event
  const handleNextEvent = () => {
    const next = [...allEvents]
      .filter(e => e.timestamp > currentTime + 0.2)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (next.length > 0) {
      seekToEvent(next[0]);
    }
  };

  const seekToEvent = (evt: AnomalyEvent) => {
    setCurrentTime(evt.timestamp);
    setSelectedEvent(evt);
    setSelectedTrackId(evt.track_id);
    setIsPlaying(false);
  };

  // Step single frame forward or backward (1/30 second)
  const stepFrame = (delta: number) => {
    setIsPlaying(false);
    setCurrentTime(prev => Math.max(0, Math.min(duration, Number((prev + delta * (1 / 29.97)).toFixed(3)))));
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0B0D11] text-[#E5E7EB] font-sans flex flex-col select-none"
    >
      {/* 1. TOP PROFESSIONAL STATUS BAR */}
      <header className="h-14 border-b border-white/10 bg-[#0E1117] px-6 flex items-center justify-between z-20">
        {/* Brand & Workspace Title */}
        <div className="flex items-center gap-6">
          <button
            onClick={onReturnToMarketing}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
            title="Return to Marketing Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>OVERVIEW</span>
          </button>

          <div className="h-4 w-[1px] bg-white/15" />

          <div className="flex items-center gap-3">
            <span className="font-sans font-bold tracking-widest text-sm text-white uppercase">
              SAFEWATCH <span className="font-light text-neutral-400 text-xs">AI</span>
            </span>
            <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase hidden sm:inline">
              // VIDEO ANALYSIS WORKSPACE
            </span>
          </div>
        </div>

        {/* Center Live Telemetry Metrics */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-mono text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-neutral-400 uppercase">STATUS:</span>
            <span className="font-semibold text-white">ONLINE</span>
          </div>

          <div>
            <span className="text-neutral-400 uppercase">MODE: </span>
            <span className={result.is_demo ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
              {result.is_demo ? "DEMO MODE (SYNTHETIC ANALYSIS)" : "LIVE INFERENCE (REAL YOLO)"}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 uppercase">FPS: </span>
            <span className="font-semibold text-white">{result.metadata?.fps || 25.0}</span>
          </div>

          <div>
            <span className="text-neutral-400 uppercase">DURATION: </span>
            <span className="font-semibold text-white">{duration.toFixed(1)}s</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onConfigChange({ ...config, debugMode: !config.debugMode })}
            className={`px-2.5 py-1 text-[11px] font-mono border uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              config.debugMode
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : 'border-white/15 text-neutral-400 hover:text-white hover:border-white/30'
            }`}
            title="Toggle Debug HUD (Key: D)"
          >
            <Bug className="w-3 h-3" />
            <span>DEBUG</span>
          </button>

          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className="px-2.5 py-1 text-[11px] font-mono border border-white/15 text-neutral-400 hover:text-white hover:border-white/30 uppercase tracking-wider flex items-center gap-1.5"
            title="Configure Thresholds"
          >
            <Sliders className="w-3 h-3" />
            <span>CONFIG</span>
          </button>

          <button
            onClick={onUploadNewVideo}
            className="px-3 py-1 bg-white text-black font-mono text-[11px] uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3 h-3" />
            <span>ANALYZE VIDEO</span>
          </button>
        </div>
      </header>

      {/* Optional Configuration Drawer */}
      {showConfigDrawer && (
        <div className="bg-[#12151D] border-b border-white/10 px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <label className="text-neutral-400 block mb-1 uppercase font-semibold">
              PERSON CONFIDENCE: {Math.round(config.personConfidenceThreshold * 100)}%
            </label>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={config.personConfidenceThreshold}
              onChange={(e) => onConfigChange({ ...config, personConfidenceThreshold: parseFloat(e.target.value) })}
              className="w-full accent-white cursor-pointer"
            />
            <span className="text-[10px] text-neutral-500">Filter out low-confidence detection proposals</span>
          </div>
          <div>
            <label className="text-neutral-400 block mb-1 uppercase font-semibold">
              STATIONARY THRESHOLD: {config.stationaryTimeThreshold}s
            </label>
            <input
              type="range"
              min="3.0"
              max="20.0"
              step="1.0"
              value={config.stationaryTimeThreshold}
              onChange={(e) => onConfigChange({ ...config, stationaryTimeThreshold: parseFloat(e.target.value) })}
              className="w-full accent-white cursor-pointer"
            />
            <span className="text-[10px] text-neutral-500">Continuous motionless dwell before stationary event</span>
          </div>
          <div>
            <label className="text-neutral-400 block mb-1 uppercase font-semibold">
              RESTRICTED ZONE (POLYGON)
            </label>
            <div className="text-[10px] text-neutral-300 bg-black/40 p-1.5 border border-white/10 rounded">
              High-Voltage AGV Corridor: [(480,260) → (860,260) → (860,480) → (480,480)]
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN ANALYSIS WORKSPACE (Two-Column Layout: 68% Video / 32% State & Telemetry) */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-[1680px] w-full mx-auto">
        {/* LEFT COLUMN (approx 68% Width): Video Viewer + Controls + Timeline + Event Table */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Large Dominant Video Container with Canvas Overlay */}
          <div className="relative border border-white/15 bg-black overflow-hidden aspect-[16/9] shadow-2xl">
            <WarehouseCctvPlayer
              videoUrl={result.video_url}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeUpdate={setCurrentTime}
              frames={frames}
              metadata={result.metadata}
              selectedTrackId={selectedTrackId}
              selectedEvent={selectedEvent}
              onSelectTrack={setSelectedTrackId}
              config={config}
              onConfigChange={onConfigChange}
              isDemo={result.is_demo}
            />

            {/* Video Watermark & Stream Tag */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <span className="bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white/90 border border-white/10 uppercase tracking-widest">
                CAM 04 · SECTOR 2B · {result.video_name}
              </span>
            </div>

            {/* Top Right Current Live Counter Badge */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <span className="bg-black/80 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-white/10">
                ACTIVE: {currentTracks.length} TRACKS
              </span>
            </div>
          </div>

          {/* Video Control Bar */}
          <div className="p-3 bg-[#12151D] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {/* Play/Pause & Frame Step Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors"
                title="Play/Pause (Space)"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => stepFrame(-1)}
                className="p-1.5 border border-white/15 hover:border-white/40 text-neutral-300"
                title="Step backward 1 frame"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => stepFrame(1)}
                className="p-1.5 border border-white/15 hover:border-white/40 text-neutral-300"
                title="Step forward 1 frame"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
                className="p-1.5 border border-white/15 hover:border-white/40 text-neutral-300"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Exact Timecode Display */}
              <div className="ml-2 font-mono text-xs text-white">
                00:{Math.floor(currentTime).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
                <span className="text-neutral-500"> / 00:{Math.floor(duration).toString().padStart(2, '0')}.00</span>
              </div>
            </div>

            {/* Event Navigation Jump Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousEvent}
                className="px-2.5 py-1 border border-white/15 hover:border-white text-neutral-300 hover:text-white text-[10px] uppercase flex items-center gap-1"
                title="Previous event (←)"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>PREV EVENT</span>
              </button>

              <button
                onClick={handleNextEvent}
                className="px-2.5 py-1 border border-white/15 hover:border-white text-neutral-300 hover:text-white text-[10px] uppercase flex items-center gap-1"
                title="Next event (→)"
              >
                <span>NEXT EVENT</span>
                <ChevronRight className="w-3 h-3" />
              </button>

              {/* Playback Speed selector */}
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="bg-[#0E1117] border border-white/15 text-neutral-300 px-2 py-1 text-[10px] uppercase cursor-pointer"
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={1.0}>1.0x</option>
                <option value={2.0}>2.0x</option>
              </select>
            </div>
          </div>

          {/* 3. VIDEO TIMELINE TRACK WITH TIME-SYNCHRONIZED EVENT MARKERS */}
          <div className="p-4 bg-[#12151D] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pb-1">
              <span>SYNCHRONIZED TIMELINE</span>
              <span>
                {pastAndCurrentEvents.length} OF {allEvents.length} EVENTS ELAPSED
              </span>
            </div>

            {/* Interactive Timeline Track */}
            <div className="relative h-12 flex items-center select-none">
              {/* Background Time Ruler Hairlines */}
              <div className="absolute inset-x-0 h-[2px] bg-white/20 top-1/2 -translate-y-1/2" />

              {/* Major Time Interval Ticks: 00:00, 00:05, 00:10, 00:15, 00:17.5 */}
              {[0, 5, 10, 15, duration].map((tick) => {
                const pos = (tick / duration) * 100;
                return (
                  <div
                    key={tick}
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                    style={{ left: `${pos}%` }}
                  >
                    <div className="h-3 w-[1px] bg-white/40 mb-1" />
                    <span className="text-[9px] font-mono text-neutral-400">
                      00:{Math.floor(tick).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}

              {/* Event Markers along the timeline */}
              {allEvents.map((evt) => {
                const pos = (evt.timestamp / duration) * 100;
                const isPastOrCurrent = evt.timestamp <= currentTime;
                const isSelected = selectedEvent?.id === evt.id;
                const isCritical = evt.severity === 'CRITICAL';
                const isViolation = evt.severity === 'VIOLATION';

                return (
                  <button
                    key={evt.id}
                    onClick={() => seekToEvent(evt)}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-1 group transition-transform ${
                      isSelected ? 'scale-125' : 'hover:scale-110'
                    }`}
                    style={{ left: `${pos}%` }}
                    title={`${evt.who}: ${evt.what} at 00:${Math.floor(evt.timestamp).toString().padStart(2, '0')}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-opacity ${
                        isPastOrCurrent ? 'opacity-100' : 'opacity-40'
                      } ${
                        isCritical
                          ? 'border-red-500 bg-red-600'
                          : isViolation
                          ? 'border-amber-500 bg-amber-600'
                          : 'border-emerald-500 bg-emerald-600'
                      }`}
                    >
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>

                    {/* Hover Tooltip */}
                    <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[9px] font-mono px-2 py-0.5 border border-white/20 z-30">
                      {evt.who} · {evt.what} (00:{Math.floor(evt.timestamp).toString().padStart(2, '0')})
                    </div>
                  </button>
                );
              })}

              {/* Scrubber Range Input */}
              <input
                type="range"
                min="0"
                max={duration}
                step="0.05"
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full absolute inset-0 opacity-0 cursor-pointer z-20"
              />

              {/* Active Playhead Thumb Indicator */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-10"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="w-2.5 h-2.5 bg-white -ml-[4px] rotate-45" />
              </div>
            </div>
          </div>

          {/* 4. COMPACT METRICS STRIP (Requirement #19) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#12151D] border border-white/10">
              <span className="text-[10px] text-neutral-400 block uppercase">PEOPLE TRACKED</span>
              <span className="text-xl font-bold text-white">{result.summary.people_tracked}</span>
            </div>
            <div className="p-3 bg-[#12151D] border border-white/10">
              <span className="text-[10px] text-neutral-400 block uppercase">EVENTS (TO TIME)</span>
              <span className="text-xl font-bold text-white">{pastAndCurrentEvents.length}</span>
            </div>
            <div className="p-3 bg-[#12151D] border border-white/10">
              <span className="text-[10px] text-red-400 block uppercase font-semibold">CRITICAL</span>
              <span className="text-xl font-bold text-red-500">
                {pastAndCurrentEvents.filter(e => e.severity === 'CRITICAL').length}
              </span>
            </div>
            <div className="p-3 bg-[#12151D] border border-white/10">
              <span className="text-[10px] text-neutral-400 block uppercase">AVG CONFIDENCE</span>
              <span className="text-xl font-bold text-emerald-400">
                {result.entities.length > 0
                  ? Math.round((result.entities.reduce((sum, e) => sum + (e.confidence || 0.88), 0) / result.entities.length) * 100)
                  : 92}%
              </span>
            </div>
            <div className="p-3 bg-[#12151D] border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-neutral-400 block uppercase">VIDEO PROCESSED</span>
              <span className="text-xl font-bold text-white">100%</span>
            </div>
          </div>

          {/* 5. HISTORICAL EVENT LOG TABLE (Temporal Causality: Events up to current time) */}
          <div className="p-4 bg-[#12151D] border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  EVENT HISTORY
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  (UP TO 00:{Math.floor(currentTime).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 10)})
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                CLICK ROW TO SEEK
              </span>
            </div>

            {pastAndCurrentEvents.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-neutral-500">
                No events recorded up to current playback timestamp (00:{Math.floor(currentTime).toString().padStart(2, '0')}).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-neutral-400 uppercase">
                      <th className="py-2 px-3">TIME</th>
                      <th className="py-2 px-3">ENTITY</th>
                      <th className="py-2 px-3">EVENT</th>
                      <th className="py-2 px-3">LOCATION</th>
                      <th className="py-2 px-3">SEVERITY</th>
                      <th className="py-2 px-3">CONFIDENCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAndCurrentEvents.map((evt) => {
                      const isSelected = selectedEvent?.id === evt.id;
                      const isCrit = evt.severity === 'CRITICAL';
                      const isViol = evt.severity === 'VIOLATION';

                      return (
                        <tr
                          key={evt.id}
                          onClick={() => seekToEvent(evt)}
                          className={`cursor-pointer transition-colors border-b border-white/5 ${
                            isSelected
                              ? 'bg-white/10 text-white font-semibold'
                              : 'hover:bg-white/5 text-neutral-300'
                          }`}
                        >
                          <td className="py-2 px-3 font-mono">
                            00:{Math.floor(evt.timestamp).toString().padStart(2, '0')}.{Math.floor((evt.timestamp % 1) * 100).toString().padStart(2, '0')}
                          </td>
                          <td className="py-2 px-3 font-bold text-white">{evt.who}</td>
                          <td className="py-2 px-3">{evt.what}</td>
                          <td className="py-2 px-3 text-neutral-400">{evt.location}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isCrit
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : isViol
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {evt.severity}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-neutral-400">{Math.round(evt.confidence * 100)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (approx 32% Width): Current State Panel & Event Detail Panel */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* 6. TABBED PANEL: CURRENT STATE vs TRACKED ENTITIES (Requirement #6 & #10) */}
          <div className="p-5 bg-[#12151D] border border-white/10 space-y-4">
            {/* Tab Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRightTab('current')}
                  className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                    rightTab === 'current'
                      ? 'bg-white text-black font-semibold'
                      : 'text-neutral-400 hover:text-white border border-white/10'
                  }`}
                >
                  CURRENT STATE ({currentTracks.length})
                </button>
                <button
                  onClick={() => setRightTab('entities')}
                  className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                    rightTab === 'entities'
                      ? 'bg-white text-black font-semibold'
                      : 'text-neutral-400 hover:text-white border border-white/10'
                  }`}
                >
                  TRACKED ENTITIES ({result.entities.length})
                </button>
              </div>

              <span className="text-[10px] font-mono text-neutral-400">
                00:{Math.floor(currentTime).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 10)}
              </span>
            </div>

            {/* TAB 1: CURRENT STATE (Frame-accurate active tracks) */}
            {rightTab === 'current' && (
              <>
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1">
                  <span>WHAT IS HAPPENING RIGHT NOW</span>
                  <span className="text-emerald-400 font-semibold">LIVE</span>
                </div>

                {currentTracks.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-neutral-500 bg-black/30 border border-white/5">
                    No active entities detected in this frame.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentTracks.map((trk) => {
                      const isSelected = selectedTrackId === trk.track_id;
                      const isFallen = trk.behavior === 'FALLEN';
                      const isZone = trk.behavior === 'ENTERED RESTRICTED ZONE';
                      const isStationary = trk.behavior === 'STATIONARY';

                      return (
                        <div
                          key={trk.track_id}
                          onClick={() => setSelectedTrackId(trk.track_id)}
                          className={`p-3.5 border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-white bg-white/10 shadow-md'
                              : isFallen
                              ? 'border-red-500/50 bg-red-950/20'
                              : isZone
                              ? 'border-amber-500/40 bg-amber-950/20'
                              : 'border-white/10 bg-[#0E1117] hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono mb-1">
                            <span className="font-bold text-white">{trk.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              isFallen
                                ? 'bg-red-500 text-white'
                                : isZone
                                ? 'bg-amber-500/30 text-amber-300'
                                : isStationary
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {trk.behavior}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mt-2">
                            <span>VELOCITY: {trk.velocity.toFixed(1)} m/s</span>
                            <span>CONF: {Math.round(trk.confidence * 100)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: PERSISTENT TRACKED ENTITIES */}
            {rightTab === 'entities' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-neutral-400 pb-1">
                  PERSISTENT BYTE TRACK IDENTITIES
                </div>

                {result.entities.map((ent) => {
                  const isSelected = selectedTrackId === ent.track_id;

                  // Dynamically evaluate current behavior from active frame tracks
                  const liveTrack = currentTracks.find(t => t.track_id === ent.track_id);
                  const isVisible = Boolean(liveTrack);
                  const dynamicBehavior = liveTrack ? liveTrack.behavior : (ent.current_behavior || "WALKING");
                  const dynamicStatus: string = liveTrack
                    ? (liveTrack.behavior === 'FALLEN' ? 'Critical' : (liveTrack.in_restricted_zone || liveTrack.behavior === 'ENTERED RESTRICTED ZONE') ? 'Violation' : liveTrack.behavior === 'STATIONARY' ? 'Stationary' : 'Normal')
                    : (ent.status || 'Active');
                  const dynamicZone = liveTrack
                    ? (liveTrack.in_restricted_zone ? 'Restricted Zone' : 'Standard Area')
                    : '—';

                  const isCritical = dynamicStatus === "Critical";
                  const isWarning = dynamicStatus === "Violation" || dynamicStatus === "Warning" || dynamicStatus === "Stationary";

                  return (
                    <div
                      key={ent.track_id}
                      onClick={() => setSelectedTrackId(ent.track_id)}
                      className={`p-3.5 border transition-all cursor-pointer text-xs font-mono ${
                        isSelected
                          ? 'border-white bg-white/10 shadow-md'
                          : isCritical
                          ? 'border-red-500/50 bg-red-950/20'
                          : isWarning
                          ? 'border-amber-500/40 bg-amber-950/20'
                          : 'border-white/10 bg-[#0E1117] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{ent.id}</span>
                          <span className="text-[10px] text-neutral-400 uppercase">{ent.role || 'Personnel'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isVisible && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCritical
                              ? 'bg-red-500 text-white'
                              : isWarning
                              ? 'bg-amber-500 text-black'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {isVisible ? dynamicStatus : 'OUT OF FRAME'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                        <div>
                          <span className="text-[9px] uppercase text-neutral-500 block">CURRENT BEHAVIOR</span>
                          <span className={`font-semibold ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-300' : 'text-emerald-400'}`}>
                            {dynamicBehavior}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-neutral-500 block">ZONE STATUS</span>
                          <span className="text-white truncate block">{dynamicZone}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-neutral-500 block">TIME TRACKED</span>
                          <span>{ent.tracked_duration_sec ? `${ent.tracked_duration_sec}s` : `${duration.toFixed(1)}s`}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-neutral-500 block">CONFIDENCE</span>
                          <span className="text-white">{Math.round((ent.confidence || 0.9) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7. EVENT DETAIL INSPECTION CARD */}
          {selectedEvent ? (
            <div className="p-5 bg-[#0E1117] border border-white/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                <span className="text-neutral-400 uppercase tracking-wider">EVENT DETAIL</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                  selectedEvent.severity === 'CRITICAL'
                    ? 'bg-red-500 text-white'
                    : selectedEvent.severity === 'VIOLATION'
                    ? 'bg-amber-500 text-black'
                    : 'bg-emerald-500 text-white'
                }`}>
                  {selectedEvent.severity}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500">EVENT TYPE</span>
                <h4 className="font-display text-xl text-white font-normal mt-0.5">
                  {selectedEvent.what}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-neutral-300 pt-1">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">ENTITY</span>
                  <span className="font-bold text-white">{selectedEvent.who}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">TIMESTAMP</span>
                  <button
                    onClick={() => seekToEvent(selectedEvent)}
                    className="font-bold text-white underline hover:text-emerald-400"
                    title="Click to seek"
                  >
                    00:{Math.floor(selectedEvent.timestamp).toString().padStart(2, '0')}.{Math.floor((selectedEvent.timestamp % 1) * 100).toString().padStart(2, '0')}
                  </button>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">LOCATION</span>
                  <span>{selectedEvent.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">DURATION</span>
                  <span>{selectedEvent.duration.toFixed(1)}s</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">CONFIDENCE</span>
                  <span className="text-emerald-400 font-bold">{Math.round(selectedEvent.confidence * 100)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">SOURCE</span>
                  <span className="text-neutral-400">Behavior Engine</span>
                </div>
              </div>

              {selectedEvent.details && (
                <div className="pt-3 border-t border-white/10 text-xs font-sans text-neutral-400 leading-relaxed">
                  {selectedEvent.details}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-[#12151D] border border-white/10 text-xs font-mono text-neutral-500 text-center">
              Select an event or timeline marker to inspect forensic details.
            </div>
          )}

          {/* 8. KEYBOARD SHORTCUTS REFERENCE */}
          <div className="p-4 bg-[#12151D] border border-white/10 text-[11px] font-mono text-neutral-400 space-y-1.5">
            <span className="text-white uppercase font-semibold block mb-2">KEYBOARD SHORTCUTS</span>
            <div className="flex justify-between"><span>SPACE</span><span className="text-neutral-300">Play / Pause</span></div>
            <div className="flex justify-between"><span>← / →</span><span className="text-neutral-300">Previous / Next Event</span></div>
            <div className="flex justify-between"><span>D</span><span className="text-neutral-300">Toggle Debug Mode</span></div>
            <div className="flex justify-between"><span>ESC</span><span className="text-neutral-300">Deselect Inspector</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
