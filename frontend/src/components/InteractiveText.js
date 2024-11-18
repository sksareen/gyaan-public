import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';
import SideWindow from './SideWindow';

const InteractiveText = ({ children, topic, level = 0 }) => {
  const [selectedText, setSelectedText] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedText, setProcessedText] = useState([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const effectiveTopic = topic || 'default topic';

  useEffect(() => {
    const text = children?.toString() || '';
    setProcessedText(text.split(/(?<=\.|\?|\!|\:|\-)(?:\s+|\n)/m ).filter(s => s.trim()));
  }, [children]);

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
    if (!effectiveTopic) {
      throw new Error('Cannot explain text: topic prop is missing');
    }
    const data = await explainSentence(text, effectiveTopic);
    return formatMarkdownText(data.explanation);
  };

  const handleTextInteraction = async (event, text) => {
    event.stopPropagation();
    
    let finalText = text;
    if (event.shiftKey) {
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (range) {
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
    if (!userQuestion.trim()) return;
    
    setIsProcessing(true);
    setSelectedText(userQuestion);
    try {
      const explanation = await explainSentence(userQuestion, effectiveTopic);
      setExplanation(formatMarkdownText(explanation.explanation));
    } catch (error) {
      setExplanation('Sorry, there was an error getting the explanation.');
    } finally {
      setIsProcessing(false);
    }
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

      <SideWindow
        open={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false);
          setSelectedText(null);
          setUserQuestion('');
        }}
        title={selectedText ? `Digging deeper into: "${selectedText}"` : 'Ask a question'}
        content={explanation}
        question={userQuestion}
        setQuestion={setUserQuestion}
        onQuestionSubmit={handleQuestionSubmit}
        isLoading={loading}
        isProcessing={isProcessing}
        level={level}
        topic={effectiveTopic}
      />
    </Box>
  );
};

export default InteractiveText;