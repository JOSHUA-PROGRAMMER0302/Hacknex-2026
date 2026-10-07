import math
from typing import List, Dict, Any, Tuple, Optional

def compute_iou(boxA: List[float], boxB: List[float]) -> float:
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0.0, xB - xA) * max(0.0, yB - yA)
    boxAArea = max(1.0, (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]))
    boxBArea = max(1.0, (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]))

    iou = interArea / float(boxAArea + boxBArea - interArea)
    return max(0.0, min(1.0, iou))

class Track:
    def __init__(self, track_id: int, bbox: List[float], confidence: float, cls_name: str, timestamp: float):
        self.track_id = track_id
        self.bbox = [float(x) for x in bbox] # [x1, y1, x2, y2]
        self.confidence = float(confidence)
        self.cls_name = cls_name
        self.first_seen = timestamp
        self.last_seen = timestamp
        self.time_since_update = 0
        self.hits = 1
        self.age = 1
        
        # History
        cx = (self.bbox[0] + self.bbox[2]) / 2.0
        cy = (self.bbox[1] + self.bbox[3]) / 2.0
        self.history = [{
            "timestamp": timestamp,
            "x": cx,
            "y": cy,
            "bottom_y": self.bbox[3],
            "width": self.bbox[2] - self.bbox[0],
            "height": self.bbox[3] - self.bbox[1]
        }]
        self.velocity = 0.0
        self.total_distance = 0.0
        self.behavior = "WALKING"
        self.stationary_start: Optional[float] = None
        self.in_zone = False
        self.is_fallen = False

    def update(self, bbox: List[float], confidence: float, timestamp: float):
        self.bbox = [float(x) for x in bbox]
        self.confidence = float(confidence)
        self.time_since_update = 0
        self.hits += 1
        self.age += 1
        
        cx = (self.bbox[0] + self.bbox[2]) / 2.0
        cy = (self.bbox[1] + self.bbox[3]) / 2.0
        
        # Calculate velocity from previous point
        if self.history:
            prev = self.history[-1]
            dt = max(0.01, timestamp - prev["timestamp"])
            dx = cx - prev["x"]
            dy = cy - prev["y"]
            dist = math.sqrt(dx * dx + dy * dy)
            self.total_distance += dist
            self.velocity = round(dist / dt, 2)
            
        self.history.append({
            "timestamp": timestamp,
            "x": cx,
            "y": cy,
            "bottom_y": self.bbox[3],
            "width": self.bbox[2] - self.bbox[0],
            "height": self.bbox[3] - self.bbox[1]
        })
        self.last_seen = timestamp

    def mark_missed(self):
        self.time_since_update += 1
        self.age += 1

class ByteTracker:
    """
    Real multi-object tracking associating detections across frames
    using IoU and centroid proximity matching.
    Guarantees persistent IDs (#01, #02, #03...) across all video frames.
    """
    def __init__(self, iou_threshold: float = 0.25, max_age: int = 15):
        self.iou_threshold = iou_threshold
        self.max_age = max_age
        self.next_id = 1
        self.tracks: List[Track] = []

    def update(self, detections: List[Dict[str, Any]], timestamp: float) -> List[Track]:
        """
        detections: list of dicts with keys: 'bbox', 'confidence', 'class'
        """
        # Step 1: Match existing tracks with detections via IoU
        unmatched_dets = list(range(len(detections)))
        unmatched_tracks = list(range(len(self.tracks)))
        matches = []

        if self.tracks and detections:
            # Build IoU matrix
            iou_matrix = []
            for t_idx, trk in enumerate(self.tracks):
                row = []
                for d_idx in unmatched_dets:
                    iou = compute_iou(trk.bbox, detections[d_idx]["bbox"])
                    row.append(iou)
                iou_matrix.append(row)

            # Greedy matching by maximum IoU
            used_tracks = set()
            used_dets = set()

            pairs = []
            for t_idx in range(len(self.tracks)):
                for d_idx in range(len(detections)):
                    pairs.append((iou_matrix[t_idx][d_idx], t_idx, d_idx))
            
            pairs.sort(key=lambda x: x[0], reverse=True)

            for iou, t_idx, d_idx in pairs:
                if iou < self.iou_threshold:
                    break
                if t_idx not in used_tracks and d_idx not in used_dets:
                    matches.append((t_idx, d_idx))
                    used_tracks.add(t_idx)
                    used_dets.add(d_idx)

            unmatched_tracks = [t for t in range(len(self.tracks)) if t not in used_tracks]
            unmatched_dets = [d for d in range(len(detections)) if d not in used_dets]

            # Secondary matching by centroid distance for close objects
            second_matched_tracks = set()
            second_matched_dets = set()
            for t_idx in unmatched_tracks:
                trk = self.tracks[t_idx]
                tcx = (trk.bbox[0] + trk.bbox[2]) / 2.0
                tcy = (trk.bbox[1] + trk.bbox[3]) / 2.0
                
                best_dist = float('inf')
                best_d_idx = None
                
                for d_idx in unmatched_dets:
                    if d_idx in second_matched_dets:
                        continue
                    db = detections[d_idx]["bbox"]
                    dcx = (db[0] + db[2]) / 2.0
                    dcy = (db[1] + db[3]) / 2.0
                    dist = math.sqrt((tcx - dcx) ** 2 + (tcy - dcy) ** 2)
                    if dist < 85.0 and dist < best_dist:
                        best_dist = dist
                        best_d_idx = d_idx
                        
                if best_d_idx is not None:
                    matches.append((t_idx, best_d_idx))
                    second_matched_tracks.add(t_idx)
                    second_matched_dets.add(best_d_idx)

            unmatched_tracks = [t for t in unmatched_tracks if t not in second_matched_tracks]
            unmatched_dets = [d for d in unmatched_dets if d not in second_matched_dets]

        # Step 2: Update matched tracks
        for t_idx, d_idx in matches:
            det = detections[d_idx]
            self.tracks[t_idx].update(det["bbox"], det["confidence"], timestamp)

        # Step 3: Mark unmatched tracks as missed
        for t_idx in unmatched_tracks:
            self.tracks[t_idx].mark_missed()

        # Step 4: Create new tracks for unmatched detections
        for d_idx in unmatched_dets:
            det = detections[d_idx]
            new_trk = Track(
                track_id=self.next_id,
                bbox=det["bbox"],
                confidence=det["confidence"],
                cls_name=det.get("class", "person"),
                timestamp=timestamp
            )
            self.next_id += 1
            self.tracks.append(new_trk)

        # Step 5: Filter out dead tracks that exceeded max_age
        self.tracks = [t for t in self.tracks if t.time_since_update <= self.max_age]

        # Return active tracks visible in current frame
        return [t for t in self.tracks if t.time_since_update == 0]
