import React from 'react';
import { Eye, Footprints, BrainCircuit, BellRing } from 'lucide-react';

export const PipelineSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'SEE',
      icon: Eye,
      tagline: 'Detect people and objects accurately.',
      details: 'Sub-millisecond bounding box proposals via YOLOv8x. Identifies workers, forklifts, and static hazards without relying on body tags or markers.',
      tech: 'YOLOv8x / TensorRT'
    },
    {
      num: '02',
      title: 'TRACK',
      icon: Footprints,
      tagline: 'Know that Worker #3 at 00:34 is the same Worker #3 seen earlier.',
      details: 'High-order Kalman filtering and spatial-temporal association algorithms resolve occlusions, camera angle shifts, and blind spots.',
      tech: 'ByteTrack v2 / Re-ID'
    },
    {
      num: '03',
      title: 'UNDERSTAND',
      icon: BrainCircuit,
      tagline: 'Measure movement, direction, duration, and behavior.',
      details: 'Extracts spatial-temporal velocity vectors, pose posture transitions, dwell durations, and trajectory anomalies over sliding windows.',
      tech: 'Spatio-Temporal GCN'
    },
    {
      num: '04',
      title: 'DECIDE',
      icon: BellRing,
      tagline: 'Turn meaningful behavior into actionable events.',
      details: 'Instantaneous safety rule evaluation generates structured telemetry: WHO, WHAT, WHEN, WHERE, and confidence scores for emergency intervention.',
      tech: 'Deterministic Rules + NLP'
    }
  ];

  return (
    <section className="py-28 sm:py-36 border-t border-ink-900/10 bg-paper">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Label */}
        <div className="flex items-center justify-between mb-16">
          <span className="text-[11px] font-mono tracking-widest-2xl text-ink-500 uppercase">
            SECTION // 03 — ARCHITECTURAL PIPELINE
          </span>
          <span className="text-xs font-mono text-ink-400">
            CONTINUOUS 4-STAGE INFERENCE
          </span>
        </div>

        {/* Large Editorial Headline */}
        <div className="mb-20 max-w-4xl">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink-900 font-normal leading-[1.05] tracking-tight">
            How vision becomes <br />
            <span className="italic font-light text-ink-500">autonomous understanding.</span>
          </h2>
        </div>

        {/* 4-Stage Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-b border-ink-900/15">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`p-8 lg:p-10 flex flex-col justify-between group transition-colors duration-300 hover:bg-background ${
                  idx !== 0 ? 'border-t md:border-t-0 md:border-l border-ink-900/15' : ''
                }`}
              >
                <div>
                  {/* Step Number + Tech Tag */}
                  <div className="flex items-center justify-between mb-8 pb-3 border-b border-ink-900/10">
                    <span className="font-mono text-xs font-semibold text-ink-400 group-hover:text-ink-900 transition-colors">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-ink-400 group-hover:text-ink-900 transition-colors" />
                  </div>

                  {/* Stage Headline */}
                  <h3 className="font-display text-3xl sm:text-4xl font-normal text-ink-900 tracking-tight mb-4">
                    {step.title}
                  </h3>

                  {/* Tagline */}
                  <p className="font-sans text-base font-semibold text-ink-800 leading-snug mb-4">
                    “{step.tagline}”
                  </p>

                  {/* Detailed Description */}
                  <p className="font-sans text-xs text-ink-600 leading-relaxed">
                    {step.details}
                  </p>
                </div>

                {/* Bottom Tech Indicator */}
                <div className="pt-8 mt-6 border-t border-ink-900/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-ink-400">
                  <span>ENGINE</span>
                  <span className="text-ink-700 font-medium">{step.tech}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Flow Arrow Line */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-mono text-ink-500 uppercase tracking-widest">
          <span>SPATIAL SENSING</span>
          <span>→</span>
          <span>IDENTITY PERSISTENCE</span>
          <span>→</span>
          <span>ACTION SEMANTICS</span>
          <span>→</span>
          <span>REAL-TIME DISPATCH</span>
        </div>
      </div>
    </section>
  );
};
