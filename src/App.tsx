import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import VideoPlayer from './components/VideoPlayer';
import { progressService } from './services/progressService';
import type { VideoProgress } from './types/index';

const App: React.FC = () => {
  // Example video URL - replace with your actual video URL
  const demoVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const demoVideoId = 'demo-video-1';

  const handleProgressUpdate = (progress: VideoProgress) => {
    progressService.saveProgress(progress);
  };

  // Get initial progress if any
  const savedProgress = progressService.getProgress(demoVideoId);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Lecture Video Player
        </Typography>
        <Typography variant="body1" paragraph align="center">
          This video player tracks your real progress and prevents skipping.
        </Typography>
        
        <VideoPlayer
          videoUrl={demoVideoUrl}
          videoId={demoVideoId}
          onProgressUpdate={handleProgressUpdate}
          initialProgress={savedProgress}
        />
      </Box>
    </Container>
  );
};

export default App; 