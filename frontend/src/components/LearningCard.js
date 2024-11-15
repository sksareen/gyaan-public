import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { generateMiniModule } from '../services/api';

const LearningCard = ({ title, description, type }) => {
  const navigate = useNavigate();

  const handleCardClick = async () => {
    try {
      const content = await generateMiniModule(title);
      // Save to localStorage
      const savedModules = JSON.parse(localStorage.getItem('savedModules') || '[]');
      const newModule = {
        id: Date.now(),
        topic: title,
        type: type,
        content: content,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('savedModules', JSON.stringify([...savedModules, newModule]));
      
      // Navigate to the new mini module
      navigate(`/mini-module/${newModule.id}`);
    } catch (error) {
      console.error('Error fetching mini module content:', error);
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: 275, 
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        m: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
          transform: 'scale(1.02)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
      onClick={handleCardClick}
    >
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

export default LearningCard;
