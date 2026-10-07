import type { VideoAnalysisResult, FrameRecord, FrameTrack, AnomalyEvent } from '../types';

/**
 * High-precision temporal frame generator for the 17.5s Warehouse CCTV video.
 * Generates frame-accurate detections and tracks strictly obeying temporal causality:
 * - 00:00 - 00:08: All workers walking nominally. Event history: Empty.
 * - 00:08.42: Worker #02 crosses into restricted zone. Event emitted.
 * - 00:13.87: Worker #03 suffers abrupt vertical fall. Event emitted.
 * - Before 00:13.87: Worker #03 is WALKING. No fall event exists.
 * - After 00:13.87: Worker #03 is FALLEN.
 */

function generateWarehouse17sFrames(): FrameRecord[] {
  const frames: FrameRecord[] = [];
  const duration = 17.5;
  const step = 0.25; // 4 samples per second

  for (let t = 0; t <= duration; t = Number((t + step).toFixed(2))) {
    const frameNumber = Math.round(t * 29.97);
    const tracks: FrameTrack[] = [];

    // Worker #01: Steady walking along picking corridor
    const w1Progress = t / 17.5;
    const w1X = 220 + w1Progress * 140;
    const w1Y = 310 + w1Progress * 40;
    const w1Trajectory = [];
    for (let st = Math.max(0, t - 3); st <= t; st += 0.5) {
      const sp = st / 17.5;
      w1Trajectory.push({ x: 220 + sp * 140, y: 310 + sp * 40, t: Number(st.toFixed(2)) });
    }

    tracks.push({
      track_id: 1,
      label: "#01",
      class: "person",
      confidence: 0.94,
      bbox: [w1X - 28, w1Y - 65, w1X + 28, w1Y + 65],
      center: [w1X, w1Y],
      velocity: 1.1,
      behavior: "WALKING",
      in_restricted_zone: false,
      trajectory: w1Trajectory
    });

    // Worker #02: Walks toward and breaches Restricted Zone at t=8.42
    const isW2InZone = t >= 8.42;
    const w2Progress = Math.min(1, t / 14);
    const w2X = 640 - w2Progress * 120;
    const w2Y = 220 + w2Progress * 160;
    const w2Trajectory = [];
    for (let st = Math.max(0, t - 3); st <= t; st += 0.5) {
      const sp = Math.min(1, st / 14);
      w2Trajectory.push({ x: 640 - sp * 120, y: 220 + sp * 160, t: Number(st.toFixed(2)) });
    }

    tracks.push({
      track_id: 2,
      label: "#02",
      class: "person",
      confidence: 0.92,
      bbox: [w2X - 26, w2Y - 60, w2X + 26, w2Y + 60],
      center: [w2X, w2Y],
      velocity: isW2InZone ? 0.7 : 1.3,
      behavior: isW2InZone ? "ENTERED RESTRICTED ZONE" : "WALKING",
      in_restricted_zone: isW2InZone,
      trajectory: w2Trajectory
    });

    // Worker #03: Walks until t=13.2, falls between 13.2-13.87, fallen >= 13.87
    let w3Behavior: any = "WALKING";
    let w3W = 28;
    let w3H = 68;
    let w3X = 820 - Math.min(1, t / 13.2) * 90;
    let w3Y = 410 + Math.min(1, t / 13.2) * 50;

    if (t >= 13.2 && t < 13.87) {
      w3Behavior = "FALLEN"; // Transitioning
      w3W = 42;
      w3H = 45;
      w3Y += 15;
    } else if (t >= 13.87) {
      w3Behavior = "FALLEN";
      w3W = 65;
      w3H = 24; // Prone aspect ratio
      w3Y += 35;
    }

    const w3Trajectory = [];
    for (let st = Math.max(0, t - 3); st <= t; st += 0.5) {
      const sp = Math.min(1, st / 13.2);
      w3Trajectory.push({ x: 820 - sp * 90, y: 410 + sp * 50, t: Number(st.toFixed(2)) });
    }

    tracks.push({
      track_id: 3,
      label: "#03",
      class: "person",
      confidence: t >= 13.87 ? 0.95 : 0.91,
      bbox: [w3X - w3W / 2, w3Y - w3H / 2, w3X + w3W / 2, w3Y + w3H / 2],
      center: [w3X, w3Y],
      velocity: t >= 13.87 ? 0.0 : 1.2,
      behavior: w3Behavior,
      in_restricted_zone: false,
      trajectory: w3Trajectory
    });

    frames.push({
      frame_number: frameNumber,
      timestamp: t,
      detections_count: tracks.length,
      active_tracks_count: tracks.length,
      detections: tracks.map(trk => ({
        class: trk.class,
        confidence: trk.confidence,
        bbox: trk.bbox
      })),
      tracks
    });
  }

  return frames;
}

export const WAREHOUSE_17S_FRAMES = generateWarehouse17sFrames();

export const WAREHOUSE_17S_EVENTS: AnomalyEvent[] = [
  {
    id: "evt_zone_02_84",
    track_id: 2,
    who: "#02",
    event_type: "restricted_zone_entry",
    what: "Restricted Zone Entry",
    timestamp: 8.42,
    duration: 9.08,
    location: "High-Voltage AGV Corridor",
    confidence: 0.92,
    severity: "VIOLATION",
    details: "Optical perimeter tripwire breached into active automated machinery lane."
  },
  {
    id: "evt_fall_03_138",
    track_id: 3,
    who: "#03",
    event_type: "fall",
    what: "Fall Detected",
    timestamp: 13.87,
    duration: 3.63,
    location: "Warehouse Bay 3 — Floor Staging",
    confidence: 0.95,
    severity: "CRITICAL",
    details: "Abrupt negative vertical acceleration followed by horizontal prone aspect ratio collapse."
  }
];

export const DEMO_REFERENCE_ANALYSIS: VideoAnalysisResult = {
  analysis_id: "job_whse_17s",
  video_name: "WAREHOUSE_CCTV_CAM04_17S.mp4",
  video_url: "/job_8d3cc5b4.mp4", // Uploaded warehouse clip
  is_demo: true,
  metadata: {
    width: 1280,
    height: 720,
    fps: 29.97,
    duration: 17.5,
    total_frames: 525,
    processed_frames: WAREHOUSE_17S_FRAMES.length,
    restricted_polygon: [
      [480, 260],
      [860, 260],
      [860, 480],
      [480, 480]
    ],
    model_engine: "YOLOv8x + ByteTrack (Temporal Synchronized)"
  },
  summary: {
    people_tracked: 3,
    events_detected: 2,
    critical_events: 1
  },
  entities: [
    {
      track_id: 1,
      id: "#01",
      role: "Personnel",
      current_behavior: "WALKING",
      tracked_duration_sec: 17.5,
      distance_traveled_px: 145.6,
      status: "NORMAL",
      confidence: 0.94
    },
    {
      track_id: 2,
      id: "#02",
      role: "Personnel",
      current_behavior: "ENTERED RESTRICTED ZONE",
      tracked_duration_sec: 17.5,
      distance_traveled_px: 200.0,
      status: "VIOLATION",
      confidence: 0.92
    },
    {
      track_id: 3,
      id: "#03",
      role: "Personnel",
      current_behavior: "FALLEN",
      tracked_duration_sec: 17.5,
      distance_traveled_px: 102.4,
      status: "CRITICAL",
      confidence: 0.95
    }
  ],
  events: WAREHOUSE_17S_EVENTS,
  frames: WAREHOUSE_17S_FRAMES
};
