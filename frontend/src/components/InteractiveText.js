import React, { useState, useEffect } from 'react';
import { Box, Drawer, Typography, CircularProgress, TextField, Button } from '@mui/material';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const InteractiveText = ({ children, topic, level = 0 }) => {
  const [selectedText, setSelectedText] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedText, setProcessedText] = useState([]);
  const [question, setQuestion] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const text = children?.toString() || '';
    setProcessedText(text.split(/(?<=\.|\?|\!)(?:\s+|\n)/m).filter(s => s.trim()));
  }, [children]);

  // Add shift key detection
  useEffect(() => {
    const handleKeyDown = (e) => setIsShiftPressed(e.shiftKey);
    const handleKeyUp = (e) => setIsShiftPressed(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const fetchExplanation = async (text) => {
    if (!topic) throw new Error('Topic is required');
    const data = await explainSentence(text, topic);
    return formatMarkdownText(data.explanation);
  };

  const handleTextInteraction = async (event, text) => {
    event.stopPropagation();
    
    let finalText = text;
    if (event.shiftKey) {
      // Get the word under the cursor when shift is pressed
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (range) {
        // Expand selection to word boundaries
        range.expand('word');
        finalText = range.toString().trim();
      }
    }
    
    if (!finalText.trim()) return;
    
    setSelectedText(finalText);
    setIsSidePanelOpen(true);
    setLoading(true);
    
    try {
      const explanation = await fetchExplanation(finalText);
      setExplanation(explanation);
    } catch (error) {
      console.error('Error:', error);
      setExplanation('Failed to fetch explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim()) return;
    
    setIsExplaining(true);
    try {
      const explanation = await fetchExplanation(question);
      setExplanation(explanation);
    } catch (error) {
      setExplanation('Sorry, there was an error getting the explanation.');
    } finally {
      setIsExplaining(false);
    }
  };

  // Simplified markdown components
  const markdownComponents = {
    p: ({ children }) => (
      <Typography paragraph>
        <InteractiveText topic={topic} level={level + 1}>{children}</InteractiveText>
      </Typography>
    ),
    li: ({ children }) => (
      <Typography component="li" sx={{ mb: 1 }}>
        <InteractiveText topic={topic} level={level + 1}>{children}</InteractiveText>
      </Typography>
    ),
    strong: ({ children }) => (
      <Box component="strong" sx={{ fontWeight: 'bold' }}>
        <InteractiveText topic={topic} level={level + 1}>{children}</InteractiveText>
      </Box>
    ),
  };

  const resetPanel = () => {
    setIsSidePanelOpen(false);
    setSelectedText(null);
    setExplanation('');
    setQuestion('');
  };

  return (
    <Box component="span">
      {processedText.map((sentence, index) => (
        <Box
          key={index}
          component="span"
          onClick={(e) => handleTextInteraction(e, sentence)}
          sx={{
            cursor: 'pointer',
            userSelect: 'text',
            ...(isShiftPressed ? {} : {
              '&:hover': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'light' 
                    ? 'rgba(173, 216, 230, 0.4)'
                    : 'rgba(173, 216, 230, 0.2)',
                borderRadius: '4px',
              }
            })
          }}
        >
          {sentence.split(' ').map((word, wordIndex) => (
            <Box
              key={wordIndex}
              component="span"
              sx={{
                padding: '0 2px',
                borderRadius: '2px',
                ...(isShiftPressed && {
                  '&:hover': {
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'light' 
                        ? 'rgba(173, 216, 230, 0.4)'
                        : 'rgba(173, 216, 230, 0.2)',
                  }
                })
              }}
            >
              {word + ' '}
            </Box>
          ))}
        </Box>
      ))}

      <Drawer
        anchor="right"
        open={isSidePanelOpen}
        onClose={resetPanel}
        sx={{
          '& .MuiDrawer-paper': {
            width: '10%',
            minWidth: 350,
            maxWidth: 600,
            right: `${level * 7}%`,
            p: 2,
            borderRight: '4px solid #000',
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
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ my: 2 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {explanation}
                  </ReactMarkdown>
                </Box>
              )}

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
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default InteractiveText;