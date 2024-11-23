import React from 'react';
import { Box, Typography } from '@mui/material';

const SwipeableCard = ({ topic, hook, teaser }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <Typography variant="h5" sx={{ mt: 4, textAlign: 'center' }}>
        {topic}
      </Typography>
      <Typography variant="h4" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        {hook}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
        {teaser}
      </Typography>
    </Box>
  );
};

export default SwipeableCard;