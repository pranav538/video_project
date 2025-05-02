import React from 'react';
import { Box, LinearProgress, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ProgressIndicatorProps {
  progress: number;
  uniqueSecondsWatched: number;
  totalDuration: number;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  uniqueSecondsWatched,
  totalDuration,
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <StyledPaper elevation={1}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Progress: {Math.round(progress * 100)}%
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {formatTime(uniqueSecondsWatched)} / {formatTime(totalDuration)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            },
          }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Unique seconds watched: {Math.round(uniqueSecondsWatched)} seconds
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default ProgressIndicator; 