import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, TextField, Paper, IconButton, Drawer } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import InteractiveText from './InteractiveText';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';
import remarkGfm from 'remark-gfm';

const MiniModuleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userQuestion, setUserQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const components = {
    p: ({ children }) => (
      <Typography 
        component="p" 
        sx={{ mb: 2 }}
      >
        <InteractiveText topic={moduleData?.topic}>{children}</InteractiveText>
      </Typography>
    ),
    
    ul: ({ children }) => (
      <Box component="ul" sx={{ pl: 2, mb: 2 }}>
        {children}
      </Box>
    ),
    
    ol: ({ children }) => (
      <Box component="ol" sx={{ pl: 2, mb: 2 }}>
        <InteractiveText topic={moduleData?.topic}>{children}</InteractiveText>
      </Box>
    ),
    
    li: ({ children }) => {
      const processChildren = (children) => {
        return React.Children.map(children, child => {
          if (typeof child === 'string') return child;
          if (React.isValidElement(child)) {
            return child.props.children;
          }
          return '';
        }).join('');
      };

      return (
        <Typography component="li" sx={{ mb: 1 }}>
          <InteractiveText topic={moduleData?.topic}>
            {processChildren(children)}
          </InteractiveText>
        </Typography>
      );
    },
    
    h1: ({ children }) => (
      <Typography variant="h4" sx={{ mb: 2 }}>
        <InteractiveText topic={moduleData?.topic}>{children}</InteractiveText>
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h5" sx={{ mb: 2 }}>
        <InteractiveText topic={moduleData?.topic}>{children}</InteractiveText>
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="h6" sx={{ mb: 2 }}>
        <InteractiveText topic={moduleData?.topic}>{children}</InteractiveText>
      </Typography>
    ),
    
    strong: ({ children }) => (
      <Box component="strong" sx={{ fontWeight: 'bold' }}>
        <InteractiveText topic={moduleData?.topic}>{children}</InteractiveText>
      </Box>
    ),
  };

  const handleExplainSentence = async () => {
    try {
        setIsDrawerOpen(true);
        const data = await explainSentence(userQuestion, moduleData?.topic || '');
        if (data.explanation) {
            const formattedExplanation = formatMarkdownText(data.explanation);
            setExplanation(formattedExplanation);
        }
    } catch (error) {
        console.error('Error getting explanation:', error);
        setExplanation('Sorry, there was an error getting the explanation. Please try again.');
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setExplanation('');
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

  // console.log('Content before rendering:', formatMarkdownText(moduleData.content.description));

  return (
    <>
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          {/* <Typography variant="h4" gutterBottom>{moduleData.topic}</Typography> */}
          
          <Box mb={3}>
            {/* <Typography variant="h6" gutterBottom>Overview</Typography> */}
            <ReactMarkdown
              components={components}
              remarkPlugins={[remarkGfm]}
            >
              {formatMarkdownText(moduleData.content.description)}
            </ReactMarkdown>
          </Box>
          
          <Box mb={3}>
            {/* <Typography variant="h6" gutterBottom>First Principles</Typography> */}
            <ReactMarkdown
              components={components}
              remarkPlugins={[remarkGfm]}
            >
              {formatMarkdownText(moduleData.content.fundamentals)}
            </ReactMarkdown>
          </Box>

          <Box mb={3}>
            {/* <Typography variant="h6" gutterBottom>Key Concepts</Typography> */}
            <ReactMarkdown
              components={components}
              remarkPlugins={[remarkGfm]}
            >
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
          </Box>

        </Box>
      </Container>
      
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '40%',
            minWidth: 350,
            maxWidth: 600,
            p: 2,
            right: 0,
          }
        }}
      >
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>{userQuestion}</Typography>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
          >
            {formatMarkdownText(explanation)}
          </ReactMarkdown>
          
        </Box>
      </Drawer>
    </>
  );
};

export default MiniModuleView;