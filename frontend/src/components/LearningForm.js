import React, { useState } from 'react';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Container,
    Box,
    Typography
} from '@mui/material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import theme from './Theme';
import { generateGoals } from '../services/api';

const LearningForm = ({ onSubmit }) => {
    const [topic, setTopic] = useState('');
    const [proficiency, setProficiency] = useState('beginner');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [background, setBackground] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await onSubmit(topic.trim(), proficiency);
            setTimeout(() => {
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            }, 100);
        } catch (err) {
            setError(err.message || 'Failed to generate learning goals. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const theme = useTheme();

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm">
                <Box sx={{ mt: 4, mb: 4 }}>
                    <Typography variant="h2" component="h1" gutterBottom align="center">
                        Gyaan Learning
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="What do you want to learn?"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            margin="normal"
                            required
                            sx={{ borderRadius: '15px' }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Proficiency Level</InputLabel>
                            <Select
                                value={proficiency}
                                onChange={(e) => setProficiency(e.target.value)}
                                sx={{ borderRadius: '10px' }}
                                label="Proficiency Level"
                            >
                                <MenuItem value="beginner">Beginner</MenuItem>
                                <MenuItem value="intermediate">Intermediate</MenuItem>
                                <MenuItem value="advanced">Advanced</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ 
                                borderRadius: '15px', 
                                mt: 2,
                                boxShadow: '0px 2px 8px -3px #00000080',
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.background.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.secondary.main,
                                    transform: 'translateY(-1px)',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? 'Creating Your Path...' : 'Start Your Learning Journey'}
                        </Button>
                        {error && (
                            <Typography color="error" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}
                    </form>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default LearningForm;