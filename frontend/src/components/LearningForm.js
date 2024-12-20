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
import { generateMiniModule } from '../services/api';

const LearningForm = ({ onSubmit }) => {
    const [topic, setTopic] = useState('');
    const [proficiency, setProficiency] = useState('beginner');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await generateMiniModule(topic.trim(), proficiency);
            
            const savedModules = JSON.parse(localStorage.getItem('savedModules') || '[]');
            const newModule = {
                id: Date.now(),
                topic: topic.trim(),
                type: 'mini-module',
                content: response,
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('savedModules', JSON.stringify([...savedModules, newModule]));
            
            window.location.href = `/mini-module/${newModule.id}`;
        } catch (err) {
            setError(err.message || 'Failed to generate learning content. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const theme = useTheme();

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '75vh' 
            }}>
                <Box sx={{ mt: 4, mb: 4, minWidth: '320px', width: '100%' }}>
                    <img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="logo" style={{ borderRadius: '50%', height: '140px', width: '140px', marginLeft: 'auto', marginRight: 'auto', display: 'block', margin: '0 auto', marginBottom: '2rem', boxShadow: '2px 0px 7px -3px #00000070' }}/>
                    <Typography variant="h1" component="h1" gutterBottom align="center">
                        Gyaan Learning
                    </Typography>
                    <Typography variant="subtitle1" component="h4" gutterBottom align="center">
                        Start Your Personalized Learning Journey
                    </Typography>
                    
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            backgroundColor: 'background.paper',
                            borderRadius: '15px',
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 1,
                            gap: 1,
                            mt: 5,
                            boxShadow: '1px 0px 6px -3px #00000040'
                        }}>
                            <TextField
                                fullWidth
                                placeholder="What do you want to learn?"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                variant="standard"
                                InputProps={{
                                    disableUnderline: true,
                                }}
                                sx={{ 
                                    ml: 1,
                                    '& .MuiInputBase-root': {
                                        fontSize: '1.1rem'
                                    }
                                }}
                            />
                            
                            <FormControl sx={{ minWidth: 120 }}>
                                <Select
                                    value={proficiency}
                                    onChange={(e) => setProficiency(e.target.value)}
                                    variant="standard"
                                    disableUnderline
                                    sx={{ 
                                        '& .MuiSelect-select': { py: 0 },
                                        '& .MuiInputBase-root': {
                                            fontSize: '1.1rem',
                                        },
                                        width: '80%',
                                        marginLeft: 'auto',
                                        fontSize: '.8rem',
                                        transition: 'all 0.2s ease-in-out',
                                        borderRadius: '10px',
                                        padding: '0.7rem 0.1rem',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        textAlign: 'center',
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.main,
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }
                                    }}
                                >
                                    <MenuItem value="beginner">Novice</MenuItem>
                                    <MenuItem value="intermediate">Practiced</MenuItem>
                                    <MenuItem value="advanced">Expert</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    borderRadius: '10px',
                                    px: 3,
                                    py: 1,
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.background.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.secondary.main,
                                    }
                                }}
                            >
                                {loading ? '...' : 'Begin'}
                            </Button>
                        </Box>
                        
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