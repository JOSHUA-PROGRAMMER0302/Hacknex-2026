import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onNavigateToUpload: () => void;
  onNavigateToDemo: () => void;
  onNavigateToWorkspace?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToUpload, onNavigateToDemo, onNavigateToWorkspace }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-ink-900/10 py-4 shadow-sm'
          : 'bg-transparent py-7'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Typographic Logo with Abstract Eye Symbol */}
        <a
          href="#"
          className="flex items-center gap-3 group focus:outline-none"
          aria-label="SafeWatch AI Home"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            {/* Abstract Eye / Vision Aperture Symbol */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5 text-ink-900 transition-transform duration-500 group-hover:scale-110"
            >
              <ellipse cx="12" cy="12" rx="9" ry="5" />
              <circle cx="12" cy="12" r="2.5" />
              <circle cx="12" cy="12" r="0.9" fill="#D9381E" />
            </svg>
          </div>
          <span className="font-sans font-semibold tracking-widest text-sm text-ink-900 uppercase">
            SAFEWATCH <span className="font-light text-ink-500 text-xs tracking-widest-xl">AI</span>
          </span>
        </a>

        {/* Minimal Editorial Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest-xl uppercase text-ink-700">
          <a
            href="#system"
            className="hover:text-ink-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-ink-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            SYSTEM
          </a>
          <button
            onClick={onNavigateToDemo}
            className="hover:text-ink-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-ink-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform uppercase"
          >
            LIVE DEMO
          </button>
          <a
            href="#events"
            className="hover:text-ink-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-ink-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            EVENTS
          </a>
          <a
            href="#analytics"
            className="hover:text-ink-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-ink-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            ANALYTICS
          </a>
          <a
            href="#about"
            className="hover:text-ink-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-ink-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            ABOUT
          </a>
        </nav>

        {/* Right side: ● SYSTEM ONLINE */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-ink-900/10 bg-paper/60 backdrop-blur-sm text-[11px] font-mono tracking-wider text-ink-800">
            <span className="w-2 h-2 rounded-full bg-safety-safe animate-status" />
            <span className="font-medium text-[10px] tracking-widest uppercase">SYSTEM ONLINE</span>
          </div>
          
          <button
            onClick={onNavigateToWorkspace || onNavigateToUpload}
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-xs font-mono uppercase tracking-widest bg-ink-900 text-paper hover:bg-ink-800 transition-all border border-ink-900 hover:shadow-sm"
          >
            ANALYZE VIDEO
          </button>
        </div>
      </div>
    </header>
  );
};
