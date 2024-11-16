import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, TextField, Paper, IconButton } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import InteractiveText from './InteractiveText';
import SendIcon from '@mui/icons-material/Send';
import { API_URL } from '../services/api';

const MiniModuleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userQuestion, setUserQuestion] = useState('');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    const fetchModule = async () => {
      setLoading(true);
      try {
        const savedModules = JSON.parse(localStorage.getItem('savedModules') || '[]');
        const module = savedModules.find(m => m.id === parseInt(id));
        if (module) {
          setModuleData(module);
        }
      } catch (error) {
        console.error('Error loading module:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [id]);

  // Format markdown text using the same function from MiniModule component
  const formatMarkdownText = (text) => {
    if (!text) return '';
    
    text = typeof text === 'string' ? text : JSON.stringify(text);
    
    const regex = /^\s*\[?TextBlock\(text="([\s\S]*?)"\s*(?:,\s*type='[^']+')?\)\]?\s*$/;
    const match = text.match(regex);
    if (match) {
      text = match[1];
    }

    return text
      .replace(/\\n/g, '\n')
      .replace(/^#\s*@[^#\n]+/gm, '')
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  const components = {
    p: ({children}) => (
      <InteractiveText topic={moduleData?.topic}>
        {children}
      </InteractiveText>
    )
  };

  const handleExplainSentence = async () => {
    try {
        const response = await fetch(`${API_URL}/api/explain-sentence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sentence: userQuestion,
                topic: moduleData?.topic || ''
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.explanation) {
            setExplanation(data.explanation);
        }
    } catch (error) {
        console.error('Error getting explanation:', error);
        setExplanation('Sorry, there was an error getting the explanation. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!moduleData) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5" sx={{ mt: 4 }}>Module not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {/* <Typography variant="h4" gutterBottom>{moduleData.topic}</Typography> */}
        
        <Box mb={3}>
          {/* <Typography variant="h6" gutterBottom>Overview</Typography> */}
          <ReactMarkdown components={components}>
            {formatMarkdownText(moduleData.content.description)}
          </ReactMarkdown>
        </Box>
        
        <Box mb={3}>
          {/* <Typography variant="h6" gutterBottom>First Principles</Typography> */}
          <ReactMarkdown components={components}>
            {formatMarkdownText(moduleData.content.fundamentals)}
          </ReactMarkdown>
        </Box>

        <Box mb={3}>
          {/* <Typography variant="h6" gutterBottom>Key Concepts</Typography> */}
          <ReactMarkdown components={components}>
            {formatMarkdownText(moduleData.content.summary)}
          </ReactMarkdown>
        </Box>

        <Box sx={{ my: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Ask a Question
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Ask about anything in this module"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              variant="outlined"
              size="medium"
            />
            <IconButton 
              color="primary"
              onClick={handleExplainSentence}
              disabled={!userQuestion.trim()}
              sx={{ p: '10px' }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          
          {explanation && (
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography>
                {explanation}
              </Typography>
            </Paper>
          )}
        </Box>

        <Button 
          variant="outlined" 
          onClick={() => navigate('/notebook')}
          sx={{ mb: 4 }}
        >
          Back to Notebook
        </Button>
      </Box>
    </Container>
  );
};

export default MiniModuleView;