import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  CircularProgress,
  TextField,
  IconButton,
  Drawer 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import InteractiveText from './InteractiveText';
import axios from 'axios';

const MiniModule = ({ open, onClose, title, content }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      if (content) {
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [open, content]);

  const handleQuestionSubmit = async () => {
    if (!question.trim()) return;
    
    setIsExplaining(true);
    setIsDrawerOpen(true);
    
    try {
      const response = await axios.post('/api/explain_sentence', {
        sentence: question,
        topic: title
      });
      
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setExplanation('Sorry, there was an error getting the explanation.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setExplanation('');
  };

  // Format markdown text by cleaning up any special characters or formatting
  const formatMarkdownText = (text) => {
    if (!text) return '';
    
    // Ensure text is a string
    text = typeof text === 'string' ? text : JSON.stringify(text);
    
    // Extract text from TextBlock if present
    const regex = /^\s*\[?TextBlock\(text="([\s\S]*?)"\s*(?:,\s*type='[^']+')?\)\]?\s*$/;
    const match = text.match(regex);
    if (match) {
      text = match[1];
    }

    return text
      .replace(/\\n/g, '\n')           // Replace escaped newlines
      .replace(/^#\s*@[^#\n]+/gm, '')  // Remove header markers
      .split('\n')                      // Split into lines
      .map(line => line.replace(/^\d+\.\s*/, '').trim())  // Remove leading numbers and trim
      .filter(line => line.length > 0)  // Remove empty lines
      .join('\n');                      // Rejoin with newlines
  };

  // Custom renderer for ReactMarkdown to wrap paragraphs with InteractiveText
  const components = {
    p: ({children}) => (
      <InteractiveText topic={title}>
        {children}
      </InteractiveText>
    )
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!content) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5">{title}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Overview</Typography>
            <ReactMarkdown components={components}>
              {formatMarkdownText(content.description)}
            </ReactMarkdown>
          </Box>
          
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>First Principles</Typography>
            <ReactMarkdown components={components}>
              {formatMarkdownText(content.fundamentals)}
            </ReactMarkdown>
          </Box>

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Key Concepts</Typography>
            <ReactMarkdown components={components}>
              {formatMarkdownText(content.summary)}
            </ReactMarkdown>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Ask a question about this topic"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
            />
            <IconButton 
              color="primary" 
              onClick={handleQuestionSubmit}
              disabled={!question.trim() || isExplaining}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '40%',
            maxWidth: '600px',
            minWidth: '300px',
            p: 3
          }
        }}
      >
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Explanation
          </Typography>
          
          {isExplaining ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : (
            <ReactMarkdown components={components}>
              {explanation}
            </ReactMarkdown>
          )}
          
          <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Button onClick={handleDrawerClose}>Close</Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default MiniModule;