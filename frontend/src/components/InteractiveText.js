import React, { useState, useEffect } from 'react';
import { Box, Drawer, Typography, CircularProgress } from '@mui/material';
import { explainSentence } from '../services/api';

const InteractiveText = ({ children, topic, level = 0 }) => {
  const [selectedText, setSelectedText] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedText, setProcessedText] = useState([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    // Split text into sentences (basic split on periods, question marks, and exclamation points)
    const text = children?.toString() || '';
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    setProcessedText(sentences.map(s => s.trim()));
  }, [children]);

  const handleTextClick = (event, text) => {
    event.stopPropagation();
    
    // If shift is held down, split into words
    const finalText = event.shiftKey 
      ? event.target.innerText
      : text;

    setSelectedText(finalText);
    setIsSidePanelOpen(true);
    fetchExplanation(finalText);
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

  const renderContent = (sentence, e) => {
    if (!e?.shiftKey) {
      return sentence;
    }
    
    // Split sentence into words and preserve spaces
    return sentence.split(/(\s+)/).map((word, idx) => {
      // Skip rendering for whitespace
      if (word.trim() === '') {
        return word;
      }
      
      return (
        <Box
          key={idx}
          component="span"
          onClick={(e) => {
            e.stopPropagation(); // Prevent sentence click
            handleTextClick(e, word);
          }}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(173, 216, 230, 0.4)',
              borderRadius: '4px',
            },
          }}
        >
          {word}
        </Box>
      );
    });
  };

  return (
    <Box component="div">
      {processedText.map((sentence, index) => (
        <Box
          key={index}
          component="span"
          onClick={(e) => handleTextClick(e, sentence)}
          onMouseMove={(e) => {
            setIsShiftPressed(e.shiftKey);
            // Re-render content by updating state if shift key changes
            if (isShiftPressed !== e.shiftKey) {
              setIsShiftPressed(e.shiftKey);
            }
          }}
          onKeyDown={(e) => setIsShiftPressed(e.shiftKey)}
          onKeyUp={(e) => setIsShiftPressed(e.shiftKey)}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: isShiftPressed ? 'transparent' : 'rgba(173, 216, 230, 0.4)',
              borderRadius: '4px',
            },
            marginRight: '0.2em',
          }}
        >
          {renderContent(sentence, { shiftKey: isShiftPressed })}
        </Box>
      ))}

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