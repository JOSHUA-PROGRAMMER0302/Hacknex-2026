import React from 'react';
import { Warehouse, Factory, GraduationCap, ShoppingBag, Car, Users, ArrowUpRight } from 'lucide-react';

export const IndustryGrid: React.FC = () => {
  const industries = [
    {
      title: 'WAREHOUSES',
      subtitle: 'Worker safety and restricted zones',
      desc: 'Automatic enforcement of forklift separation zones, loading bay fall detection, and high-density picking lane speed monitoring.',
      icon: Warehouse,
      stat: '99.4%',
      statLabel: 'Breach Detection'
    },
    {
      title: 'FACTORIES',
      subtitle: 'Machine-area safety',
      desc: 'Microsecond optical e-stop triggering when personnel limbs cross hazardous mechanical press and robotic arm perimeters.',
      icon: Factory,
      stat: '<8ms',
      statLabel: 'Safety Cutoff'
    },
    {
      title: 'CAMPUSES',
      subtitle: 'Unusual activity',
      desc: 'Perimeter loitering detection, after-hours unauthorized building access, and fall detection along stairwells and secluded courtyards.',
      icon: GraduationCap,
      stat: '24/7',
      statLabel: 'Autonomous Watch'
    },
    {
      title: 'RETAIL',
      subtitle: 'Customer behavior',
      desc: 'Frictionless dwell-time heatmaps, shelf interaction metrics, queue bottleneck prediction, and loss-prevention movement signatures.',
      icon: ShoppingBag,
      stat: '98.1%',
      statLabel: 'Dwell Accuracy'
    },
    {
      title: 'TRAFFIC',
      subtitle: 'Vehicle movement',
      desc: 'Multi-lane trajectory estimation, wrong-way driving alerts, pedestrian crosswalk near-miss logging, and bottleneck origin tracing.',
      icon: Car,
      stat: '140km/h',
      statLabel: 'Velocity Ceiling'
    },
    {
      title: 'CROWDS',
      subtitle: 'Abnormal movement',
      desc: 'Stampede onset detection, counter-flow turbulence indicators, sudden density spikes, and egress choke-point monitoring.',
      icon: Users,
      stat: '500+',
      statLabel: 'Simultaneous Tracks'
    }
  ];

  return (
    <section id="analytics" className="py-28 sm:py-36 border-t border-ink-900/10 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest-2xl text-ink-500 uppercase block mb-2">
              SECTION // 08 — INDUSTRIAL APPLICATIONS
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink-900 font-normal tracking-tight">
              PROVEN ACROSS <br />
              <span className="italic font-light text-ink-500">PHYSICAL OPERATIONS.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans text-ink-600 max-w-sm">
            Deployable on edge cameras or centralized multi-stream servers without requiring proprietary sensory hardware.
          </p>
        </div>

        {/* 6 Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.title}
                className="p-8 bg-paper border border-ink-900/15 flex flex-col justify-between hover:border-ink-900 transition-all group hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-ink-900/10 mb-6">
                    <Icon className="w-5 h-5 text-ink-600 group-hover:text-ink-900 transition-colors" />
                    <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  <h3 className="font-display text-2xl font-normal text-ink-900 tracking-tight mb-1">
                    {ind.title}
                  </h3>

                  <div className="text-xs font-mono text-ink-500 uppercase tracking-wider mb-4">
                    {ind.subtitle}
                  </div>

                  <p className="text-xs text-ink-600 font-sans leading-relaxed">
                    {ind.desc}
                  </p>
                </div>

                <div className="pt-6 mt-8 border-t border-ink-900/10 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-ink-400 tracking-wider">
                    {ind.statLabel}
                  </span>
                  <span className="font-mono text-sm font-bold text-ink-900">
                    {ind.stat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
