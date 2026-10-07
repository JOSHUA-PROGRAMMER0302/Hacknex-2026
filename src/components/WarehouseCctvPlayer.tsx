import React, { useRef, useEffect } from 'react';
import type { FrameRecord, FrameTrack, AnomalyEvent, PipelineConfig, VideoAnalysisResult } from '../types';

interface WarehouseCctvPlayerProps {
  videoUrl?: string;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  frames?: FrameRecord[];
  metadata?: VideoAnalysisResult['metadata'];
  selectedTrackId?: number | null;
  selectedEvent?: AnomalyEvent | null;
  onSelectTrack?: (id: number) => void;
  config?: PipelineConfig;
  onConfigChange?: (config: PipelineConfig) => void;
  isDemo?: boolean;
}

export const WarehouseCctvPlayer: React.FC<WarehouseCctvPlayerProps> = ({
  videoUrl,
  currentTime,
  isPlaying,
  onTimeUpdate,
  frames = [],
  metadata,
  selectedTrackId,
  selectedEvent,
  onSelectTrack,
  config = {
    personConfidenceThreshold: 0.35,
    stationaryTimeThreshold: 3.0,
    stationaryDistThreshold: 25.0,
    restrictedPolygon: [
      [480, 260],
      [860, 260],
      [860, 480],
      [480, 480]
    ],
    debugMode: false
  },
  isDemo = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(currentTime);

  timeRef.current = currentTime;

  // Sync HTML5 video playback
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoUrl]);

  // Sync seek timestamp
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime, videoUrl]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying && (!videoUrl || (videoRef.current && videoRef.current.paused))) {
        const nextTime = (timeRef.current + dt) % (metadata?.duration || 45);
        onTimeUpdate(nextTime);
      }

      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Actual resolution of video for relative coordinate transformations
      const sourceWidth = (videoRef.current?.videoWidth && videoRef.current.videoWidth > 0)
        ? videoRef.current.videoWidth
        : (metadata?.width || 1280);
      const sourceHeight = (videoRef.current?.videoHeight && videoRef.current.videoHeight > 0)
        ? videoRef.current.videoHeight
        : (metadata?.height || 720);

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Video or CCTV background
      let videoDrawn = false;
      if (videoUrl && videoRef.current && videoRef.current.readyState >= 2) {
        try {
          ctx.drawImage(videoRef.current, 0, 0, w, h);
          videoDrawn = true;
        } catch {
          // Fallback if crossOrigin issue
          drawFallbackIndustrialFeed(ctx, w, h, t);
        }
      }
      if (!videoDrawn) {
        drawFallbackIndustrialFeed(ctx, w, h, t);
      }

      // 2. Draw Configured Restricted Zone Polygon (scaled to video dimensions)
      drawRestrictedPolygon(ctx, w, h, sourceWidth, sourceHeight, config.restrictedPolygon);

      // 3. Find matching frame record for the current timestamp
      let matchedFrame: FrameRecord | null = null;
      if (frames && frames.length > 0) {
        matchedFrame = findClosestFrame(frames, t);
      }

      // 4. Draw Real Synchronized Bounding Boxes & Tracks
      let renderedTracksCount = 0;
      let renderedDetsCount = 0;

      if (matchedFrame && matchedFrame.tracks && matchedFrame.tracks.length > 0) {
        renderedDetsCount = matchedFrame.detections ? matchedFrame.detections.length : 0;
        renderedTracksCount = matchedFrame.tracks.length;

        matchedFrame.tracks.forEach((trk) => {
          if (trk.confidence >= config.personConfidenceThreshold) {
            drawRealTrackOverlay(
              ctx,
              w,
              h,
              sourceWidth,
              sourceHeight,
              trk,
              Boolean(selectedTrackId === trk.track_id || (selectedEvent && selectedEvent.track_id === trk.track_id))
            );
          }
        });
      } else if (isDemo) {
        // Fallback demo overlay if demo mode and no frames generated
        drawSyntheticDemoOverlay(ctx, w, h, t, selectedTrackId);
      } else {
        // SafeWatch AI Prompt requirement: "If YOLO cannot detect a person: 'No person detected in this frame.'"
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(w / 2 - 140, h - 50, 280, 24);
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#E5E7EB';
        ctx.textAlign = 'center';
        ctx.fillText('No person detected in this frame.', w / 2, h - 34);
        ctx.restore();
      }

      // 5. Draw CCTV Telemetry & Timestamp HUD
      drawCctvHud(ctx, w, h, t, Boolean(isDemo), metadata?.fps || 25.0);

      // 6. Draw Debug Mode Panel if enabled
      if (config.debugMode) {
        drawDebugOverlay(ctx, t, matchedFrame, renderedDetsCount, renderedTracksCount, metadata?.fps || 25.0);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, videoUrl, frames, metadata, selectedTrackId, selectedEvent, config, isDemo]);

  // Resize canvas to match display container
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        canvasRef.current.width = rect.width * (window.devicePixelRatio || 1);
        canvasRef.current.height = rect.height * (window.devicePixelRatio || 1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0D0E12] overflow-hidden select-none group">
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          crossOrigin="anonymous"
          className="hidden"
          playsInline
          muted
          loop
          onTimeUpdate={() => {
            if (videoRef.current) {
              onTimeUpdate(videoRef.current.currentTime);
            }
          }}
        />
      )}

      {/* Synchronized Computer Vision Canvas */}
      <canvas
        ref={canvasRef}
        onClick={(e) => {
          const canvas = canvasRef.current;
          if (!canvas || !onSelectTrack || !frames || frames.length === 0) return;
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          const clickX = (e.clientX - rect.left) * scaleX;
          const clickY = (e.clientY - rect.top) * scaleY;

          const sourceWidth = (videoRef.current?.videoWidth && videoRef.current.videoWidth > 0)
            ? videoRef.current.videoWidth
            : (metadata?.width || 1280);
          const sourceHeight = (videoRef.current?.videoHeight && videoRef.current.videoHeight > 0)
            ? videoRef.current.videoHeight
            : (metadata?.height || 720);

          const frame = findClosestFrame(frames, timeRef.current);
          if (frame && frame.tracks) {
            for (const trk of frame.tracks) {
              const [x1, y1, x2, y2] = trk.bbox;
              const sx = canvas.width / sourceWidth;
              const sy = canvas.height / sourceHeight;
              const rx1 = x1 * sx;
              const ry1 = y1 * sy;
              const rx2 = x2 * sx;
              const ry2 = y2 * sy;
              if (clickX >= rx1 && clickX <= rx2 && clickY >= ry1 && clickY <= ry2) {
                onSelectTrack(trk.track_id);
                break;
              }
            }
          }
        }}
        className="w-full h-full block cursor-crosshair"
      />
    </div>
  );
};

/* --------------------------------------------------------------------------
   Helper: Find Closest Frame By Timestamp
-------------------------------------------------------------------------- */
function findClosestFrame(frames: FrameRecord[], timestamp: number): FrameRecord | null {
  if (!frames || frames.length === 0) return null;
  let closest = frames[0];
  let minDiff = Math.abs(frames[0].timestamp - timestamp);

  for (let i = 1; i < frames.length; i++) {
    const diff = Math.abs(frames[i].timestamp - timestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = frames[i];
    }
  }

  // Allow closest match within 1.5 seconds window for steady tracking visualization
  return minDiff <= 1.5 ? closest : null;
}

/* --------------------------------------------------------------------------
   Render Real Track Overlay
-------------------------------------------------------------------------- */
function drawRealTrackOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sourceWidth: number,
  sourceHeight: number,
  trk: FrameTrack,
  isSelected: boolean
) {
  const [x1, y1, x2, y2] = trk.bbox;

  // Relative coordinate transformation based on video dimensions
  const sx = w / sourceWidth;
  const sy = h / sourceHeight;
  const bx = x1 * sx;
  const by = y1 * sy;
  const bw = (x2 - x1) * sx;
  const bh = (y2 - y1) * sy;

  // Pick color based on real behavior state
  let color = '#1E5E3A'; // Normal Green
  if (trk.behavior === 'STATIONARY') color = '#D97706'; // Unusual Amber
  if (trk.behavior === 'ENTERED RESTRICTED ZONE') color = '#D9381E'; // Violation Red
  if (trk.behavior === 'FALLEN') color = '#D9381E'; // Critical Crimson

  ctx.save();

  // 1. Draw subtle trajectory trail behind tracked person
  if (trk.trajectory && trk.trajectory.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 3]);
    ctx.globalAlpha = 0.55;
    ctx.moveTo(trk.trajectory[0].x * sx, trk.trajectory[0].y * sy);
    for (let i = 1; i < trk.trajectory.length; i++) {
      ctx.lineTo(trk.trajectory[i].x * sx, trk.trajectory[i].y * sy);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
  }

  // 2. Bounding Box Frame
  ctx.strokeStyle = color;
  ctx.lineWidth = isSelected ? 2.5 : 1.2;
  ctx.strokeRect(bx, by, bw, bh);

  // Precision corner brackets
  const corner = Math.min(bw * 0.25, 8);
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(bx, by + corner); ctx.lineTo(bx, by); ctx.lineTo(bx + corner, by);
  ctx.moveTo(bx + bw - corner, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + corner);
  ctx.moveTo(bx, by + bh - corner); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + corner, by + bh);
  ctx.moveTo(bx + bw - corner, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - corner);
  ctx.stroke();

  // Selected pulsing radar halo
  if (isSelected) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 5, by - 5, bw + 10, bh + 10);
  }

  // 3. Tracking ID & Behavior Tag beside/above person
  const tagText = `#${trk.track_id} · ${trk.behavior}`;
  ctx.font = '500 10px "JetBrains Mono", monospace';
  const tagW = ctx.measureText(tagText).width + 10;
  const tagH = 17;

  ctx.fillStyle = '#0E0F12';
  ctx.fillRect(bx, Math.max(0, by - tagH - 2), tagW, tagH);

  ctx.fillStyle = color;
  ctx.fillRect(bx, Math.max(0, by - tagH - 2), 2.5, tagH);

  ctx.fillStyle = '#FBF9F5';
  ctx.fillText(tagText, bx + 6, Math.max(12, by - 6));

  // 4. Model Confidence sub-label
  const confText = `${Math.round(trk.confidence * 100)}%`;
  ctx.font = '400 9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(confText, bx + bw - ctx.measureText(confText).width, by + bh + 12);

  ctx.restore();
}

/* --------------------------------------------------------------------------
   Draw Restricted Zone Polygon
-------------------------------------------------------------------------- */
function drawRestrictedPolygon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sourceWidth: number,
  sourceHeight: number,
  polygon: [number, number][]
) {
  if (!polygon || polygon.length < 3) return;

  const sx = w / sourceWidth;
  const sy = h / sourceHeight;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(polygon[0][0] * sx, polygon[0][1] * sy);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i][0] * sx, polygon[i][1] * sy);
  }
  ctx.closePath();

  // Fill diagonal hatch
  ctx.fillStyle = 'rgba(217, 56, 30, 0.08)';
  ctx.fill();

  ctx.strokeStyle = 'rgba(217, 56, 30, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label tag
  const lx = polygon[0][0] * sx + 6;
  const ly = polygon[0][1] * sy + 14;
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = '#D9381E';
  ctx.fillText('RESTRICTED ZONE (VIRTUAL PERIMETER)', lx, ly);

  ctx.restore();
}

/* --------------------------------------------------------------------------
   Draw Debug Mode Panel
-------------------------------------------------------------------------- */
function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  currentTime: number,
  frame: FrameRecord | null,
  detectionsCount: number,
  tracksCount: number,
  fps: number
) {
  ctx.save();
  const px = 18;
  const py = 50;
  const pw = 240;
  const ph = 145;

  ctx.fillStyle = 'rgba(14, 15, 18, 0.92)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeRect(px, py, pw, ph);

  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#22C55E';
  ctx.fillText('DEBUG MODE ACTIVE', px + 10, py + 18);

  ctx.font = '400 9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

  const sec = Math.floor(currentTime % 60).toString().padStart(2, '0');
  const ms = Math.floor((currentTime % 1) * 100).toString().padStart(2, '0');

  ctx.fillText(`FRAME:           ${frame ? frame.frame_number : Math.round(currentTime * fps)}`, px + 10, py + 36);
  ctx.fillText(`TIME:            00:${sec}.${ms}`, px + 10, py + 52);
  ctx.fillText(`FPS:             ${fps}`, px + 10, py + 68);
  ctx.fillText(`DETECTIONS:      ${detectionsCount}`, px + 10, py + 84);
  ctx.fillText(`TRACKS:          ${tracksCount}`, px + 10, py + 100);
  ctx.fillText(`INFERENCE:       YOLOv8 + ByteTrack`, px + 10, py + 116);
  ctx.fillText(`BEHAVIOR ENGINE: Spatial Temporal`, px + 10, py + 132);

  ctx.restore();
}

/* --------------------------------------------------------------------------
   HUD Overlays & Telemetry
-------------------------------------------------------------------------- */
function drawCctvHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  t: number,
  isDemo: boolean,
  _fps: number
) {
  ctx.save();
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

  // Camera designation
  ctx.fillText(isDemo ? 'CAM-04 [DEMO FEED]' : 'CAM-LIVE [REAL-TIME INFERENCE]', 18, 26);

  // Timecode
  const minutes = Math.floor(t / 60).toString().padStart(2, '0');
  const seconds = Math.floor(t % 60).toString().padStart(2, '0');
  const ms = Math.floor((t % 1) * 100).toString().padStart(2, '0');
  const timecode = `2026-10-07 14:${minutes}:${seconds}:${ms} UTC`;

  ctx.fillStyle = '#D9381E';
  ctx.fillText('● REC', w - 210, 26);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(timecode, w - 170, 26);

  ctx.restore();
}

/* --------------------------------------------------------------------------
   Industrial Background Fallback Grid
-------------------------------------------------------------------------- */
function drawFallbackIndustrialFeed(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) {
  // Industrial concrete floor tint
  ctx.fillStyle = '#0F1116';
  ctx.fillRect(0, 0, w, h);

  // Perspective floor grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;

  for (let x = 0; x < w; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  for (let y = 0; y < h; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Scanning scanline
  const scanY = (t * 80) % h;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.fillRect(0, scanY, w, 2);
}

/* --------------------------------------------------------------------------
   Synthetic Demo Overlay (Only for initial showcase demo, never uploaded video)
-------------------------------------------------------------------------- */
function drawSyntheticDemoOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  selectedTrackId?: number | null
) {
  const sx = w / 1280;
  const sy = h / 720;

  // Person 1: Walking
  const x1 = (320 + Math.sin(t * 0.8) * 120) * sx;
  const y1 = 340 * sy;
  drawRealTrackOverlay(ctx, w, h, 1280, 720, {
    track_id: 1,
    label: '#01',
    class: 'person',
    confidence: 0.94,
    bbox: [x1 / sx, y1 / sy, (x1 + 60) / sx, (y1 + 130) / sy],
    center: [(x1 + 30) / sx, (y1 + 65) / sy],
    velocity: 1.2,
    behavior: 'WALKING',
    in_restricted_zone: false,
    trajectory: []
  }, selectedTrackId === 1);

  // Person 2: In Zone
  const x2 = 560 * sx;
  const y2 = 310 * sy;
  drawRealTrackOverlay(ctx, w, h, 1280, 720, {
    track_id: 2,
    label: '#02',
    class: 'person',
    confidence: 0.91,
    bbox: [x2 / sx, y2 / sy, (x2 + 55) / sx, (y2 + 125) / sy],
    center: [(x2 + 27) / sx, (y2 + 62) / sy],
    velocity: 0.8,
    behavior: 'ENTERED RESTRICTED ZONE',
    in_restricted_zone: true,
    trajectory: []
  }, selectedTrackId === 2);
}
