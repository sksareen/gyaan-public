import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
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
            .replace(/\\n\\n/g, '\n\n')    // Replace literal \n\n with actual newlines
            .replace(/\\n/g, '\n')          // Replace remaining literal \n with newlines
            .replace(/\\"/g, '"')           // Replace escaped quotes
            .replace(/\\\\/g, '\\')         // Replace escaped backslashes
            .trim();
    };

    const {
        firstPrinciples: rawFirstPrinciples,
        keyInformation: rawKeyInformation,
        practiceExercise: rawPracticeExercise,
        crossDomainConnections: rawCrossDomainConnections,
        fundamentalTruths: rawFundamentalTruths
    } = moduleData || {};

    const firstPrinciples = parseContent(rawFirstPrinciples);
    const keyInformation = parseContent(rawKeyInformation);
    const practiceExercise = parseContent(rawPracticeExercise);

    if (!moduleData) {
        return null;
    }

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    First Principles
                </Typography>
                <Box sx={{ pl: 2 }}>
                    <ReactMarkdown
                        components={{
                            h1: ({children}) => <Typography variant="h4" gutterBottom>{children}</Typography>,
                            h2: ({children}) => <Typography variant="h5" gutterBottom>{children}</Typography>,
                            h3: ({children}) => <Typography variant="h6" gutterBottom>{children}</Typography>,
                            p: ({children}) => <Typography variant="body1" paragraph>{children}</Typography>,
                            ul: ({children}) => <Box component="ul" sx={{ pl: 2, mb: 2 }}>{children}</Box>,
                            ol: ({children}) => <Box component="ol" sx={{ pl: 2, mb: 2 }}>{children}</Box>,
                            li: ({children}) => <Typography component="li" sx={{ mb: 1 }}>{children}</Typography>,
                            code: ({inline, children}) => 
                                inline ? 
                                    <Typography component="code" sx={{ bgcolor: 'grey.100', p: 0.5, borderRadius: 1 }}>{children}</Typography> :
                                    <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, overflowX: 'auto' }}>
                                        <code>{children}</code>
                                    </Box>
                        }}
                    >
                        {firstPrinciples}
                    </ReactMarkdown>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Key Information
                </Typography>
                <Box sx={{ pl: 2 }}>
                    <ReactMarkdown
                        components={{
                            h1: ({children}) => <Typography variant="h4" gutterBottom>{children}</Typography>,
                            h2: ({children}) => <Typography variant="h5" gutterBottom>{children}</Typography>,
                            h3: ({children}) => <Typography variant="h6" gutterBottom>{children}</Typography>,
                            p: ({children}) => <Typography variant="body1" paragraph>{children}</Typography>,
                            ul: ({children}) => <Box component="ul" sx={{ pl: 2, mb: 2 }}>{children}</Box>,
                            ol: ({children}) => <Box component="ol" sx={{ pl: 2, mb: 2 }}>{children}</Box>,
                            li: ({children}) => <Typography component="li" sx={{ mb: 1 }}>{children}</Typography>,
                            code: ({inline, children}) => 
                                inline ? 
                                    <Typography component="code" sx={{ bgcolor: 'grey.100', p: 0.5, borderRadius: 1 }}>{children}</Typography> :
                                    <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, overflowX: 'auto' }}>
                                        <code>{children}</code>
                                    </Box>
                        }}
                    >
                        {keyInformation}
                    </ReactMarkdown>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Practice Exercise
                </Typography>
                <Box sx={{ pl: 2 }}>
                    <ReactMarkdown
                        components={{
                            h1: ({children}) => <Typography variant="h4" gutterBottom>{children}</Typography>,
                            h2: ({children}) => <Typography variant="h5" gutterBottom>{children}</Typography>,
                            h3: ({children}) => <Typography variant="h6" gutterBottom>{children}</Typography>,
                            p: ({children}) => <Typography variant="body1" paragraph>{children}</Typography>,
                            ul: ({children}) => <Box component="ul" sx={{ pl: 2, mb: 2 }}>{children}</Box>,
                            ol: ({children}) => <Box component="ol" sx={{ pl: 2, mb: 2 }}>{children}</Box>,
                            li: ({children}) => <Typography component="li" sx={{ mb: 1 }}>{children}</Typography>,
                            code: ({inline, children}) => 
                                inline ? 
                                    <Typography component="code" sx={{ bgcolor: 'grey.100', p: 0.5, borderRadius: 1 }}>{children}</Typography> :
                                    <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, overflowX: 'auto' }}>
                                        <code>{children}</code>
                                    </Box>
                        }}
                    >
                        {practiceExercise}
                    </ReactMarkdown>
                </Box>
            </Paper>
        </Box>
    );
};

export default ModuleContent;