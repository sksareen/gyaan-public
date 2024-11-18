import React, { useState } from 'react';
import { Box, Typography, CircularProgress, TextField, Button } from '@mui/material';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';
import theme from './Theme';

const QuestionPanel = ({ topic, onExplanationReceived }) => {
  const [question, setQuestion] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  const handleQuestionSubmit = async () => {
    if (!question.trim()) return;
    
    setIsExplaining(true);
    try {
      const explanation = await explainSentence(question, topic);
      onExplanationReceived(formatMarkdownText(explanation.explanation));
    } catch (error) {
      onExplanationReceived('Sorry, there was an error getting the explanation.');
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Ask a question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
        />
        <Button
          variant="contained"
          onClick={handleQuestionSubmit}
          disabled={isExplaining || !question.trim()}
          endIcon={isExplaining ? <CircularProgress size={20} /> : null}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.main,
            '&:hover': {
              backgroundColor: theme.palette.secondary.main,
            }
          }}
        >
          Ask
        </Button>
      </Box>
    </Box>
  );
};

export default QuestionPanel;