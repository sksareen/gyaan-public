import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    Paper,
    IconButton,
    Button,
    Divider,
    Link,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const SavedView = () => {
    const [savedExplanations, setSavedExplanations] = useState({});
    const [savedExamples, setSavedExamples] = useState({});
    const [moduleIds, setModuleIds] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        // Get module IDs from savedModules
        const savedModules = JSON.parse(localStorage.getItem('savedModules') || '[]');
        const topicToId = {};
        savedModules.forEach(module => {
            topicToId[module.topic] = module.id;
        });
        setModuleIds(topicToId);

        // Get all localStorage keys
        const allKeys = Object.keys(localStorage);
        
        // Filter for explanation and example keys
        const explanationKeys = allKeys.filter(key => key.startsWith('explanations-'));
        const exampleKeys = allKeys.filter(key => key.startsWith('examples-'));
        
        // Build explanations object
        const explanations = {};
        explanationKeys.forEach(key => {
            const topic = key.replace('explanations-', '');
            try {
                const topicExplanations = JSON.parse(localStorage.getItem(key) || '[]');
                if (topicExplanations.length > 0) {
                    explanations[topic] = topicExplanations;
                }
            } catch (error) {
                console.error(`Error parsing explanations for ${topic}:`, error);
            }
        });
        
        // Build examples object
        const examples = {};
        exampleKeys.forEach(key => {
            const topic = key.replace('examples-', '');
            try {
                const topicExamples = JSON.parse(localStorage.getItem(key) || '[]');
                if (topicExamples.length > 0) {
                    examples[topic] = topicExamples;
                }
            } catch (error) {
                console.error(`Error parsing examples for ${topic}:`, error);
            }
        });
        
        setSavedExplanations(explanations);
        setSavedExamples(examples);
    }, []);

    const handleDelete = (topic, timestamp) => {
        const topicKey = `explanations-${topic}`;
        const explanations = JSON.parse(localStorage.getItem(topicKey) || '[]');
        const updatedExplanations = explanations.filter(exp => exp.timestamp !== timestamp);
        
        if (updatedExplanations.length === 0) {
            localStorage.removeItem(topicKey);
            const newSavedExplanations = { ...savedExplanations };
            delete newSavedExplanations[topic];
            setSavedExplanations(newSavedExplanations);
        } else {
            localStorage.setItem(topicKey, JSON.stringify(updatedExplanations));
            setSavedExplanations(prev => ({
                ...prev,
                [topic]: updatedExplanations
            }));
        }
    };

    const handleDeleteExample = (topic, timestamp) => {
        const topicKey = `examples-${topic}`;
        const examples = JSON.parse(localStorage.getItem(topicKey) || '[]');
        const updatedExamples = examples.filter(ex => ex.timestamp !== timestamp);
        
        if (updatedExamples.length === 0) {
            localStorage.removeItem(topicKey);
            const newSavedExamples = { ...savedExamples };
            delete newSavedExamples[topic];
            setSavedExamples(newSavedExamples);
        } else {
            localStorage.setItem(topicKey, JSON.stringify(updatedExamples));
            setSavedExamples(prev => ({
                ...prev,
                [topic]: updatedExamples
            }));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h3" gutterBottom align="center">
                    Saved Explanations
                </Typography>

                {Object.keys(savedExplanations).length === 0 ? (
                    <Box sx={{ 
                        mt: 4, 
                        p: 4, 
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 1
                    }}>
                        <Typography variant="h6" color="text.secondary">
                            No saved explanations yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            Your saved explanations from mini-modules will appear here
                        </Typography>
                    </Box>
                ) : (
                    Object.entries(savedExplanations).map(([topic, explanations]) => (
                        <Box key={topic} sx={{ mb: 4 }}>
                            <Link
                                component="button"
                                onClick={() => navigate(`/mini-module/${moduleIds[topic]}`)}
                                underline="none"
                                sx={{ display: 'block' }}
                                disabled={!moduleIds[topic]}
                            >
                                <Typography 
                                    variant="h4" 
                                    gutterBottom 
                                    sx={{ 
                                        color: moduleIds[topic] ? 'primary.main' : 'text.disabled',
                                        '&:hover': {
                                            opacity: moduleIds[topic] ? 0.8 : 1,
                                        },
                                    }}
                                >
                                    {topic}
                                </Typography>
                            </Link>
                            {explanations.map((explanation, index) => (
                                <Paper 
                                    key={explanation.timestamp} 
                                    sx={{ 
                                        p: 3, 
                                        mb: 2,
                                        '&:hover': {
                                            boxShadow: 3,
                                            transition: 'box-shadow 0.2s'
                                        }
                                    }}
                                >
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 2
                                    }}>
                                        <Typography variant="h5" color="text.secondary">
                                            Question: {explanation.selectedText}
                                        </Typography>
                                        <IconButton 
                                            onClick={() => handleDelete(topic, explanation.timestamp)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ my: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            <ReactMarkdown>
                                                {explanation.content.slice(0, 200) + '...'}
                                            </ReactMarkdown>
                                        </Typography>
                                    </Box>

                                    <Typography variant="caption" color="text.secondary">
                                        Saved on: {formatDate(explanation.timestamp)}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    ))
                )}

                <Typography variant="h3" gutterBottom align="center" sx={{ mt: 6 }}>
                    Saved Examples
                </Typography>

                {Object.keys(savedExamples).length === 0 ? (
                    <Box sx={{ 
                        mt: 4, 
                        p: 4, 
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 1
                    }}>
                        <Typography variant="h6" color="text.secondary">
                            No saved examples yet
                        </Typography>
                    </Box>
                ) : (
                    Object.entries(savedExamples).map(([topic, examples]) => (
                        <Box key={topic} sx={{ mb: 4 }}>
                            <Typography variant="h4" gutterBottom>
                                {topic}
                            </Typography>
                            {examples.map((example) => (
                                <Paper 
                                    key={example.timestamp} 
                                    sx={{ p: 3, mb: 2 }}
                                >
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 2
                                    }}>
                                        <Typography variant="h6">
                                            {example.text}
                                        </Typography>
                                        <IconButton 
                                            onClick={() => handleDeleteExample(topic, example.timestamp)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                    
                                    <Typography variant="body1">
                                        {example.description}
                                    </Typography>

                                    {example.citations && example.citations.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2">Sources:</Typography>
                                            {example.citations.map((citation, index) => (
                                                <Link 
                                                    key={index}
                                                    href={citation.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{ mr: 2 }}
                                                >
                                                    {citation.text}
                                                </Link>
                                            ))}
                                        </Box>
                                    )}
                                    
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                        Saved on: {formatDate(example.timestamp)}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    ))
                )}
            </Box>
        </Container>
    );
};

export default SavedView;