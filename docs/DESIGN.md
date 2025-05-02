# Lecture Video Player Design Documentation

## 🧮 Interval Tracking System

### Event-Based Tracking
The system uses React Player's events to track video watching progress:
- `onProgress`: Fires every second (configurable via `progressInterval`)
- `onSeek`: Captures manual seeking events
- `onPause`/`onPlay`: Manages playback state
- `onEnded`: Handles video completion

### Interval Capture Logic
```typescript
// Intervals are stored as tuples: [startTime, endTime]
type WatchedSegment = [number, number];

// Example of watched segments
watchedSegments = [
  [0, 10],   // Watched first 10 seconds
  [15, 20],  // Watched 5 seconds later
  [8, 17]    // Overlapping segment
];
```

### Skip Prevention
- Tracks time differences between updates
- If skip > MAX_SKIP_DURATION (10s), reverts to last position
- Uses `isSkipping` ref to prevent progress updates during skips
```typescript
if (skipDuration > MAX_SKIP_DURATION) {
  isSkipping.current = true;
  playerRef.current?.seekTo(previousPosition, 'seconds');
}
```

## 🔁 Interval Merging Algorithm

### Merge Process
1. Sort intervals by start time
2. Iterate through sorted intervals
3. Merge overlapping/adjacent intervals
4. Calculate unique time watched

```typescript
// Example merge process:
Initial segments: [[0,10], [5,15], [20,25]]
Sorted: [[0,10], [5,15], [20,25]]
Merged: [[0,15], [20,25]]
```

### Merging Logic Implementation
```typescript
const updateWatchedSegments = (start: number, end: number) => {
  // Ensure start is before end
  const newSegment = [Math.min(start, end), Math.max(start, end)];
  
  // Sort and merge process
  const mergedSegments = [...prevSegments, newSegment].sort((a, b) => a[0] - b[0]);
  
  // Merge overlapping intervals
  const result = [];
  let currentSegment = mergedSegments[0];
  
  for (let i = 1; i < mergedSegments.length; i++) {
    if (mergedSegments[i][0] <= currentSegment[1]) {
      // Overlap found - extend current segment
      currentSegment[1] = Math.max(currentSegment[1], mergedSegments[i][1]);
    } else {
      // No overlap - add current and start new segment
      result.push(currentSegment);
      currentSegment = mergedSegments[i];
    }
  }
  result.push(currentSegment);
  
  return result;
};
```

## 🛠️ Edge Cases

### Handled Scenarios
1. **Skipping Detection**
   - Monitors time gaps between updates
   - Reverts unauthorized skips
   - Shows warning notification

2. **Overlapping Segments**
   - Example: User watches [0-10], then [5-15]
   - Result: Single segment [0-15]
   - Total time = 15s (not 20s)

3. **Backwards Seeking**
   - Allows reviewing content
   - Doesn't double-count watched segments
   - Updates last position correctly

4. **Network Issues**
   - Handles player loading states
   - Preserves progress during interruptions
   - Resumes from last valid position

## 💾 Persistence Strategy

### Data Structure
```typescript
interface VideoProgress {
  videoId: string;
  progress: number;
  watchedSegments: Array<[number, number]>;
  lastPosition: number;
  timestamp: number;
  totalDuration: number;
  uniqueSecondsWatched: number;
}
```

### Storage Implementation
- Uses localStorage for demo purposes
- Automatically saves every 5 seconds during playback
- Saves on pause, seek, and video end
- Preserves complete watching history

### Resume Logic
```typescript
// On component mount
useEffect(() => {
  if (initialProgress?.lastPosition) {
    playerRef.current?.seekTo(initialProgress.lastPosition, 'seconds');
  }
}, []);
```

## 📊 Progress Calculation

### Unique Time Calculation
```typescript
const uniqueSeconds = watchedSegments.reduce(
  (acc, [start, end]) => acc + (end - start),
  0
);
```

### Progress Percentage
```typescript
const progress = Math.min(uniqueSecondsWatched / totalDuration, 1) * 100;
```

## 🔄 Update Cycle
1. User watches video segment
2. System captures start/end times
3. Merges with existing segments
4. Updates unique time watched
5. Calculates progress percentage
6. Persists updated state
7. Updates visual indicators

This implementation ensures accurate progress tracking while preventing inflation through skipping or rewatching, providing a robust foundation for lecture video progress tracking. 