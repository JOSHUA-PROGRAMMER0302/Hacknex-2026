import type { VideoAnalysisResult, FrameRecord, PipelineConfig, AnomalyEvent } from '../types';

export const BACKEND_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export interface VideoUploadResponse {
  analysis_id: string;
  fps: number;
  frame_count: number;
  duration: number;
  width: number;
  height: number;
  video_url: string;
}

export interface AnalysisStatusResponse {
  analysis_id: string;
  status: 'uploaded' | 'processing' | 'analyzing' | 'completed' | 'failed' | string;
  percentage: number;
  frames_processed: number;
  total_frames: number;
}

// Ray casting algorithm for point in polygon
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export class SafeWatchApiService {
  /**
   * Health check to verify FastAPI CV backend status
   * GET /api/health or GET /
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${BACKEND_BASE}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      // Also try root health endpoint
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${BACKEND_BASE}/`, { signal: controller.signal });
        clearTimeout(timeoutId);
        return res.ok;
      } catch {
        return false;
      }
    }
  }

  /**
   * Upload video file to backend
   * POST /api/videos
   */
  async uploadVideo(file: File): Promise<VideoUploadResponse> {
    const isUp = await this.checkBackendHealth();
    if (!isUp) {
      throw new Error("CV backend unavailable. Start FastAPI on port 8000.");
    }

    const formData = new FormData();
    formData.append("file", file);

    let res: Response;
    try {
      res = await fetch(`${BACKEND_BASE}/api/videos`, {
        method: "POST",
        body: formData,
      });
    } catch (err: any) {
      throw new Error(`Unable to connect to SafeWatch CV backend at ${BACKEND_BASE}.`);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      if (res.status === 400) {
        throw new Error("Backend could not read this video.");
      }
      throw new Error(`Video upload failed: ${errText || res.statusText}`);
    }

    const data = await res.json();
    return data as VideoUploadResponse;
  }

  /**
   * Trigger computer vision analysis on uploaded video
   * POST /api/videos/{analysisId}/analyze
   */
  async startAnalysis(analysisId: string, config: PipelineConfig): Promise<VideoAnalysisResult> {
    const formData = new FormData();
    formData.append("confidence_threshold", config.personConfidenceThreshold.toString());
    formData.append("stationary_threshold", config.stationaryTimeThreshold.toString());
    formData.append("restricted_polygon", JSON.stringify(config.restrictedPolygon));

    let res: Response;
    try {
      res = await fetch(`${BACKEND_BASE}/api/videos/${analysisId}/analyze`, {
        method: "POST",
        body: formData,
      });
    } catch (err: any) {
      throw new Error(`Unable to connect to SafeWatch CV backend at ${BACKEND_BASE}.`);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Computer vision analysis failed: ${errText || res.statusText}`);
    }

    const data = await res.json();
    return {
      ...data,
      is_demo: false,
    };
  }

  /**
   * Get ongoing analysis progress and status
   * GET /api/videos/{analysisId}/status
   */
  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse> {
    const res = await fetch(`${BACKEND_BASE}/api/videos/${analysisId}/status`);
    if (!res.ok) {
      throw new Error(`Failed to retrieve analysis status for ${analysisId}`);
    }
    return await res.json();
  }

  /**
   * Get completed analysis results
   * GET /api/videos/{analysisId}/results
   */
  async getAnalysisResults(analysisId: string): Promise<VideoAnalysisResult> {
    const res = await fetch(`${BACKEND_BASE}/api/videos/${analysisId}/results`);
    if (!res.ok) {
      throw new Error(`Failed to retrieve results for analysis ${analysisId}`);
    }
    const data = await res.json();
    return {
      ...data,
      is_demo: false,
    };
  }

  /**
   * Synchronized frame lookup for a specific timestamp
   * GET /api/analysis/{analysisId}/frame?time={timestamp}
   */
  async getFrameDetections(analysisId: string, timestamp: number): Promise<FrameRecord | null> {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/analysis/${analysisId}/frame?time=${timestamp}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`Failed to fetch frame at ${timestamp}s for ${analysisId}:`, err);
    }
    return null;
  }

  /**
   * Retrieve event log from backend
   * GET /api/analysis/{analysisId}/events
   */
  async getEvents(analysisId: string, upToTime?: number): Promise<{ analysis_id: string; events: AnomalyEvent[] }> {
    const url = upToTime !== undefined
      ? `${BACKEND_BASE}/api/analysis/${analysisId}/events?up_to_time=${upToTime}`
      : `${BACKEND_BASE}/api/analysis/${analysisId}/events`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch events for ${analysisId}`);
    }
    return await res.json();
  }

  /**
   * Complete end-to-end video analysis flow:
   * 1. Health check
   * 2. POST /api/videos (upload)
   * 3. POST /api/videos/{analysis_id}/analyze while polling GET /api/videos/{analysis_id}/status
   * 4. Returns real VideoAnalysisResult from backend.
   * NO fake client-side fallback!
   */
  async analyzeVideo(
    file: File | null,
    config: PipelineConfig,
    onProgress?: (pct: number, stageName: string, statusMeta?: { framesProcessed?: number; totalFrames?: number }) => void
  ): Promise<VideoAnalysisResult> {
    if (!file) {
      throw new Error("No video file selected.");
    }

    // Step 1: Health check
    const isUp = await this.checkBackendHealth();
    if (!isUp) {
      throw new Error("CV backend unavailable. Start FastAPI on port 8000.");
    }

    // Step 2: Upload Video
    if (onProgress) {
      onProgress(5, "Uploading video to FastAPI backend...");
    }

    const uploadRes = await this.uploadVideo(file);
    const analysisId = uploadRes.analysis_id;

    if (onProgress) {
      onProgress(15, "Video uploaded. Initializing YOLO & ByteTracker pipeline...");
    }

    // Step 3: Start polling progress while analysis is running
    let pollingInterval: any = null;
    let pollError: string | null = null;

    const startPolling = () => {
      pollingInterval = setInterval(async () => {
        try {
          const status = await this.getAnalysisStatus(analysisId);
          if (status.status === 'processing' || status.status === 'analyzing') {
            const pct = Math.min(98, Math.max(15, status.percentage));
            const frameInfo = status.total_frames > 0 ? ` (${status.frames_processed}/${status.total_frames} frames)` : '';
            if (onProgress) {
              onProgress(pct, `Running YOLO detection & ByteTrack tracking${frameInfo}...`, {
                framesProcessed: status.frames_processed,
                totalFrames: status.total_frames
              });
            }
          } else if (status.status === 'completed') {
            if (onProgress) {
              onProgress(100, "Analysis complete ✓", {
                framesProcessed: status.frames_processed,
                totalFrames: status.total_frames
              });
            }
            clearInterval(pollingInterval);
          } else if (status.status === 'failed') {
            pollError = "Computer vision analysis failed on backend.";
            clearInterval(pollingInterval);
          }
        } catch {
          // ignore transient polling errors while backend is busy
        }
      }, 600);
    };

    startPolling();

    try {
      // Step 4: Run actual computer-vision analysis
      const result = await this.startAnalysis(analysisId, config);
      if (pollingInterval) clearInterval(pollingInterval);

      if (pollError) {
        throw new Error(pollError);
      }

      if (onProgress) {
        onProgress(100, "Analysis complete ✓");
      }

      return {
        ...result,
        video_url: uploadRes.video_url || result.video_url,
        is_demo: false,
      };
    } catch (err: any) {
      if (pollingInterval) clearInterval(pollingInterval);
      throw err;
    }
  }
}

export const safeWatchApi = new SafeWatchApiService();
