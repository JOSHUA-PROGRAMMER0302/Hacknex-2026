import React, { useState } from 'react';
import type { AnomalyEvent } from '../types';

interface EventTimelineProps {
  onEventSelected?: (event: AnomalyEvent) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ onEventSelected }) => {
  const [activeEventIndex, setActiveEventIndex] = useState<number>(3); // Default to critical event for high impact

  const timelineItems = [
    {
      time: '00:00',
      title: 'Normal baseline activity',
      who: 'All Shift Personnel',
      what: 'Nominal transit along defined pedestrian walkways',
      where: 'Warehouse Zone A, B & C',
      confidence: 99.8,
      severity: 'NORMAL' as const,
      behavior: 'WALKING' as const,
      details: 'All moving entities conform to standard velocity bands and approved aisle routes.'
    },
    {
      time: '00:18',
      title: 'Worker #1 — Stationary behavior',
      who: 'Worker #1',
      what: 'Stationary behavior',
      where: 'Warehouse Zone A — Picking Lane',
      confidence: 98.4,
      severity: 'UNUSUAL' as const,
      behavior: 'STATIONARY' as const,
      details: 'Prolonged immobility exceeding 18 seconds without active inventory barcode scan interaction.'
    },
    {
      time: '00:27',
      title: 'Worker #2 — Restricted zone entry',
      who: 'Worker #2',
      what: 'Restricted zone entry',
      where: 'Warehouse Zone C — High-Voltage Battery Station',
      confidence: 94.7,
      severity: 'VIOLATION' as const,
      behavior: 'RESTRICTED_ZONE' as const,
      details: 'Unauthorized physical encroachment across virtual boundary into autonomous guided vehicle lane.'
    },
    {
      time: '00:34',
      title: 'Worker #3 — Fall detected',
      who: 'Worker #3',
      what: 'Fall detected',
      where: 'Warehouse Zone B — Staging Bay 3',
      confidence: 96.2,
      severity: 'CRITICAL' as const,
      behavior: 'FALL' as const,
      details: 'Rapid vertical descent with horizontal collapse and subsequent lack of recovery movement.'
    }
  ];

  const activeItem = timelineItems[activeEventIndex];

  const handleSelect = (idx: number) => {
    setActiveEventIndex(idx);
    const item = timelineItems[idx];
    if (onEventSelected) {
      onEventSelected({
        id: `tl-${idx}`,
        track_id: idx,
        timestamp: parseInt(item.time.split(':')[1]) || 0,
        who: item.who,
        what: item.what,
        location: item.where,
        duration: 0.0,
        event_type: item.behavior === 'STATIONARY' ? 'stationary' : item.behavior === 'FALL' ? 'fall' : 'restricted_zone_entry',
        confidence: item.confidence / 100,
        severity: item.severity,
        details: item.details
      });
    }
  };

  return (
    <section id="events" className="py-28 sm:py-36 border-t border-ink-900/10 bg-paper">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest-2xl text-ink-500 uppercase block mb-2">
              SECTION // 05 — TEMPORAL EVENT SEQUENCE
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink-900 font-normal tracking-tight">
              HORIZONTAL <br />
              <span className="italic font-light text-ink-500">EVENT TIMELINE.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans text-ink-600 max-w-sm">
            Click any chronological milestone to inspect spatial coordinates, severity classifications, and confidence metrics.
          </p>
        </div>

        {/* Horizontal Timeline Track */}
        <div className="relative mb-14">
          {/* Base Horizontal Hairline */}
          <div className="absolute top-7 left-0 right-0 h-[1px] bg-ink-900/15" />

          {/* Timeline Nodes Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {timelineItems.map((item, idx) => {
              const isSelected = activeEventIndex === idx;
              const isCritical = item.severity === 'CRITICAL';
              const isViolation = item.severity === 'VIOLATION';
              const isUnusual = item.severity === 'UNUSUAL';

              return (
                <button
                  key={item.time}
                  onClick={() => handleSelect(idx)}
                  className={`text-left p-5 bg-background border transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-ink-900 shadow-md bg-paper'
                      : 'border-ink-900/10 hover:border-ink-900/40'
                  }`}
                >
                  {/* Pin Node on the line */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? isCritical
                            ? 'border-safety-alert bg-safety-alert'
                            : 'border-ink-900 bg-ink-900'
                          : 'border-ink-400 bg-paper group-hover:border-ink-900'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-paper" />
                    </div>
                    <span className="font-mono text-sm font-bold tracking-widest text-ink-900">
                      {item.time}
                    </span>
                  </div>

                  {/* Title / Actor */}
                  <h4 className="font-display text-lg text-ink-900 mb-1 font-medium leading-snug">
                    {item.who}
                  </h4>
                  <div className="text-xs font-mono text-ink-600 truncate mb-3">
                    {item.what}
                  </div>

                  {/* Severity Badge */}
                  <div className="pt-3 border-t border-ink-900/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-ink-400 uppercase">SEVERITY:</span>
                    <span
                      className={`font-semibold uppercase ${
                        isCritical
                          ? 'text-safety-alert'
                          : isViolation
                          ? 'text-safety-alert'
                          : isUnusual
                          ? 'text-amber-800'
                          : 'text-safety-safe'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Event Telemetry Card (Mandatory: WHO, WHAT, WHEN, WHERE, CONFIDENCE, SEVERITY) */}
        <div className="border border-ink-900 bg-[#0E0F12] text-paper p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="font-display text-9xl">{activeItem.time}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-paper/15 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest-xl uppercase text-paper/60 mb-1">
                <span>INSPECTION CONSOLE</span>
                <span>//</span>
                <span>EVENT #{activeEventIndex + 1}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl text-paper font-normal">
                {activeItem.title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 font-mono text-xs uppercase tracking-widest font-semibold border ${
                activeItem.severity === 'CRITICAL'
                  ? 'border-safety-alert text-safety-alert bg-safety-alert/10'
                  : activeItem.severity === 'VIOLATION'
                  ? 'border-safety-alert text-safety-alert bg-safety-alert/10'
                  : activeItem.severity === 'UNUSUAL'
                  ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                  : 'border-safety-safe text-green-400 bg-safety-safe/10'
              }`}>
                {activeItem.severity}
              </span>
            </div>
          </div>

          {/* Strict 6-Field Schema: WHO / WHAT / WHEN / WHERE / CONFIDENCE / SEVERITY */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 text-xs font-mono">
            <div className="border-l border-paper/20 pl-4">
              <span className="text-[10px] uppercase text-paper/50 block mb-1">WHO</span>
              <span className="font-semibold text-paper text-sm">{activeItem.who}</span>
            </div>
            <div className="border-l border-paper/20 pl-4">
              <span className="text-[10px] uppercase text-paper/50 block mb-1">WHAT</span>
              <span className="font-semibold text-safety-alert text-sm">{activeItem.what}</span>
            </div>
            <div className="border-l border-paper/20 pl-4">
              <span className="text-[10px] uppercase text-paper/50 block mb-1">WHEN</span>
              <span className="font-semibold text-paper text-sm">{activeItem.time} (T+{parseInt(activeItem.time.split(':')[1])}s)</span>
            </div>
            <div className="border-l border-paper/20 pl-4">
              <span className="text-[10px] uppercase text-paper/50 block mb-1">WHERE</span>
              <span className="font-semibold text-paper text-sm">{activeItem.where}</span>
            </div>
            <div className="border-l border-paper/20 pl-4">
              <span className="text-[10px] uppercase text-paper/50 block mb-1">CONFIDENCE</span>
              <span className="font-semibold text-green-400 text-sm">{activeItem.confidence}%</span>
            </div>
            <div className="border-l border-paper/20 pl-4">
              <span className="text-[10px] uppercase text-paper/50 block mb-1">SEVERITY</span>
              <span className="font-semibold text-safety-alert text-sm uppercase">{activeItem.severity}</span>
            </div>
          </div>

          {/* Explanation narrative */}
          <div className="pt-6 border-t border-paper/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans text-paper/80">
            <p className="max-w-3xl leading-relaxed">
              <span className="font-mono text-paper font-semibold uppercase mr-2">ANALYSIS REASONING:</span>
              {activeItem.details}
            </p>
            <div className="font-mono text-[11px] text-paper/50 whitespace-nowrap">
              LOG RECORD // HNX-2026-092-B
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
