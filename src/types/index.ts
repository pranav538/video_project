export interface VideoProgress {
  userId?: string;
  videoId: string;
  watchedIntervals: Array<[number, number]>;
  lastPosition: number;
  totalDuration: number;
  progress: number;
  timestamp?: number;
}

// Type guard to check if an object matches VideoProgress schema
export function isVideoProgress(obj: any): obj is VideoProgress {
  return (
    typeof obj === 'object' &&
    typeof obj.videoId === 'string' &&
    Array.isArray(obj.watchedIntervals) &&
    obj.watchedIntervals.every((interval: any) =>
      Array.isArray(interval) &&
      interval.length === 2 &&
      typeof interval[0] === 'number' &&
      typeof interval[1] === 'number'
    ) &&
    typeof obj.lastPosition === 'number' &&
    typeof obj.totalDuration === 'number' &&
    typeof obj.progress === 'number'
  );
} 