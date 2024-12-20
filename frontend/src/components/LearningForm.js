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
    Typography,
    CircularProgress,
    Backdrop
} from '@mui/material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { generateMiniModule } from '../services/api';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const LearningForm = ({ onSubmit }) => {
    const [topic, setTopic] = useState('');
    const [proficiency, setProficiency] = useState('beginner');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [inputRows, setInputRows] = useState(1);
    const textFieldRef = React.useRef(null);

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

    const handleInputChange = (e) => {
        setTopic(e.target.value);
        
        if (textFieldRef.current) {
            requestAnimationFrame(() => {
                const textarea = textFieldRef.current.querySelector('textarea');
                if (textarea) {
                    textarea.style.height = 'auto';
                    textarea.style.height = `${textarea.scrollHeight}px`;
                }
            });
        }
    };

    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const theme = useTheme();

    return (
        <ThemeProvider theme={theme}>
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2  
                }}
                open={loading}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h6">Generating your learning module...</Typography>
            </Backdrop>

            <Container maxWidth="md" sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '75vh'
            }}>
                <Box sx={{ mt: 4, mb: 4, minWidth: '320px', width: '100%' }}>
                    {/* <img src="/logo192.png" alt="logo" style={{ borderRadius: '50%', height: '140px', width: '140px', marginLeft: 'auto', marginRight: 'auto', display: 'block', margin: '0 auto', marginBottom: '2rem', boxShadow: '2px 0px 7px -3px #00000070' }}/> */}
                    <Typography variant="h1" component="h1" gutterBottom align="center" paddingBottom={2}>
                        Gyaan Learning
                    </Typography>
                    <Typography variant="subtitle1" component="h4" gutterBottom align="center" paddingBottom={2}>
                        Start Your Personalized Learning Journey
                    </Typography>
                    
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 0,
                            backgroundColor: 'background.paper',
                            borderRadius: '15px',
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 1.3,
                            pb: .5,
                            mt: 5,
                            boxShadow: '1px 0px 6px -3px #00000040'
                        }}>
                            <TextField
                                ref={textFieldRef}
                                fullWidth
                                placeholder="What do you want to learn?"
                                value={topic}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                variant="standard"
                                multiline
                                minRows={1}
                                maxRows={Infinity}
                                InputProps={{
                                    disableUnderline: true,
                                }}
                                sx={{ 
                                    '& .MuiInputBase-root': {
                                        fontSize: '1.1rem',
                                        height: 'auto',
                                        padding: '4px 4px',
                                    },
                                    '& .MuiInputBase-input': {
                                        overflow: 'hidden',
                                        lineHeight: '1.5',
                                        padding: '4px',
                                    },
                                    '& textarea': {
                                        resize: 'none',
                                        overflowY: 'hidden',
                                    }
                                }}
                            />
                                                       
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mt: 1,
                                width: '100%'
                            }}>
                                <FormControl sx={{ width: '200px' }}>
                                    
                                    <Select
                                        value={proficiency}
                                        onChange={(e) => setProficiency(e.target.value)}
                                        variant="standard"
                                        disableUnderline
                                        sx={{ 
                                            '& .MuiSelect-select': { 
                                                py: 0,
                                                fontSize: '1rem',
                                            },
                                            width: '120px',
                                            transition: 'all 0.2s ease-in-out',
                                            borderRadius: '10px',
                                            padding: '0.6rem 1rem',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            textAlign: 'center',
                                            backgroundColor: 'grey.100',
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
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        borderRadius: '10px',
                                        width: '150px',
                                        padding: '0.5rem 1rem',
                                        fontSize: '1rem',
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
                        </Box>
                        
                        {error && (
                            <Typography color="error" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}
                    </form>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            px: 1,
                            py: 0.5,
                            ml: 1,
                            fontSize: '0.9rem',
                            opacity: 0.7
                        }}
                    >
                        Pro tip: Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to submit
                    </Typography>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default LearningForm;