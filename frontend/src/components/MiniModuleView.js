import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Paper, IconButton } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import InteractiveText from './InteractiveText';
import { explainSentence } from '../services/api';
import { formatMarkdownText } from '../utils/textFormatting';
import remarkGfm from 'remark-gfm';
import QuestionPanel from './QuestionPanel';
import SideWindow from './SideWindow';

const MiniModuleView = () => {
  const { id } = useParams();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedExplanations, setSavedExplanations] = useState([]);
  const [selectedText, setSelectedText] = useState('');

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

  useEffect(() => {
    if (moduleData?.topic) {
      const saved = JSON.parse(localStorage.getItem(`explanations-${moduleData.topic}`) || '[]');
      setSavedExplanations(saved);
    }
  }, [moduleData?.topic]);

  const components = {
    p: ({ children, ...props }) => {
      // Check if this is the first paragraph in the content
      const isFirstParagraph = props.node?.position?.start?.offset === 0;
      
      if (isFirstParagraph) {
        return (
          <Typography
            variant="h4"
            component="h1" 
            sx={{ p: 0, fontWeight: 'bold', textAlign: 'center' }}
          >
              You're learning: <br></br>
            <Typography 
            variant="h2"
            component="h1" 
            sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}
          >
              {formatMarkdownText(moduleData?.topic.charAt(0).toUpperCase() + moduleData?.topic.slice(1))}
            </Typography>
          </Typography>
        );
      }
      
      return (
        <Typography 
          component="p" 
          sx={{ mb: 2 }}
        >
          <InteractiveText topic={moduleData?.topic}>{children}</InteractiveText>
        </Typography>
      );
    },
    
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
      <Typography variant="h3" component="h1" sx={{ mb: 3, mt: 2, fontWeight: 'bold' }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h4" component="h2" sx={{ mb: 2, mt: 2, fontWeight: 'bold' }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="h5" component="h3" sx={{ mb: 2, mt: 2, fontWeight: 'bold' }}>
        {children}
      </Typography>
    ),
    
    strong: ({ children }) => (
      <Box component="strong" sx={{ fontWeight: 'bold' }}>
        <InteractiveText topic={moduleData?.topic}>{children}</InteractiveText>
      </Box>
    ),
  };

  const handleExplanationReceived = (newExplanation) => {
    setExplanation(newExplanation);
    setIsDrawerOpen(true);
  };

  const handleQuestionSubmit = async () => {
    if (!userQuestion.trim()) return;
    
    setIsProcessing(true);
    try {
      const explanation = await explainSentence(userQuestion, moduleData?.topic);
      handleExplanationReceived(formatMarkdownText(explanation.explanation));
    } catch (error) {
      handleExplanationReceived('Sorry, there was an error getting the explanation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSavedExplanations = () => {
    if (savedExplanations.length === 0) return null;

    return (
      <Box sx={{ my: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Saved Explanations
        </Typography>
        {savedExplanations.map((item, index) => (
          <Paper 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 2, 
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }} 
            onClick={() => {
              setUserQuestion(item.question);
              handleExplanationReceived(item.content);
              setSelectedText(item.selectedText);
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {item.selectedText}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {item.question}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Saved on: {new Date(item.timestamp).toLocaleDateString()}
            </Typography>
          </Paper>
        ))}
      </Box>
    );
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
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* Main Content Section */}
        <Box mb={3}>
          <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
          >
            {formatMarkdownText(moduleData.content.description)}
          </ReactMarkdown>
        </Box>

        {/* Side Window Section */}
        <SideWindow
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedText ? `"${selectedText}"` : 'Ask a question'}
          content={explanation}
          question={userQuestion}
          setQuestion={setUserQuestion}
          onQuestionSubmit={handleQuestionSubmit}
          isLoading={loading}
          isProcessing={isProcessing}
          topic={moduleData?.topic}
        />
        
        {/* Fundamentals Section */}
        <Box mb={3}>
          <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
          >
            {formatMarkdownText(moduleData.content.fundamentals)}
          </ReactMarkdown>
        </Box>

        {/* Key Concepts Section */}
        <Box mb={3}>
          <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
          >
            {formatMarkdownText(moduleData.content.summary)}
          </ReactMarkdown>
        </Box>

        {renderSavedExplanations()}

        <Box sx={{ my: 6, py: 0, bgcolor: 'background.paper', borderRadius: 1 }}>
          <QuestionPanel 
            topic={moduleData?.topic} 
            onExplanationReceived={handleExplanationReceived}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default MiniModuleView;