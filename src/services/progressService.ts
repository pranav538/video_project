import { VideoProgress, isVideoProgress } from '../types';

const STORAGE_KEY = 'video_progress';

export const progressService = {
  saveProgress(progress: VideoProgress): void {
    try {
      const allProgress = this.getAllProgress();
      const key = progress.userId 
        ? `${progress.userId}_${progress.videoId}`
        : progress.videoId;
      
      allProgress[key] = progress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  },

  getProgress(videoId: string, userId?: string): VideoProgress | null {
    try {
      const allProgress = this.getAllProgress();
      const key = userId ? `${userId}_${videoId}` : videoId;
      const progress = allProgress[key];
      
      return progress && isVideoProgress(progress) ? progress : null;
    } catch (error) {
      console.error('Error getting video progress:', error);
      return null;
    }
  },

  getAllProgress(): Record<string, VideoProgress> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      
      // Filter out invalid progress objects
      return Object.entries(parsed).reduce((acc, [key, value]) => {
        if (isVideoProgress(value)) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, VideoProgress>);
    } catch (error) {
      console.error('Error getting all progress:', error);
      return {};
    }
  },

  clearProgress(videoId: string, userId?: string): void {
    try {
      const allProgress = this.getAllProgress();
      const key = userId ? `${userId}_${videoId}` : videoId;
      delete allProgress[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error clearing video progress:', error);
    }
  },

  clearAllProgress(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing all progress:', error);
    }
  }
}; 