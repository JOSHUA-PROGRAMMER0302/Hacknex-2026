import os
import time
import math
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from tracker import ByteTracker, Track

# Point in polygon test using ray casting
def point_in_polygon(point: Tuple[float, float], polygon: List[List[float]]) -> bool:
    x, y = point
    n = len(polygon)
    if n < 3:
        return False
    inside = False
    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

class VideoAnalysisPipeline:
    def __init__(
        self,
        person_conf_threshold: float = 0.35,
        stationary_time_threshold: float = 3.0,
        stationary_dist_threshold: float = 25.0,
        restricted_polygon: Optional[List[List[float]]] = None,
        model_name: str = "yolov8n.pt"
    ):
        self.conf_threshold = person_conf_threshold
        self.stationary_time_threshold = stationary_time_threshold
        self.stationary_dist_threshold = stationary_dist_threshold
        self.restricted_polygon = restricted_polygon or [
            [480.0, 260.0],
            [860.0, 260.0],
            [860.0, 480.0],
            [480.0, 480.0]
        ]
        self.model_name = model_name
        self.model = None
        self._init_yolo()

    def _init_yolo(self):
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_name)
            print(f"[SafeWatch CV] Ultralytics YOLO initialized successfully with {self.model_name}")
        except Exception as e:
            print(f"[SafeWatch CV] Ultralytics YOLO not loaded ({e}). Using OpenCV computer vision engine.")
            self.model = None

    def extract_metadata(self, video_path: str) -> Dict[str, Any]:
        """
        Extract video technical parameters: width, height, FPS, frame count, duration
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file at {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = round(float(cap.get(cv2.CAP_PROP_FPS) or 24.0), 2)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = round(total_frames / fps, 2) if fps > 0 else 0.0
        cap.release()

        return {
            "width": width,
            "height": height,
            "fps": fps,
            "frame_count": total_frames,
            "duration": duration
        }

    def process_video(
        self,
        video_path: str,
        progress_callback=None,
        sample_fps: int = 6
    ) -> Dict[str, Any]:
        """
        Execute real computer vision pipeline:
        Frame extraction -> Detection -> Persistent Tracking -> Movement & Behavior -> Zone & Fall Events.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file at {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        orig_fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = round(total_frames / orig_fps, 2) if orig_fps > 0 else 0.0

        # Sample frames to maintain responsive real-time inference rate
        frame_step = max(1, int(round(orig_fps / sample_fps)))
        expected_processed = max(1, total_frames // frame_step)

        tracker = ByteTracker(iou_threshold=0.20, max_age=18)
        fgbg = cv2.createBackgroundSubtractorMOG2(history=60, varThreshold=20, detectShadows=False)

        frame_records: List[Dict[str, Any]] = []
        events: List[Dict[str, Any]] = []
        event_counter = 1

        # Track state machines
        zone_states: Dict[int, bool] = {} # track_id -> is_inside
        stationary_starts: Dict[int, float] = {} # track_id -> start_time
        stationary_emitted: Dict[int, bool] = {} # track_id -> event emitted
        fall_emitted: Dict[int, bool] = {} # track_id -> event emitted
        all_tracks_seen: Dict[int, Track] = {}

        frame_idx = 0
        processed_count = 0
        start_time_bench = time.time()

        print(f"[SafeWatch CV] Processing video: {total_frames} frames, {orig_fps:.2f} FPS, {duration:.2f}s")

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_step != 0:
                frame_idx += 1
                continue

            current_timestamp = round(frame_idx / orig_fps, 2)
            processed_count += 1

            if progress_callback:
                pct = min(99, int((processed_count / expected_processed) * 100))
                progress_callback(pct, current_timestamp, processed_count, expected_processed)

            # --- PHASE 2: DETECTION ---
            detections = []

            if self.model is not None:
                try:
                    # Run YOLOv8 on current frame
                    results = self.model(frame, conf=self.conf_threshold, verbose=False)
                    if results and len(results) > 0 and results[0].boxes is not None:
                        for box in results[0].boxes:
                            cls_id = int(box.cls[0].item())
                            conf = float(box.conf[0].item())
                            # COCO: 0=person, 2=car, 3=motorcycle, 5=bus, 7=truck
                            if cls_id in [0, 2, 3, 5, 7]:
                                cls_name = "person" if cls_id == 0 else "vehicle"
                                xyxy = box.xyxy[0].tolist()
                                detections.append({
                                    "class": cls_name,
                                    "confidence": round(conf, 3),
                                    "bbox": [round(xyxy[0], 1), round(xyxy[1], 1), round(xyxy[2], 1), round(xyxy[3], 1)]
                                })
                except Exception as e:
                    print(f"[SafeWatch CV] YOLO inference warning: {e}")

            # If YOLO not present or returned 0, run OpenCV visual foreground motion detector
            if not detections:
                fgmask = fgbg.apply(frame)
                contours, _ = cv2.findContours(fgmask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                for c in contours:
                    area = cv2.contourArea(c)
                    if area > 800: # Filter small noise
                        x, y, w, h = cv2.boundingRect(c)
                        if h > 35 and (h / max(1, w)) > 0.4:
                            conf = min(0.96, round(0.70 + (area / 12000.0) * 0.25, 2))
                            detections.append({
                                "class": "person",
                                "confidence": conf,
                                "bbox": [float(x), float(y), float(x + w), float(y + h)]
                            })

            # --- PHASE 3: PERSISTENT TRACKING ---
            active_tracks = tracker.update(detections, current_timestamp)

            frame_track_records = []
            for trk in active_tracks:
                tid = trk.track_id
                all_tracks_seen[tid] = trk

                bx = trk.bbox
                cx = (bx[0] + bx[2]) / 2.0
                cy = (bx[1] + bx[3]) / 2.0
                bottom_pt = (cx, bx[3])
                bw = bx[2] - bx[0]
                bh = bx[3] - bx[1]
                aspect_ratio = round(bw / max(1.0, bh), 2)

                # --- PHASE 6: REAL MOVEMENT ANALYSIS ---
                # Check displacement over stationary window
                hist = trk.history
                recent_pts = [p for p in hist if current_timestamp - p["timestamp"] <= self.stationary_time_threshold]
                is_stationary = False
                
                if len(recent_pts) >= 3 and (current_timestamp - recent_pts[0]["timestamp"]) >= min(2.5, self.stationary_time_threshold):
                    # Compute max distance from start of window
                    x0, y0 = recent_pts[0]["x"], recent_pts[0]["y"]
                    max_disp = max(math.sqrt((p["x"] - x0) ** 2 + (p["y"] - y0) ** 2) for p in recent_pts)
                    if max_disp < self.stationary_dist_threshold:
                        is_stationary = True

                # Determine behavior label
                behavior = "WALKING"
                if is_stationary:
                    behavior = "STATIONARY"
                    if tid not in stationary_starts:
                        stationary_starts[tid] = current_timestamp
                    dwell = round(current_timestamp - stationary_starts[tid], 1)
                    if dwell >= self.stationary_time_threshold and not stationary_emitted.get(tid, False):
                        events.append({
                            "id": f"evt_stat_{event_counter}",
                            "track_id": tid,
                            "who": f"#{str(tid).padStart(2, '0')}" if hasattr(str(tid), 'padStart') else f"#{tid:02d}",
                            "event_type": "stationary",
                            "what": "Prolonged Stationary",
                            "timestamp": current_timestamp,
                            "duration": dwell,
                            "location": "Warehouse Floor",
                            "confidence": round(trk.confidence, 2),
                            "severity": "NORMAL"
                        })
                        event_counter += 1
                        stationary_emitted[tid] = True
                else:
                    stationary_starts.pop(tid, None)
                    stationary_emitted[tid] = False

                # --- PHASE 7: RESTRICTED ZONE ---
                in_zone = point_in_polygon(bottom_pt, self.restricted_polygon)
                was_in_zone = zone_states.get(tid, False)
                zone_states[tid] = in_zone
                trk.in_zone = in_zone

                if in_zone and not was_in_zone:
                    # Transition: OUTSIDE -> INSIDE
                    behavior = "ENTERED RESTRICTED ZONE"
                    events.append({
                        "id": f"evt_zone_{event_counter}",
                        "track_id": tid,
                        "who": f"#{tid:02d}",
                        "event_type": "restricted_zone_entry",
                        "what": "Restricted Zone Entry",
                        "timestamp": current_timestamp,
                        "duration": 3.0,
                        "location": "Warehouse — Zone B",
                        "confidence": round(trk.confidence, 2),
                        "severity": "VIOLATION",
                        "details": "Personnel crossed virtual boundary into restricted automated sector."
                    })
                    event_counter += 1
                elif in_zone:
                    behavior = "ENTERED RESTRICTED ZONE"

                # --- PHASE 8: FALL DETECTION ---
                # Check for sudden collapse in height / horizontal prone aspect ratio
                is_fallen = False
                if len(hist) >= 4:
                    prev_heights = [p["height"] for p in hist[-4:-1]]
                    avg_prev_h = sum(prev_heights) / len(prev_heights)
                    h_ratio = bh / max(1.0, avg_prev_h)

                    # Height drop > 35% and aspect ratio > 1.0 (wider than tall)
                    if h_ratio < 0.65 and aspect_ratio > 1.0:
                        is_fallen = True
                        behavior = "FALLEN"
                        trk.is_fallen = True

                        if not fall_emitted.get(tid, False):
                            events.append({
                                "id": f"evt_fall_{event_counter}",
                                "track_id": tid,
                                "who": f"#{tid:02d}",
                                "event_type": "fall",
                                "what": "Fall Detected",
                                "timestamp": current_timestamp,
                                "duration": 3.5,
                                "location": "Warehouse — Picking Floor",
                                "confidence": round(trk.confidence, 2),
                                "severity": "CRITICAL",
                                "details": "Abrupt vertical bounding box collapse with horizontal prone aspect ratio."
                            })
                            event_counter += 1
                            fall_emitted[tid] = True

                trk.behavior = behavior

                # Build trajectory trail
                traj = [
                    {"x": round(p["x"], 1), "y": round(p["y"], 1), "t": p["timestamp"]}
                    for p in hist[-8:]
                ]

                frame_track_records.append({
                    "track_id": tid,
                    "label": f"#{tid:02d}",
                    "class": trk.cls_name,
                    "confidence": round(trk.confidence, 2),
                    "bbox": [round(x, 1) for x in bx],
                    "center": [round(cx, 1), round(cy, 1)],
                    "velocity": trk.velocity,
                    "behavior": behavior,
                    "in_restricted_zone": in_zone,
                    "trajectory": traj
                })

            frame_records.append({
                "frame_number": frame_idx,
                "timestamp": current_timestamp,
                "detections_count": len(detections),
                "active_tracks_count": len(frame_track_records),
                "detections": detections,
                "tracks": frame_track_records
            })

            frame_idx += 1

        cap.release()
        total_time_bench = round(time.time() - start_time_bench, 2)
        print(f"[SafeWatch CV] Analysis complete in {total_time_bench}s: {len(frame_records)} frames, {len(all_tracks_seen)} tracks, {len(events)} events")

        if progress_callback:
            progress_callback(100, duration, processed_count, expected_processed)

        # Build persistent entity summaries
        entities_list = []
        for tid, trk in all_tracks_seen.items():
            status = "CRITICAL" if trk.is_fallen else "VIOLATION" if trk.in_zone else "NORMAL"
            entities_list.append({
                "track_id": tid,
                "id": f"#{tid:02d}",
                "role": "Personnel",
                "current_behavior": trk.behavior,
                "tracked_duration_sec": round(trk.last_seen - trk.first_seen, 2),
                "distance_traveled_px": round(trk.total_distance, 1),
                "status": status,
                "confidence": round(trk.confidence, 2)
            })

        critical_count = sum(1 for e in events if e["severity"] == "CRITICAL")

        return {
            "metadata": {
                "width": width,
                "height": height,
                "fps": round(orig_fps, 2),
                "duration": duration,
                "total_frames": total_frames,
                "processed_frames": len(frame_records),
                "restricted_polygon": self.restricted_polygon,
                "model_engine": "Ultralytics YOLO + ByteTrack" if self.model else "OpenCV Vision + ByteTracker",
                "processing_time_sec": total_time_bench
            },
            "summary": {
                "people_tracked": len(entities_list),
                "events_detected": len(events),
                "critical_events": critical_count
            },
            "entities": entities_list,
            "events": events,
            "frames": frame_records
        }
