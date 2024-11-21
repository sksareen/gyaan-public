import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import InteractiveText from './InteractiveText';
import { parseTextBlock } from '../utils';

const ModuleContent = ({ moduleData }) => {
  const parseContent = (content) => {
    if (!content) return '';

    // Handle different input types
    let textContent = content;

    // Case 1: TextBlock object
    if (typeof content === 'object' && content.text) {
      textContent = parseTextBlock(content);
    }

    // Case 2: String containing TextBlock representation
    if (typeof textContent === 'string' && textContent.includes('TextBlock(')) {
      // Extract text from TextBlock string representation
      const match = textContent.match(/TextBlock\(text="([^"]+)"/);
      if (match) {
        textContent = match[1];
      }
    }

    // Clean up the formatting
    return textContent
      .replace(/\\n\\n/g, '\n\n') // Replace literal \n\n with actual newlines
      .replace(/\\n/g, '\n') // Replace remaining literal \n with newlines
      .replace(/\\"/g, '"') // Replace escaped quotes
      .replace(/\\\\/g, '\\') // Replace escaped backslashes
      .trim();
  };

  const {
    topic,
    firstPrinciples: rawFirstPrinciples,
    keyInformation: rawKeyInformation,
    practiceExercise: rawPracticeExercise,
  } = moduleData || {};

  const firstPrinciples = parseContent(rawFirstPrinciples);
  const keyInformation = parseContent(rawKeyInformation);
  const practiceExercise = parseContent(rawPracticeExercise);

  // Get topic from the correct location in moduleData
  const moduleTopic = moduleData?.topic || '';

  if (!moduleData) {
    return null;
  }

  // Custom renderers for ReactMarkdown
  const renderers = {
    // Wrap paragraphs with InteractiveText
    p: ({ node, children }) => (
      <Typography variant="body1" paragraph>
        <InteractiveText topic={moduleTopic}>{children}</InteractiveText>
      </Typography>
    ),
    // Wrap list items with InteractiveText
    li: ({ node, children }) => (
      <Typography component="li" sx={{ mb: 1 }}>
        <InteractiveText topic={moduleTopic}>{children}</InteractiveText>
      </Typography>
    ),
    // Wrap headings with InteractiveText
    h1: ({ node, children }) => (
      <Typography variant="h4" gutterBottom>
        <InteractiveText topic={moduleTopic}>{children}</InteractiveText>
      </Typography>
    ),
    h2: ({ node, children }) => (
      <Typography variant="h5" gutterBottom>
        <InteractiveText topic={moduleTopic}>{children}</InteractiveText>
      </Typography>
    ),
    h3: ({ node, children }) => (
      <Typography variant="h6" gutterBottom>
        <InteractiveText topic={moduleTopic}>{children}</InteractiveText>
      </Typography>
    ),
    // Code blocks and inline code can remain the same
    code: ({ inline, node, children, ...props }) =>
      inline ? (
        <Typography
          component="code"
          sx={{ bgcolor: 'grey.100', p: 0.5, borderRadius: 1 }}
        >
          {children}
        </Typography>
      ) : (
        <Box
          component="pre"
          sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflowX: 'auto',
          }}
        >
          <code>{children}</code>
        </Box>
      ),
    // You can add more renderers if needed
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          First Principles
        </Typography>
        <Box sx={{ pl: 2 }}>
          <ReactMarkdown components={renderers}>
            {firstPrinciples}
          </ReactMarkdown>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Key Information
        </Typography>
        <Box sx={{ pl: 2 }}>
          <ReactMarkdown components={renderers}>
            {keyInformation}
          </ReactMarkdown>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Practice Exercise
        </Typography>
        <Box sx={{ pl: 2 }}>
          <ReactMarkdown components={renderers}>
            {practiceExercise}
          </ReactMarkdown>
        </Box>
      </Paper>
    </Box>
  );
};

export default ModuleContent;