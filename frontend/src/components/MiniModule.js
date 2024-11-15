import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  CircularProgress 
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import InteractiveText from './InteractiveText';

const MiniModule = ({ open, onClose, title, content }) => {
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MiniModule;