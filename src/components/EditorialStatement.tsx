import React, { useState, useEffect } from 'react';

export const EditorialStatement: React.FC = () => {
  const [animStep, setAnimStep] = useState(0);

  // Micro-animation demonstrating Detection vs. Tracking vs. Understanding
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="system" className="py-24 sm:py-32 border-t border-ink-900/10 bg-paper">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Index Marker */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[11px] font-mono tracking-widest-2xl text-ink-500 uppercase">
            SECTION // 01 — THE PARADIGM
          </span>
          <div className="h-[1px] flex-1 bg-ink-900/10" />
        </div>

        {/* Asymmetric Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Column: Large Editorial Typography */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.08] text-ink-900 tracking-tight">
              Detection is easy. <br />
              <span className="italic font-light text-ink-500">Understanding</span> is harder.
            </h2>
            
            <p className="text-xl sm:text-2xl font-light text-ink-800 leading-relaxed max-w-2xl pt-2">
              Traditional computer vision can tell you that a person is present. SafeWatch AI goes further — it tracks the same person, understands their movement, identifies meaningful behavior, and detects when something unusual happens.
            </p>
          </div>

          {/* Right Column: Short explanation + Interactive Animated Tracking Visualization */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            {/* Visual Micro-Canvas Demonstrating Detection vs Understanding */}
            <div className="relative border border-ink-900/15 bg-background p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-ink-900/10 text-[10px] font-mono text-ink-500 uppercase tracking-widest">
                <span>TEMPORAL INFERENCE ENGINE</span>
                <span className="text-safety-alert">PHASE 0{animStep + 1} / 03</span>
              </div>

              {/* Interactive Visual Graph Stage */}
              <div className="py-8 relative h-48 flex items-center justify-center">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-grid-tech opacity-40 pointer-events-none" />

                {/* Simulated Worker Visual Path */}
                <svg className="w-full h-full overflow-visible">
                  {/* Trajectory Path */}
                  <path
                    d="M 40,120 Q 120,40 220,100 T 320,60"
                    fill="none"
                    stroke={animStep >= 1 ? '#0E0F12' : '#D5D1C8'}
                    strokeWidth="2"
                    strokeDasharray={animStep >= 1 ? '4 4' : 'none'}
                    className="transition-colors duration-500"
                  />

                  {/* Historical Bounding Boxes */}
                  {animStep >= 1 && (
                    <>
                      <rect x="30" y="105" width="20" height="30" fill="none" stroke="#6E7079" strokeWidth="1" opacity="0.4" />
                      <text x="30" y="100" fontSize="8" fontFamily="monospace" fill="#6E7079">t=0s</text>
                      <rect x="115" y="45" width="20" height="30" fill="none" stroke="#6E7079" strokeWidth="1" opacity="0.6" />
                      <text x="115" y="40" fontSize="8" fontFamily="monospace" fill="#6E7079">t=12s</text>
                    </>
                  )}

                  {/* Active Entity Node */}
                  <g className="transition-transform duration-700">
                    <rect
                      x={animStep === 0 ? "40" : animStep === 1 ? "180" : "300"}
                      y={animStep === 0 ? "105" : animStep === 1 ? "75" : "45"}
                      width="38"
                      height="52"
                      fill={animStep === 2 ? 'rgba(217, 56, 30, 0.08)' : 'rgba(14, 15, 18, 0.04)'}
                      stroke={animStep === 2 ? '#D9381E' : '#0E0F12'}
                      strokeWidth={animStep === 2 ? "2" : "1.5"}
                    />
                    
                    {/* Corner Reticles */}
                    <circle
                      cx={animStep === 0 ? "40" : animStep === 1 ? "180" : "300"}
                      cy={animStep === 0 ? "105" : animStep === 1 ? "75" : "45"}
                      r="3"
                      fill={animStep === 2 ? '#D9381E' : '#0E0F12'}
                    />

                    {/* Tag badge */}
                    <rect
                      x={animStep === 0 ? "40" : animStep === 1 ? "180" : "300"}
                      y={animStep === 0 ? "88" : animStep === 1 ? "58" : "28"}
                      width={animStep === 2 ? "74" : "60"}
                      height="15"
                      fill="#0E0F12"
                    />
                    <text
                      x={animStep === 0 ? "44" : animStep === 1 ? "184" : "304"}
                      y={animStep === 0 ? "99" : animStep === 1 ? "69" : "39"}
                      fontSize="8"
                      fontFamily="monospace"
                      fill="#FFFFFF"
                      fontWeight="600"
                    >
                      {animStep === 0 && "DETECTION"}
                      {animStep === 1 && "TRACK #03"}
                      {animStep === 2 && "VIOLATION"}
                    </text>
                  </g>
                </svg>
              </div>

              {/* Explanatory Caption corresponding to phase */}
              <div className="pt-4 border-t border-ink-900/10 flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-900">
                    {animStep === 0 && "Stage 1: Spatial Detection"}
                    {animStep === 1 && "Stage 2: Persistent Re-Identification"}
                    {animStep === 2 && "Stage 3: Behavior Semantics"}
                  </h4>
                  <p className="text-[11px] text-ink-600 font-sans mt-0.5">
                    {animStep === 0 && "Identifies object boundaries in a single frame. Blind to context."}
                    {animStep === 1 && "Maintains entity ID across occlusions, cameras, and timestamps."}
                    {animStep === 2 && "Evaluates duration, speed vector, and zone proximity over time."}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-ink-400">
                  {animStep + 1}/3
                </span>
              </div>
            </div>

            {/* Editorial Comparison Notes */}
            <div className="grid grid-cols-2 gap-6 text-xs text-ink-700">
              <div className="border-l border-ink-900/20 pl-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400 block mb-1">
                  CONVENTIONAL CV
                </span>
                <p className="leading-snug">
                  Frame-by-frame snapshot analysis. Cannot distinguish a temporary pause from an incapacitating fall.
                </p>
              </div>
              <div className="border-l border-ink-900 pl-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-900 font-semibold block mb-1">
                  SAFEWATCH ENGINE
                </span>
                <p className="leading-snug text-ink-900 font-medium">
                  Temporal action recognition models that understand duration, context, and hazard thresholds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
