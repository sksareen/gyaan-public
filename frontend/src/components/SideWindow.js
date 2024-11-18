import React from 'react';
import { Box, Drawer, Typography, CircularProgress, TextField, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InteractiveText from './InteractiveText';

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
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
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