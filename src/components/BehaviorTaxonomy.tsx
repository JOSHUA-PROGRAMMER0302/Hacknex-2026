import React from 'react';
import { Footprints, Clock, ShieldAlert, AlertOctagon } from 'lucide-react';

export const BehaviorTaxonomy: React.FC = () => {
  const cards = [
    {
      id: 'WALKING',
      name: 'WALKING',
      type: 'Normal movement',
      explanation: 'Continuous displacement across designated transit aisles. Velocity vectors remain within nominal pedestrian ranges (0.8–1.4 m/s).',
      actor: 'Worker #1',
      detectedAt: '00:04',
      confidence: 99.1,
      status: 'NORMAL',
      statusColor: 'text-safety-safe border-safety-safe/30 bg-safety-safe-subtle',
      badgeColor: 'bg-safety-safe',
      icon: Footprints,
      renderGraphic: () => (
        <svg className="w-full h-24" viewBox="0 0 160 80">
          <line x1="20" y1="65" x2="140" y2="65" stroke="#D5D1C8" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 25,60 Q 60,35 90,55 T 135,45" fill="none" stroke="#1E5E3A" strokeWidth="2" />
          <circle cx="135" cy="45" r="4" fill="#1E5E3A" />
          <rect x="125" y="25" width="20" height="30" fill="none" stroke="#1E5E3A" strokeWidth="1" />
          <text x="25" y="22" fill="#6E7079" fontSize="8" fontFamily="monospace">STEADY VELOCITY 1.1 m/s</text>
        </svg>
      )
    },
    {
      id: 'STATIONARY',
      name: 'STATIONARY',
      type: 'Unusual inactivity',
      explanation: 'Sustained cessation of movement exceeding configurable dwell thresholds (>15s) in active high-traffic or hazardous transit lanes.',
      actor: 'Worker #1',
      detectedAt: '00:18',
      confidence: 98.4,
      status: 'UNUSUAL',
      statusColor: 'text-amber-800 border-amber-300 bg-amber-50',
      badgeColor: 'bg-amber-600',
      icon: Clock,
      renderGraphic: () => (
        <svg className="w-full h-24" viewBox="0 0 160 80">
          <circle cx="80" cy="45" r="24" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" className="animate-spin" style={{ animationDuration: '8s' }} />
          <circle cx="80" cy="45" r="14" fill="rgba(217, 119, 6, 0.1)" stroke="#D97706" strokeWidth="1.5" />
          <rect x="73" y="32" width="14" height="26" fill="none" stroke="#D97706" strokeWidth="1" />
          <text x="32" y="22" fill="#D97706" fontSize="8" fontFamily="monospace">IMMOBILITY DURATION 18s</text>
        </svg>
      )
    },
    {
      id: 'RESTRICTED_ZONE',
      name: 'RESTRICTED ZONE',
      type: 'Safety violation',
      explanation: 'Optical perimeter breach into automated forklift corridors, high-voltage battery stations, or active robotic loading cells.',
      actor: 'Worker #2',
      detectedAt: '00:27',
      confidence: 94.7,
      status: 'VIOLATION',
      statusColor: 'text-safety-alert border-safety-alert/30 bg-safety-alert-subtle',
      badgeColor: 'bg-safety-alert',
      icon: ShieldAlert,
      renderGraphic: () => (
        <svg className="w-full h-24" viewBox="0 0 160 80">
          {/* Danger zone stripes */}
          <rect x="60" y="15" width="90" height="55" fill="rgba(217, 56, 30, 0.08)" stroke="#D9381E" strokeWidth="1.2" strokeDasharray="4 2" />
          <line x1="20" y1="50" x2="85" y2="40" stroke="#D9381E" strokeWidth="2" />
          <circle cx="85" cy="40" r="4" fill="#D9381E" />
          <rect x="77" y="24" width="16" height="28" fill="none" stroke="#D9381E" strokeWidth="1.5" />
          <text x="65" y="30" fill="#D9381E" fontSize="7" fontFamily="monospace">PERIMETER BREACH</text>
        </svg>
      )
    },
    {
      id: 'FALL',
      name: 'FALL',
      type: 'Critical event',
      explanation: 'Sudden vertical bounding box collapse with rapid negative velocity vector, followed by prone horizontal aspect ratio and zero recovery motion.',
      actor: 'Worker #3',
      detectedAt: '00:34',
      confidence: 96.2,
      status: 'CRITICAL',
      statusColor: 'text-safety-alert border-safety-alert bg-safety-alert-subtle',
      badgeColor: 'bg-safety-alert',
      icon: AlertOctagon,
      renderGraphic: () => (
        <svg className="w-full h-24" viewBox="0 0 160 80">
          {/* Collapse trajectory */}
          <path d="M 45,25 L 75,55 L 115,58" fill="none" stroke="#D9381E" strokeWidth="2" strokeDasharray="3 2" />
          {/* Fallen prone box */}
          <rect x="70" y="50" width="38" height="15" fill="rgba(217, 56, 30, 0.15)" stroke="#D9381E" strokeWidth="2" />
          <circle cx="115" cy="58" r="4" fill="#D9381E" />
          <text x="35" y="20" fill="#D9381E" fontSize="8" fontFamily="monospace" fontWeight="bold">VERTICAL VELOCITY COLLAPSE</text>
        </svg>
      )
    }
  ];

  return (
    <section className="py-28 sm:py-36 border-t border-ink-900/10 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest-2xl text-ink-500 uppercase block mb-2">
              SECTION // 04 — ACTION UNDERSTANDING
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink-900 font-normal tracking-tight">
              FROM OBJECTS <br />
              <span className="italic font-light text-ink-500">TO ACTIONS.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans text-ink-600 max-w-sm">
            Categorizing human intent through continuous spatial-temporal dynamics rather than static frame classification.
          </p>
        </div>

        {/* 4 Large Behavior Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="p-6 bg-paper border border-ink-900/15 flex flex-col justify-between hover:border-ink-900 transition-all shadow-sm hover:shadow-md group"
              >
                <div>
                  {/* Card Status Indicator & Icon */}
                  <div className="flex items-center justify-between pb-4 border-b border-ink-900/10">
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 border font-semibold ${card.statusColor}`}>
                      {card.status}
                    </span>
                    <Icon className="w-4 h-4 text-ink-500 group-hover:text-ink-900 transition-colors" />
                  </div>

                  {/* Micro Visual Graphic Preview */}
                  <div className="my-4 bg-background border border-ink-900/10 p-2 flex items-center justify-center">
                    {card.renderGraphic()}
                  </div>

                  {/* Behavior Name & Type */}
                  <h3 className="font-display text-2xl font-normal text-ink-900 tracking-tight">
                    {card.name}
                  </h3>
                  <div className="text-xs font-mono text-ink-500 uppercase tracking-wider mb-3">
                    {card.type}
                  </div>

                  {/* Short Explanation */}
                  <p className="text-xs text-ink-700 leading-relaxed font-sans mb-6">
                    {card.explanation}
                  </p>
                </div>

                {/* Telemetry Footer */}
                <div className="pt-4 border-t border-ink-900/10 space-y-1.5 text-[11px] font-mono text-ink-700">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-400">ACTOR:</span>
                    <span className="font-semibold text-ink-900">{card.actor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-400">TIMESTAMP:</span>
                    <span>{card.detectedAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-400">CONFIDENCE:</span>
                    <span className="font-semibold">{card.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-ink-400">SEVERITY:</span>
                    <span className={`font-semibold uppercase ${card.status === 'CRITICAL' ? 'text-safety-alert' : card.status === 'VIOLATION' ? 'text-safety-alert' : 'text-ink-900'}`}>
                      {card.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
