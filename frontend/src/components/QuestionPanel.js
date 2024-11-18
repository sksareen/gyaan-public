import React, { useState } from 'react';
import { Box, Typography, CircularProgress, TextField, Button } from '@mui/material';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';

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
      <TextField
        fullWidth
        variant="outlined"
        label="Ask a question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleQuestionSubmit}
        disabled={isExplaining || !question.trim()}
        endIcon={isExplaining ? <CircularProgress size={20} /> : null}
      >
        Ask
      </Button>
    </Box>
  );
};

export default QuestionPanel;