import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';
import SideWindow from './SideWindow';

const InteractiveText = ({ children, topic, level = 0 }) => {
  const [selectedText, setSelectedText] = useState('');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAskButton, setShowAskButton] = useState(false);

  const effectiveTopic = topic || 'default topic';

  // Function to handle text selection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText) {
      setSelectedText(selectedText);
      setShowAskButton(true);
    } else {
      setShowAskButton(false);
    }
  };

  // Function to handle key presses
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && selectedText) {
      setUserQuestion(selectedText);
      handleQuestionSubmit();
    }
  };

  useEffect(() => {
    // Add event listeners for mouseup and keydown
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyPress);

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedText]);

  const fetchExplanation = async (text) => {
    if (!effectiveTopic) {
      throw new Error('Cannot explain text: topic prop is missing');
    }
    const data = await explainSentence(text, effectiveTopic);
    return formatMarkdownText(data.explanation);
  };

  const handleAskAboutSelection = async () => {
    if (!selectedText.trim()) return;
    
    setIsSidePanelOpen(true);
    setLoading(true);
    
    try {
      const explanation = await fetchExplanation(selectedText);
      setExplanation(explanation);
      setUserQuestion(selectedText);
    } catch (error) {
      console.error('Error:', error);
      setExplanation('Failed to fetch explanation. Please try again.');
    } finally {
      setLoading(false);
      setShowAskButton(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!userQuestion.trim()) return;
    
    setIsProcessing(true);
    setSelectedText(userQuestion);
    try {
      const explanation = await explainSentence(userQuestion, effectiveTopic);
      setExplanation(formatMarkdownText(explanation.explanation));
      setIsSidePanelOpen(true);
    } catch (error) {
      setExplanation('Sorry, there was an error getting the explanation.');
    } finally {
      setIsProcessing(false);
      setShowAskButton(false);
    }
  };

  return (
    <Box component="span" onMouseUp={handleMouseUp}>
      {children}
      
      {showAskButton && (
        <Button
          variant="contained"
          size="small"
          startIcon={<HelpOutlineIcon />}
          onClick={handleAskAboutSelection}
          sx={{
            position: 'fixed',
            bottom: '100px',
            right: '40px',
            zIndex: 1000,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Ask about selection
        </Button>
      )}

      <SideWindow
        open={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false);
          setSelectedText('');
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