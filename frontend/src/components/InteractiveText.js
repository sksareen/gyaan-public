import React, { useState } from 'react';
import { Box, Drawer, Typography, CircularProgress } from '@mui/material';
import { explainSentence } from '../services/api';

const InteractiveText = ({ children, topic, level = 0 }) => {
  const [selectedText, setSelectedText] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTextClick = (event) => {
    event.stopPropagation();
    const text = event.currentTarget.innerText;
    setSelectedText(text);
    setIsSidePanelOpen(true);
    fetchExplanation(text);
  };

  const fetchExplanation = async (text) => {
    setLoading(true);
    try {
      if (!topic) {
        throw new Error('Topic is required for explanation');
      }
      const data = await explainSentence(text, topic);
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanation('Failed to fetch explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsSidePanelOpen(false);
    setSelectedText(null);
    setExplanation('');
  };

  return (
    <Box
      component="span"
      onClick={handleTextClick}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(173, 216, 230, 0.4)',
          borderRadius: '4px',
        },
      }}
    >
      {children}

      <Drawer
        anchor="right"
        open={isSidePanelOpen}
        onClose={handleClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '40%',
            minWidth: 350,
            maxWidth: 600,
            right: `${level * 40}%`,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {selectedText && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedText}
              </Typography>
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <InteractiveText topic={topic} level={level + 1}>
                  {explanation}
                </InteractiveText>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default InteractiveText;

