import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EditorialStatement } from './components/EditorialStatement';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { PipelineSection } from './components/PipelineSection';
import { BehaviorTaxonomy } from './components/BehaviorTaxonomy';
import { EventTimeline } from './components/EventTimeline';
import { UploadZone } from './components/UploadZone';
import { AnalysisWorkspace } from './components/AnalysisWorkspace';
import { TechnicalSpecs } from './components/TechnicalSpecs';
import { IndustryGrid } from './components/IndustryGrid';
import { DarkCta } from './components/DarkCta';
import { Footer } from './components/Footer';
import { DEMO_REFERENCE_ANALYSIS } from './services/demoData';
import { safeWatchApi } from './services/api';
import type { VideoAnalysisResult, PipelineConfig } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'marketing' | 'workspace'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/analysis' || hash === '#analysis') {
        return 'workspace';
      }
    }
    return 'marketing';
  });

  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [config, setConfig] = useState<PipelineConfig>({
    personConfidenceThreshold: 0.40,
    stationaryTimeThreshold: 10.0,
    stationaryDistThreshold: 25.0,
    restrictedPolygon: [
      [480, 260],
      [860, 260],
      [860, 480],
      [480, 480]
    ],
    debugMode: false
  });

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/analysis' || hash === '#analysis') {
        setCurrentView('workspace');
      } else {
        setCurrentView('marketing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToWorkspace = (result?: VideoAnalysisResult) => {
    if (result) {
      setAnalysisResult(result);
    }
    try {
      window.history.pushState(null, '', '/analysis');
    } catch {
      window.location.hash = 'analysis';
    }
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToMarketing = () => {
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
    setCurrentView('marketing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAnalysisComplete = (result: VideoAnalysisResult) => {
    setAnalysisResult(result);
    navigateToWorkspace(result);
  };

  // If in Workspace View (/analysis)
  if (currentView === 'workspace') {
    return (
      <AnalysisWorkspace
        result={analysisResult || DEMO_REFERENCE_ANALYSIS}
        onReturnToMarketing={navigateToMarketing}
        onUploadNewVideo={() => {
          // Allow uploading directly from workspace
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'video/mp4,video/webm,video/quicktime';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              try {
                const res = await safeWatchApi.analyzeVideo(file, config);
                setAnalysisResult(res);
              } catch (err) {
                console.error("Failed to analyze video:", err);
              }
            }
          };
          input.click();
        }}
        config={config}
        onConfigChange={setConfig}
      />
    );
  }

  // Otherwise, render Marketing Editorial Experience
  return (
    <div className="min-h-screen bg-background text-ink-900 selection:bg-ink-900 selection:text-paper font-sans">
      {/* Navigation */}
      <Navbar
        onNavigateToUpload={() => scrollToSection('upload')}
        onNavigateToDemo={() => scrollToSection('demo')}
        onNavigateToWorkspace={() => navigateToWorkspace()}
      />

      <main>
        {/* Full-viewport Editorial Hero */}
        <Hero
          onAnalyzeClick={() => navigateToWorkspace()}
          onLiveDemoClick={() => scrollToSection('demo')}
        />

        {/* Editorial Statement: Detection is easy. Understanding is harder. */}
        <EditorialStatement />

        {/* Large Immersive Live Video Analysis Section */}
        <VideoAnalyzer
          onOpenUploadModal={() => scrollToSection('upload')}
          onOpenWorkspace={() => navigateToWorkspace()}
        />

        {/* Horizontal Pipeline Section: SEE -> TRACK -> UNDERSTAND -> DECIDE */}
        <PipelineSection />

        {/* Action Taxonomy: FROM OBJECTS TO ACTIONS */}
        <BehaviorTaxonomy />

        {/* Event Timeline: 00:00 -> 00:18 -> 00:27 -> 00:34 */}
        <EventTimeline />

        {/* Functional Video Uploader & AI Processing Workbench */}
        <div id="upload">
          <UploadZone
            onAnalysisComplete={handleAnalysisComplete}
            config={config}
          />
        </div>

        {/* Technical Architecture: BUILT TO UNDERSTAND TIME */}
        <TechnicalSpecs />

        {/* Industry Applications: Warehouses, Factories, Campuses, Retail, Traffic, Crowds */}
        <IndustryGrid />

        {/* Full-Screen Dark Editorial CTA */}
        <DarkCta onAnalyzeClick={() => navigateToWorkspace()} />
      </main>

      {/* Footer */}
      <Footer
        onNavigateToDemo={() => scrollToSection('demo')}
        onNavigateToUpload={() => scrollToSection('upload')}
        onNavigateToWorkspace={() => navigateToWorkspace()}
      />
    </div>
  );
}

export default App;
