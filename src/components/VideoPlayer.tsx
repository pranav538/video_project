import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Box, Paper, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { VideoProgress } from '../types';
import ProgressIndicator from './ProgressIndicator';

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  userId?: string;
  onProgressUpdate: (progress: VideoProgress) => void;
  initialProgress?: VideoProgress | null;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 800,
  margin: '0 auto',
  marginTop: theme.spacing(2),
}));

/**
 * VideoPlayer Component
 * 
 * Tracks video watching progress with the following features:
 * - Accurate interval tracking of watched segments
 * - Prevention of progress inflation through skipping
 * - Automatic merging of overlapping watched segments
 * - Progress persistence and resume capability
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoId,
  userId,
  onProgressUpdate,
  initialProgress = null,
}) => {
  // Track watched time intervals as [start, end] pairs
  const [watchedIntervals, setWatchedIntervals] = useState<Array<[number, number]>>(
    initialProgress?.watchedIntervals || []
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(
    initialProgress?.totalDuration || 0
  );
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  
  // Refs for tracking playback state
  const playerRef = useRef<ReactPlayer>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const lastPosition = useRef<number>(initialProgress?.lastPosition || 0);
  const isSkipping = useRef<boolean>(false);

  // Constants for progress tracking
  const MIN_WATCH_TIME = 2; // Minimum time (seconds) before progress is counted
  const MAX_SKIP_DURATION = 10; // Maximum allowed skip duration (seconds)

  useEffect(() => {
    // Resume playback from last position
    if (initialProgress?.lastPosition && playerRef.current) {
      playerRef.current.seekTo(initialProgress.lastPosition, 'seconds');
    }

    // Set up periodic progress saving
    const progressInterval = setInterval(() => {
      if (isPlaying && !isSkipping.current) {
        saveProgress();
      }
    }, 5000);

    return () => clearInterval(progressInterval);
  }, [isPlaying, initialProgress]);

  /**
   * Handles video progress updates
   * - Prevents skipping by monitoring time differences
   * - Updates watched segments for valid playback
   * - Manages progress tracking state
   */
  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    const currentTime = Date.now();
    const timeDiff = (currentTime - lastUpdateTime.current) / 1000;
    
    if (timeDiff >= MIN_WATCH_TIME) {
      const previousPosition = lastPosition.current;
      const currentPosition = playedSeconds;
      const skipDuration = Math.abs(currentPosition - previousPosition);

      // Detect and handle skipping
      if (skipDuration > MAX_SKIP_DURATION) {
        isSkipping.current = true;
        setShowSkipWarning(true);
        playerRef.current?.seekTo(previousPosition, 'seconds');
        return;
      }

      // Update progress for valid playback
      isSkipping.current = false;
      updateWatchedIntervals(previousPosition, currentPosition);
      lastPosition.current = currentPosition;
      lastUpdateTime.current = currentTime;
    }
  };

  /**
   * Updates the watched intervals array
   * - Adds new interval
   * - Merges overlapping intervals
   * - Calculates progress
   */
  const updateWatchedIntervals = (start: number, end: number) => {
    if (start === end) return;

    setWatchedIntervals(prevIntervals => {
      // Create new interval with ordered start/end times
      const newInterval: [number, number] = [
        Math.min(start, end),
        Math.max(start, end)
      ];
      
      // Sort all intervals chronologically
      const mergedIntervals = [...prevIntervals, newInterval].sort((a, b) => a[0] - b[0]);
      
      // Merge overlapping intervals
      const result: Array<[number, number]> = [];
      let currentInterval = mergedIntervals[0];
      
      for (let i = 1; i < mergedIntervals.length; i++) {
        if (mergedIntervals[i][0] <= currentInterval[1]) {
          // Extend current interval to include overlap
          currentInterval[1] = Math.max(currentInterval[1], mergedIntervals[i][1]);
        } else {
          // Start new interval for non-overlapping time
          result.push(currentInterval);
          currentInterval = mergedIntervals[i];
        }
      }
      result.push(currentInterval);
      
      return result;
    });
  };

  /**
   * Calculates total progress as a percentage
   * Based on unique time watched vs total duration
   */
  const calculateProgress = (): number => {
    if (!totalDuration) return 0;
    
    const uniqueSecondsWatched = watchedIntervals.reduce(
      (acc, [start, end]) => acc + (end - start),
      0
    );
    
    return Math.min((uniqueSecondsWatched / totalDuration) * 100, 100);
  };

  // Store video duration when available
  const handleDuration = (duration: number) => {
    setTotalDuration(duration);
  };

  /**
   * Saves current progress state
   * Includes all tracking data for accurate resume
   */
  const saveProgress = () => {
    const progress: VideoProgress = {
      userId,
      videoId,
      watchedIntervals,
      lastPosition: lastPosition.current,
      totalDuration,
      progress: calculateProgress(),
      timestamp: Date.now(),
    };
    onProgressUpdate(progress);
  };

  // Reset skip detection on manual seek
  const handleSeek = (seconds: number) => {
    isSkipping.current = false;
    setShowSkipWarning(false);
  };

  const uniqueSecondsWatched = watchedIntervals.reduce(
    (acc, [start, end]) => acc + (end - start),
    0
  );

  return (
    <>
      <StyledPaper elevation={3}>
        <Box sx={{ width: '100%', position: 'relative' }}>
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="auto"
            controls={true}
            playing={isPlaying}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onPlay={() => setIsPlaying(true)}
            onPause={() => {
              setIsPlaying(false);
              saveProgress();
            }}
            onEnded={() => {
              setIsPlaying(false);
              saveProgress();
            }}
            onSeek={handleSeek}
            progressInterval={1000}
          />
          <ProgressIndicator
            progress={calculateProgress() / 100}
            uniqueSecondsWatched={uniqueSecondsWatched}
            totalDuration={totalDuration}
          />
        </Box>
      </StyledPaper>
      <Snackbar
        open={showSkipWarning}
        autoHideDuration={3000}
        onClose={() => setShowSkipWarning(false)}
        message="Skipping detected. Progress is only counted for watched content."
      />
    </>
  );
};

export default VideoPlayer; 