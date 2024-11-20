import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';
import SideWindow from './SideWindow';

// Function to split text into sentences
const splitTextIntoSentences = (text) => {
  // Regex to split text into sentences
  return text.match(/[^.!?]*[.!?]/g) || [text];
};

const InteractiveText = ({ children, topic, level = 0 }) => {
  const [selectedText, setSelectedText] = useState('');
  const [explainedText, setExplainedText] = useState('');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAskButton, setShowAskButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [hoveredSentenceIndex, setHoveredSentenceIndex] = useState(null);

  const effectiveTopic = topic || 'default topic';

  // Function to handle text selection
  const handleMouseUp = (event) => {
    // Delay execution to ensure selection is updated
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText) {
        setSelectedText(selectedText);
        setShowAskButton(true);
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setButtonPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      } else {
        setSelectedText('');
        setShowAskButton(false);
      }
    }, 0);
  };

  // Function to handle key presses
  const handleKeyDown = (e) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(true);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(false);
      setHoveredSentenceIndex(null);
    }
    if (e.key === 'Enter' && selectedText && !isSidePanelOpen) {
      e.preventDefault();
      handleAskAboutSelection();
    }
  };

  useEffect(() => {
    // Add event listeners once on component mount
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      // Clean up event listeners on component unmount
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // Empty dependency array to run only once

  const fetchExplanation = async (text) => {
    if (!effectiveTopic) {
      throw new Error('Cannot explain text: topic prop is missing.');
    }
    try {
      const data = await explainSentence(text, effectiveTopic);
      return formatMarkdownText(data.explanation);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      throw new Error('Failed to fetch explanation. Please try again.');
    }
  };

  const handleAskAboutSelection = async (text = selectedText) => {
    if (!text.trim()) return;

    setExplainedText(text.trim());
    setIsSidePanelOpen(true);
    setLoading(true);
    setUserQuestion(''); // Clear previous question

    try {
      const explanation = await fetchExplanation(text);
      setExplanation(explanation);
    } catch (error) {
      console.error('Error:', error);
      setExplanation('Failed to fetch explanation. Please try again.');
    } finally {
      setLoading(false);
      setShowAskButton(false);
      // Clear the text selection
      window.getSelection().removeAllRanges();
      setSelectedText('');
    }
  };

  const handleQuestionSubmit = async () => {
    if (!userQuestion.trim()) return;

    setIsProcessing(true);
    setSelectedText(userQuestion);
    setExplainedText(userQuestion.trim());
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

  // Handle sentence click
  const handleSentenceClick = async (sentence) => {
    if (isShiftPressed) {
      setSelectedText(sentence.trim());
      await handleAskAboutSelection(sentence.trim());

      // Clear the text selection
      window.getSelection().removeAllRanges();
    }
  };

  const renderTextWithSentences = (text) => {
    const sentences = splitTextIntoSentences(text);
    return sentences.map((sentence, index) => (
      <span
        key={index}
        onClick={() => handleSentenceClick(sentence)}
        onMouseEnter={() => isShiftPressed && setHoveredSentenceIndex(index)}
        onMouseLeave={() => setHoveredSentenceIndex(null)}
        style={{
          backgroundColor:
            isShiftPressed && hoveredSentenceIndex === index ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
          cursor: isShiftPressed ? 'pointer' : 'default',
        }}
      >
        {sentence}
      </span>
    ));
  };

  return (
    <Box
      component="span"
      style={{ cursor: isShiftPressed ? 'pointer' : 'default' }}
    >
      {typeof children === 'string'
        ? renderTextWithSentences(children)
        : React.Children.map(children, (child) => {
            if (typeof child === 'string') {
              return renderTextWithSentences(child);
            } else {
              return child;
            }
          })}

      {showAskButton && (
        <Button
          variant="contained"
          size="small"
          startIcon={<HelpOutlineIcon />}
          onClick={() => handleAskAboutSelection()}
          sx={{
            position: 'fixed',
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
            transform: 'translateY(8px)', // Small offset from the text
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
          // Clear the text selection
          window.getSelection().removeAllRanges();
        }}
        title={explainedText ? `"${explainedText}"` : 'Ask a question'}
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