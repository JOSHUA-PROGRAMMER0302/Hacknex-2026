import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
import { safeWatchApi } from '../services/api';
import { DEMO_REFERENCE_ANALYSIS } from '../services/demoData';
import type { VideoAnalysisResult, PipelineConfig } from '../types';

interface UploadZoneProps {
  onAnalysisComplete: (result: VideoAnalysisResult) => void;
  config: PipelineConfig;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onAnalysisComplete, config }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [currentStageName, setCurrentStageName] = useState<string>("Initializing pipeline...");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stages = [
    { label: 'Object detection', desc: 'Locating human subjects and machinery via YOLO' },
    { label: 'Multi-object tracking', desc: 'ByteTrack persistent ID association across frames' },
    { label: 'Movement analysis', desc: 'Calculating velocity vectors and trajectory distance' },
    { label: 'Behavior recognition', desc: 'Evaluating stationary dwell and polygon boundaries' },
    { label: 'Event detection', desc: 'Generating structured timestamped anomaly logs' }
  ];

  const handleFile = async (file: File) => {
    setUploadedFileName(file.name);
    setIsProcessing(true);
    setProgressPct(0);
    setActiveStage(0);
    setCurrentStageName("Uploading and extracting video frames...");

    try {
      const result = await safeWatchApi.analyzeVideo(file, config, (pct, stageName) => {
        setProgressPct(pct);
        setCurrentStageName(stageName);
        const stageIdx = Math.min(4, Math.floor((pct / 100) * 5));
        setActiveStage(stageIdx);
      });
      setIsProcessing(false);
      onAnalysisComplete(result);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSelectDemoVideo = async () => {
    setUploadedFileName("DEMO_WHSE_BAY04_REFERENCE.mp4");
    setIsProcessing(true);
    setProgressPct(10);
    setActiveStage(0);

    // Simulate genuine progress for demo mode loading
    const steps = [
      { pct: 25, name: "Loading precomputed inference from warehouse CCTV...", stage: 1 },
      { pct: 55, name: "Synchronizing ByteTrack IDs and trajectory paths...", stage: 2 },
      { pct: 85, name: "Validating spatial restricted zone perimeters...", stage: 3 },
      { pct: 100, name: "Analysis complete ✓", stage: 4 }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 300));
      setProgressPct(step.pct);
      setCurrentStageName(step.name);
      setActiveStage(step.stage);
    }

    setIsProcessing(false);
    onAnalysisComplete(DEMO_REFERENCE_ANALYSIS);
  };

  return (
    <section id="upload" className="py-28 sm:py-36 border-t border-ink-900/10 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest-2xl text-ink-500 uppercase block mb-2">
              SECTION // 06 — THE RECOGNITION WORKBENCH
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink-900 font-normal tracking-tight">
              GIVE IT A VIDEO. <br />
              <span className="italic font-light text-ink-500">WE’LL FIND THE STORY.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans text-ink-600 max-w-sm">
            Drag and drop CCTV surveillance feeds or production floor mp4 recordings for genuine spatial-temporal parsing.
          </p>
        </div>

        {/* Upload Container */}
        <div className="max-w-4xl mx-auto">
          {!isProcessing ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-12 sm:p-20 border-2 border-dashed transition-all cursor-pointer text-center relative bg-paper shadow-sm group ${
                isDragging
                  ? 'border-ink-900 bg-surface-subtle scale-[1.01]'
                  : 'border-ink-900/25 hover:border-ink-900 hover:shadow-md'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-ink-900/15 flex items-center justify-center text-ink-700 group-hover:scale-110 group-hover:text-ink-900 group-hover:border-ink-900 transition-all bg-background">
                <UploadCloud className="w-7 h-7 stroke-[1.5]" />
              </div>

              <h3 className="font-display text-2xl sm:text-3xl text-ink-900 font-normal mb-3">
                Drop your warehouse or workplace video here.
              </h3>
              
              <p className="text-xs sm:text-sm font-mono text-ink-500 max-w-md mx-auto mb-8">
                SUPPORTS MP4, WEBM, MOV · REAL COMPUTER VISION PIPELINE
              </p>

              <div className="inline-flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-8 py-3.5 bg-ink-900 text-paper font-mono text-xs uppercase tracking-widest hover:bg-ink-800 transition-all shadow-sm"
                >
                  UPLOAD VIDEO
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDemoVideo();
                  }}
                  className="px-6 py-3.5 bg-background border border-ink-900/30 text-ink-900 font-mono text-xs uppercase tracking-widest hover:border-ink-900 transition-all"
                >
                  LOAD PRECOMPUTED DEMO
                </button>
              </div>

              {/* Minimal Footnote */}
              <div className="mt-8 text-[11px] font-mono text-ink-400">
                🔒 Every detection, track ID, and event is dynamically generated from actual frames.
              </div>
            </div>
          ) : (
            /* Processing State Card */
            <div className="p-10 sm:p-14 border border-ink-900 bg-paper shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-ink-900/15 mb-8">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-ink-500 block mb-1">
                    INFERENCE PIPELINE ACTIVE
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-ink-900 font-normal">
                    PROCESSING VIDEO...
                  </h3>
                  <p className="text-xs font-mono text-ink-600 mt-1">
                    {currentStageName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-bold text-ink-900">{progressPct}%</span>
                  <span className="text-[10px] font-mono text-ink-400 block">COMPUTING</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-ink-900/10 h-1 mb-8 overflow-hidden">
                <div
                  className="bg-ink-900 h-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* 5 Sequential Stages */}
              <div className="space-y-4">
                {stages.map((st, i) => {
                  const isDone = i < activeStage;
                  const isCurrent = i === activeStage;

                  return (
                    <div
                      key={st.label}
                      className={`flex items-center justify-between p-3 border transition-all ${
                        isCurrent
                          ? 'border-ink-900 bg-surface-subtle shadow-sm'
                          : isDone
                          ? 'border-ink-900/15 bg-background'
                          : 'border-transparent text-ink-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-safety-safe" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-ink-900 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-ink-200" />
                        )}
                        <div>
                          <span
                            className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                              isCurrent ? 'text-ink-900' : isDone ? 'text-ink-800' : 'text-ink-300'
                            }`}
                          >
                            {isDone ? '✓ ' : ''}{st.label}
                          </span>
                          <span className="block text-[11px] font-sans text-ink-500">
                            {st.desc}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono uppercase text-ink-400">
                        {isDone ? 'COMPLETED' : isCurrent ? 'RUNNING' : 'QUEUED'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-4 border-t border-ink-900/10 flex items-center justify-between text-[11px] font-mono text-ink-500">
                <span>PARSING: {uploadedFileName || 'STREAM.mp4'}</span>
                <span>YOLO DETECTOR + BYTETRACK TEMPORAL ENGINE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
