import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const LearningCard = ({ title, description, type }) => {
  return (
    <Card sx={{ 
      minWidth: 275, 
      maxWidth: 345,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      m: 2
    }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {type}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Dummy data for initial load
export const dummyCards = [
  {
    id: 1,
    title: "Personal Success Story",
    description: "Learn how Sarah went from beginner to expert in just 6 months using innovative learning techniques.",
    type: "success-story"
  },
  {
    id: 2,
    title: "Real World Achievement",
    description: "Discover how this concept led to a breakthrough in quantum computing at Google.",
    type: "achievement"
  },
  {
    id: 3,
    title: "Theoretical Foundation",
    description: "Explore the fascinating theory that revolutionized how we think about this topic.",
    type: "theory"
  }
];

export default LearningCard;
