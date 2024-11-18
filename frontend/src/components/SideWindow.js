import React, { useState, useEffect } from 'react';
import { Box, Drawer, Typography, CircularProgress, TextField, Button, IconButton, List, ListItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InteractiveText from './InteractiveText';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { generateQuestions } from '../services/api';

const SideWindow = ({
  open,
  onClose,
  title,
  content,
  question,
  setQuestion,
  onQuestionSubmit,
  isLoading,
  isProcessing,
  children,
  level = 0,
  topic,
}) => {
  const [isSaved, setIsSaved] = React.useState(false);
  const [questions, setQuestions] = useState([]);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (!content || !topic) return;
    const savedExplanations = JSON.parse(localStorage.getItem(`explanations-${topic}`) || '[]');
    setIsSaved(savedExplanations.some(item => item.content === content));
  }, [content, topic]);

  const handleSave = () => {
    if (!content || !topic) return;
    
    const savedExplanations = JSON.parse(localStorage.getItem(`explanations-${topic}`) || '[]');
    
    if (isSaved) {
      const filtered = savedExplanations.filter(item => item.content !== content);
      localStorage.setItem(`explanations-${topic}`, JSON.stringify(filtered));
      setIsSaved(false);
    } else {
      const newSavedItem = {
        selectedText: title.replace('Digging deeper into: "', '').replace('"', ''),
        question,
        content,
        timestamp: new Date().toISOString(),
      };
      savedExplanations.push(newSavedItem);
      localStorage.setItem(`explanations-${topic}`, JSON.stringify(savedExplanations));
      setIsSaved(true);
    }
  };

  const fetchQuestions = async (text) => {
    if (text.length < 50) return;
    
    setIsFetchingQuestions(true);
    setError(null);
    try {
      const response = await generateQuestions(text);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to generate questions');
      setQuestions([]);
    } finally {
      setIsFetchingQuestions(false);
    }
  };

  useEffect(() => {
    if (content) {
      fetchQuestions(content);
    }
  }, [content]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '10%',
          minWidth: 450,
          maxWidth: 600,
          right: `${level * 7}%`,
          p: 2,
          borderRight: '4px solid #000',
        },
      }}
    >
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography fontWeight="bold" lineHeight={1.3} fontStyle="italic" gutterBottom sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton onClick={handleSave} sx={{ mr: 1 }}>
            {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ my: 2 }}>
            {content ? (
              <InteractiveText topic={topic} level={level + 1}>
                {content}
              </InteractiveText>
            ) : (
              children
            )}

            {!isLoading && content && (
              <Box sx={{ my: 2 }}>
                <InteractiveText topic={topic} level={level + 1}>
                  {content}
                </InteractiveText>
                
                {isFetchingQuestions ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2">Generating questions...</Typography>
                  </Box>
                ) : error ? (
                  <Typography color="error" sx={{ mt: 4 }}>
                    {error}
                  </Typography>
                ) : questions.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Quiz Questions
                    </Typography>
                    <List>
                      {questions.map((questionText, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                          <Typography variant="body1">
                            {index + 1}. {questionText}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Ask a question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onQuestionSubmit()}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={onQuestionSubmit}
            disabled={isProcessing || !question.trim()}
            endIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            Ask
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideWindow;