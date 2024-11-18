import React from 'react';
import { Box, Drawer, Typography, CircularProgress, TextField, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InteractiveText from './InteractiveText';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

const SideWindow = ({
  open,
  onClose,
  title,
  content,
  question,
  setQuestion,
  onQuestionSubmit,
  isLoading,
  isProcessing,
  children,
  level = 0,
  topic,
}) => {
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    if (!content || !topic) return;
    const savedExplanations = JSON.parse(localStorage.getItem(`explanations-${topic}`) || '[]');
    setIsSaved(savedExplanations.some(item => item.content === content));
  }, [content, topic]);

  const handleSave = () => {
    if (!content || !topic) return;
    
    const savedExplanations = JSON.parse(localStorage.getItem(`explanations-${topic}`) || '[]');
    
    if (isSaved) {
      const filtered = savedExplanations.filter(item => item.content !== content);
      localStorage.setItem(`explanations-${topic}`, JSON.stringify(filtered));
      setIsSaved(false);
    } else {
      const newSavedItem = {
        selectedText: title.replace('Digging deeper into: "', '').replace('"', ''),
        question,
        content,
        timestamp: new Date().toISOString(),
      };
      savedExplanations.push(newSavedItem);
      localStorage.setItem(`explanations-${topic}`, JSON.stringify(savedExplanations));
      setIsSaved(true);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '10%',
          minWidth: 450,
          maxWidth: 600,
          right: `${level * 7}%`,
          p: 2,
          borderRight: '4px solid #000',
        },
      }}
    >
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography fontWeight="bold" lineHeight={1.3} fontStyle="italic" gutterBottom sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton onClick={handleSave} sx={{ mr: 1 }}>
            {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ my: 2 }}>
            {content ? (
              <InteractiveText topic={topic} level={level + 1}>
                {content}
              </InteractiveText>
            ) : (
              children
            )}
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Ask a question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onQuestionSubmit()}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={onQuestionSubmit}
            disabled={isProcessing || !question.trim()}
            endIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            Ask
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideWindow;