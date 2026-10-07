import React from 'react';

interface FooterProps {
  onNavigateToDemo: () => void;
  onNavigateToUpload: () => void;
  onNavigateToWorkspace?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToDemo, onNavigateToUpload, onNavigateToWorkspace }) => {
  return (
    <footer id="about" className="bg-paper border-t border-ink-900/15 py-20 px-6 sm:px-8 text-ink-900">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-ink-900/10">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5 text-ink-900"
                >
                  <ellipse cx="12" cy="12" rx="9" ry="5" />
                  <circle cx="12" cy="12" r="2.5" />
                  <circle cx="12" cy="12" r="0.9" fill="#D9381E" />
                </svg>
              </div>
              <span className="font-sans font-semibold tracking-widest text-base text-ink-900 uppercase">
                SAFEWATCH AI
              </span>
            </div>

            <p className="font-display text-xl sm:text-2xl text-ink-900 font-normal leading-snug max-w-md pt-2">
              Autonomous Vision &amp; Behaviour Understanding
            </p>

            <p className="font-sans text-xs text-ink-600 max-w-md leading-relaxed pt-1">
              Engineered for industrial safety, automated logistics facilities, and high-stakes operational environments where detecting presence is not enough.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-widest text-ink-400 mb-4">
              NAVIGATION
            </div>
            <ul className="space-y-2 text-xs font-mono uppercase tracking-wider text-ink-700">
              <li>
                <a href="#system" className="hover:text-ink-900 transition-colors">
                  System
                </a>
              </li>
              <li>
                <button onClick={onNavigateToDemo} className="hover:text-ink-900 transition-colors uppercase">
                  Live Demo
                </button>
              </li>
              <li>
                <button onClick={onNavigateToWorkspace || onNavigateToUpload} className="hover:text-ink-900 transition-colors uppercase">
                  Analyze Video
                </button>
              </li>
              <li>
                <a href="#events" className="hover:text-ink-900 transition-colors">
                  Events
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-ink-900 transition-colors">
                  Analytics
                </a>
              </li>
              <li>
                <a href="#system" className="hover:text-ink-900 transition-colors">
                  Technology
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-ink-900 transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Technical Specs Column */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-widest text-ink-400 mb-4">
              CAPABILITIES
            </div>
            <div className="space-y-2 text-xs font-mono text-ink-600">
              <div>Object Detection (YOLOv8x)</div>
              <div>Multi-Object Tracking (ByteTrack)</div>
              <div>Action Recognition (ST-GCN)</div>
              <div>Optical Tripwire &amp; Zones</div>
              <div>Fall &amp; Inactivity Forensics</div>
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Required Identifiers */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-ink-500 gap-4">
          <div className="font-bold text-ink-900 tracking-wider">
            HNX26PSI07
          </div>

          <div className="text-center sm:text-right tracking-wider">
            Computer Vision · Action Recognition · Object Tracking · Behaviour Analysis
          </div>
        </div>
      </div>
    </footer>
  );
};
