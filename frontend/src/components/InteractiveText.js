import React, { useState, useEffect } from 'react';
import { Box, Drawer, Typography, CircularProgress, TextField, Button } from '@mui/material';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';

const InteractiveText = ({ children, topic, level = 0 }) => {
  const [selectedText, setSelectedText] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedText, setProcessedText] = useState([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [question, setQuestion] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    // Split text into sentences (improved regex to handle bullet points)
    const text = children?.toString() || '';
    const sentences = text
      .split(/(?<=\.|\?|\!|\•)\s+/)
      .filter(s => s.trim().length > 0);
    setProcessedText(sentences);
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
      // Format the explanation before setting it
      const formattedExplanation = formatMarkdownText(data.explanation);
      setExplanation(formattedExplanation);
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

  const handleQuestionSubmit = async () => {
    if (!question.trim()) return;
    
    setIsExplaining(true);
    
    try {
      const data = await explainSentence(question, topic);
      const formattedExplanation = formatMarkdownText(data.explanation);
      setExplanation(formattedExplanation);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setExplanation('Sorry, there was an error getting the explanation.');
    } finally {
      setIsExplaining(false);
    }
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
              <Typography 
                variant="h6" 
                gutterBottom 
                component="div"
                sx={{
                  whiteSpace: 'pre-wrap',  // Preserve whitespace and line breaks
                  '& .bullet-point': {
                    display: 'block',
                    marginLeft: '1em',
                    '&::before': {
                      content: '"• "',
                      marginLeft: '-1em',
                    }
                  }
                }}
              >
                {selectedText.split('\n').map((line, index) => {
                  const isBulletPoint = line.trim().startsWith('•');
                  return (
                    <React.Fragment key={index}>
                      {isBulletPoint ? (
                        <span className="bullet-point">{line.replace('•', '').trim()}</span>
                      ) : (
                        line
                      )}
                      {index < selectedText.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  );
                })}
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
              <Box sx={{ mt: 4 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Ask a question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleQuestionSubmit();
                    }
                  }}
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