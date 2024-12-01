import React, { useEffect, useState } from 'react';
import { Container, CircularProgress, Box, Typography, Button } from '@mui/material';
import LearningForm from './components/LearningForm';
import { generateMiniModule } from './services/api';
import Navigation from './components/Navigation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotebookView from './components/NotebookView';
import MiniModuleView from './components/MiniModuleView';
import SavedView from './components/SavedView';
import Settings from './components/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

function App() {
    const [loading, setLoading] = useState(false);

    const [currentTopic, setCurrentTopic] = useState('');
    const [currentProficiency, setCurrentProficiency] = useState('');
    const [loadingType, setLoadingType] = useState('');
    const [savedModules, setSavedModules] = useState(() => {
        const saved = localStorage.getItem('savedModules');
        return saved ? JSON.parse(saved) : [];
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 430);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 430);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFormSubmit = async (topic, proficiency) => {
        setLoading(true);
        setLoadingType('module');
        try {
            const moduleResponse = await generateMiniModule(topic, proficiency);
            setCurrentTopic(topic);
            setCurrentProficiency(proficiency);
            
            // Save module and navigate
            const moduleId = saveModule(moduleResponse);
            window.location.href = `/mini-module/${moduleId}`;
        } catch (error) {
            console.error('Error generating module:', error);
            alert('Failed to generate module. Please try again.');
        } finally {
            setLoading(false);
            setLoadingType('');
        }
    };

    const saveModule = (moduleData) => {
        const newModule = {
            id: Date.now(),
            topic: currentTopic,
            proficiency: currentProficiency,
            moduleContent: {
                ...moduleData,
                topic: currentTopic,
            },
            createdAt: new Date().toISOString(),
        };

        const updatedModules = [...savedModules, newModule];
        setSavedModules(updatedModules);
        localStorage.setItem('savedModules', JSON.stringify(updatedModules));
        return newModule.id;
    };

    return (
        <Router>
            <IconButton
                component="a"
                href="https://docs.google.com/forms/d/e/1FAIpQLSdKRfCx1cS7ukmUOHArA_akrzXvKYby2QxAVOVpMlncGmWGDQ/viewform?usp=sf_link"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: 9999,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                }}
            >
                <Tooltip title="Give Feedback">
                    <FeedbackIcon />
                </Tooltip>
            </IconButton>
            {loading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 9999,
                    }}
                >
                    <CircularProgress sx={{ mb: 2 }} />
                </Box>
            )}
            <Box sx={{ 
                display: 'flex',
                minHeight: '100vh',
                transition: 'all 0.3s ease'
            }}>
                <Navigation isOpen={isOpen} setIsOpen={setIsOpen} />
                <Box 
                    component="main" 
                    sx={{ 
                        flexGrow: 1,
                        p: 3,
                        transition: 'margin-left 0.3s ease',
                        ...(isMobile ? {
                            marginLeft: 0,
                            width: '100%',
                            paddingBottom: '80px', // Add space for mobile footer
                        } : {
                            marginLeft: isOpen ? '250px' : '80px',
                            width: `calc(100% - ${isOpen ? '250px' : '80px'})`,
                        }),
                    }}
                >
                    <Routes>
                        <Route path="/notebook" element={<NotebookView />} />
                        <Route path="/saved" element={<SavedView />} />
                        <Route path="/mini-module/:id" element={<MiniModuleView />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/" element={
                            <Container maxWidth="lg" sx={{ p: 0 }}>
                                <LearningForm onSubmit={handleFormSubmit} />
                                {/* {showConfirmButton && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleConfirmRoadmap}
                                        >
                                            Generate Detailed Content
                                        </Button>
                                    </Box>
                                )} */}
                            </Container>
                        } />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;
