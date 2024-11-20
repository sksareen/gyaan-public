import React, { useState } from 'react';
import { Box, Typography, CircularProgress, TextField, Button } from '@mui/material';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';
import theme from './Theme';
import SideWindow from './SideWindow';

const QuestionPanel = ({ topic, onExplanationReceived, questions = [], level }) => {
  const [question, setQuestion] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [childWindow, setChildWindow] = useState(null);

  const handleQuestionSubmit = async (questionText = question) => {
    if (!questionText.trim()) return;
    
    setIsExplaining(true);
    try {
      const explanation = await explainSentence(questionText, topic);
      setChildWindow(
        <SideWindow
          open={true}
          onClose={() => setChildWindow(null)}
          title={questionText}
          content={explanation.explanation}
          topic={topic}
          level={(level || 0) + 1}
        />
      );
      if (questionText === question) {
        setQuestion('');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <Box sx={{ mt: 4, position: 'relative' }}>
      {isExplaining && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {questions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {/* <Typography variant="h6" gutterBottom>
            Dig Deeper
          </Typography> */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 2,
            width: '100%'
          }}>
            {questions.map((questionText, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => handleQuestionSubmit(questionText)}
                disabled={isExplaining}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  textTransform: 'none',
                  borderColor: theme.palette.primary.light,
                  color: theme.palette.text.primary,
                  margin: '1px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '.75rem',
                  color: theme.palette.primary.secondary,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.background.paper,
                  }
                }}
              >
                {questionText}
              </Button>
            ))}
          </Box>
        </Box>
      )}
      {childWindow}
    </Box>
  );
};

export default QuestionPanel;