export type BehaviorType = 'WALKING' | 'STATIONARY' | 'ENTERED RESTRICTED ZONE' | 'FALLEN' | 'UNKNOWN';
export type SeverityType = 'NORMAL' | 'UNUSUAL' | 'VIOLATION' | 'CRITICAL';

export interface BoundingBoxCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FrameDetection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface FrameTrack {
  track_id: number;
  label: string; // e.g. "Worker #1"
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  center: [number, number];
  velocity: number;
  behavior: BehaviorType;
  in_restricted_zone: boolean;
  trajectory: { x: number; y: number; t: number }[];
}

export interface FrameRecord {
  frame_number: number;
  timestamp: number;
  detections_count: number;
  active_tracks_count: number;
  detections: FrameDetection[];
  tracks: FrameTrack[];
}

export interface AnomalyEvent {
  id: string;
  track_id: number;
  who: string; // e.g. "Worker #2"
  event_type: 'stationary' | 'restricted_zone_entry' | 'fall';
  what: string;
  timestamp: number; // exact seconds in video
  duration: number;
  location: string;
  confidence: number;
  severity: SeverityType;
  details?: string;
}

export interface TrackedEntitySummary {
  track_id: number;
  id: string;
  role: string;
  current_behavior: BehaviorType;
  tracked_duration_sec: number;
  distance_traveled_px: number;
  status: SeverityType;
  confidence: number;
}

export interface VideoAnalysisResult {
  analysis_id: string;
  video_name: string;
  video_url: string;
  is_demo: boolean;
  metadata: {
    width: number;
    height: number;
    fps: number;
    duration: number;
    total_frames: number;
    processed_frames: number;
    restricted_polygon: [number, number][];
    model_engine: string;
  };
  summary: {
    people_tracked: number;
    events_detected: number;
    critical_events: number;
  };
  entities: TrackedEntitySummary[];
  events: AnomalyEvent[];
  frames: FrameRecord[];
}

export interface PipelineConfig {
  personConfidenceThreshold: number; // default 0.40
  stationaryTimeThreshold: number; // default 10.0
  stationaryDistThreshold: number; // default 25.0
  restrictedPolygon: [number, number][];
  debugMode: boolean;
}
