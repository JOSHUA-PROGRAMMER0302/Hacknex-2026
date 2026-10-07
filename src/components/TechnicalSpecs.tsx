import React from 'react';
import { Network } from 'lucide-react';

export const TechnicalSpecs: React.FC = () => {
  const stackItems = [
    {
      name: 'YOLO',
      label: 'OBJECT DETECTION',
      desc: 'Sub-millisecond anchor-free spatial bounding box estimation and worker keypoint extraction running on TensorRT FP16 acceleration.',
      metric: '3.2ms per frame'
    },
    {
      name: 'BYTE TRACK',
      label: 'IDENTITY TRACKING',
      desc: 'Persistent ID association associating low-confidence detections across severe occlusions and camera viewpoint transitions.',
      metric: '99.4% ID retention'
    },
    {
      name: 'OPENCV',
      label: 'VIDEO ANALYSIS',
      desc: 'Hardware-accelerated video decoding, camera distortion calibration, optical flow calculation, and perspective transformation.',
      metric: 'Zero-copy pipeline'
    },
    {
      name: 'BEHAVIOR ENGINE',
      label: 'ACTION UNDERSTANDING',
      desc: 'Spatio-temporal graph neural networks that model velocity vectors, dwell time limits, and topological zone perimeters.',
      metric: 'Temporal window 2.4s'
    },
    {
      name: 'FASTAPI',
      label: 'REAL-TIME BACKEND',
      desc: 'Asynchronous event streaming bus dispatching WebSockets, webhook web dispatches, and sub-second industrial push alerts.',
      metric: '<15ms event latency'
    }
  ];

  return (
    <section className="py-28 sm:py-36 border-t border-ink-900/10 bg-paper">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Marker */}
        <div className="flex items-center justify-between mb-16">
          <span className="text-[11px] font-mono tracking-widest-2xl text-ink-500 uppercase">
            SECTION // 07 — ARCHITECTURAL STACK
          </span>
          <span className="text-xs font-mono text-ink-400">
            TIME-AWARE SPATIO-TEMPORAL FUSION
          </span>
        </div>

        {/* Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-20">
          <div className="lg:col-span-8">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink-900 font-normal leading-[1.05] tracking-tight">
              BUILT TO <br />
              <span className="italic font-light text-ink-500">UNDERSTAND TIME.</span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-sm font-sans text-ink-700 leading-relaxed border-l border-ink-900/20 pl-4">
              Standard vision models operate in isolated 2D space. SafeWatch AI fuses instant spatial detection with sequential temporal mechanics, transforming raw pixel feeds into causality and narrative.
            </p>
          </div>
        </div>

        {/* Technical Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border-t border-b border-ink-900/15">
          {stackItems.map((item, idx) => (
            <div
              key={item.name}
              className={`p-6 sm:p-8 flex flex-col justify-between group hover:bg-background transition-colors ${
                idx !== 0 ? 'border-t md:border-t-0 md:border-l border-ink-900/15' : ''
              }`}
            >
              <div>
                <span className="font-mono text-xs font-bold text-ink-400 group-hover:text-ink-900 transition-colors block mb-6">
                  0{idx + 1}
                </span>

                <h3 className="font-display text-2xl font-normal text-ink-900 tracking-tight mb-1">
                  {item.name}
                </h3>

                <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500 font-semibold mb-4">
                  {item.label}
                </div>

                <p className="text-xs text-ink-600 font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-ink-900/10 flex items-center justify-between text-[10px] font-mono">
                <span className="text-ink-400 uppercase">PERF:</span>
                <span className="font-semibold text-ink-800">{item.metric}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Narrative Banner */}
        <div className="mt-12 p-6 border border-ink-900/10 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-ink-600">
          <div className="flex items-center gap-3">
            <Network className="w-4 h-4 text-ink-900" />
            <span>UNIFIED TIME-SPACE ARCHITECTURE: SPATIAL PIXEL → TEMPORAL GRAPH → BEHAVIOR EVENT</span>
          </div>
          <span className="text-ink-400">EDGE RUNTIME & ON-PREM COMPLIANT</span>
        </div>
      </div>
    </section>
  );
};
