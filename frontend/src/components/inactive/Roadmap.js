import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Link } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const Roadmap = ({ roadmapData, resources }) => {
    const roadmapRef = React.useRef(null);

    React.useEffect(() => {
        if (roadmapData && roadmapRef.current) {
            const navbarHeight = 64;
            const yOffset = -navbarHeight;
            const y = roadmapRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [roadmapData]);

    const parseRoadmapData = (data) => {
        if (!data) return '';

        let stringData = '';

        // Ensure data is a string
        stringData = typeof data === 'string' ? data : JSON.stringify(data);

        // Use regex to extract text inside TextBlock
        const regex = /^\s*\[?TextBlock\(text="([\s\S]*?)"\s*(?:,\s*type='[^']+')?\)\]?\s*$/;

        const match = stringData.match(regex);
        if (match) {
            stringData = match[1];
        }

        // Clean up the formatting and remove unwanted text
        stringData = stringData
            .replace(/^#\s*@[^#\n]+/gm, '')   // Remove header markers like "# @Roadmap.js"
            .replace(/\\n/g, '\n')            // Replace escaped newlines
            .trim();

        return stringData;
    };

    const parsedRoadmapData = parseRoadmapData(roadmapData);

    if (!parsedRoadmapData) {
        return null;
    }

    return (
        <Box ref={roadmapRef} sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Your Learning Roadmap
                </Typography>
                <Box sx={{ pl: 2 }}>
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <Typography variant="h4" gutterBottom>{children}</Typography>,
                            h2: ({ children }) => <Typography variant="h5" gutterBottom>{children}</Typography>,
                            h3: ({ children }) => <Typography variant="h6" gutterBottom>{children}</Typography>,
                            p: ({ children }) => <Typography variant="body1" paragraph>{children}</Typography>,
                            ul: ({ children }) => <Box component="ul" sx={{ pl: 2, mb: 2 }}>{children}</Box>,
                            ol: ({ children }) => <Box component="ol" sx={{ pl: 2, mb: 2 }}>{children}</Box>,
                            li: ({ children }) => <Typography component="li" sx={{ mb: 1 }}>{children}</Typography>,
                            code: ({ inline, children }) =>
                                inline ?
                                    <Typography component="code" sx={{ bgcolor: 'grey.100', p: 0.5, borderRadius: 1 }}>{children}</Typography> :
                                    <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, overflowX: 'auto' }}>
                                        <code>{children}</code>
                                    </Box>
                        }}
                    >
                        {parsedRoadmapData}
                    </ReactMarkdown>
                </Box>
            </Paper>

            {Array.isArray(resources) && resources.length > 0 && (
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Recommended Resources
                    </Typography>
                    <List>
                        {resources.map((resource, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={
                                        resource.url ? (
                                            <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                                                {resource.title || 'Untitled Resource'}
                                            </Link>
                                        ) : (
                                            resource.title || 'Untitled Resource'
                                        )
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default Roadmap;