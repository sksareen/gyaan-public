import React, { useEffect, useState } from 'react';
import { Container, CircularProgress, Box, Typography, Button } from '@mui/material';
import LearningForm from './components/LearningForm';
import Roadmap from './components/Roadmap';
import ModuleContent from './components/ModuleContent';
import Goals from './components/Goals';
import { generateRoadmap, generateModuleContent, generateGoals, generateLearningCards, generateMiniModule } from './services/api';
import Navigation from './components/Navigation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotebookView from './components/NotebookView';
// import ModuleViewer from './components/ModuleViewer';
// import LearningCard from './components/LearningCard';
import MiniModuleView from './components/MiniModuleView';
import SavedView from './components/SavedView';
import Settings from './components/Settings';

function App() {
    const [loading, setLoading] = useState(false);
    const [roadmapData, setRoadmapData] = useState(null);
    const [moduleData, setModuleData] = useState(null);
    const [resources, setResources] = useState([]);
    const [goals, setGoals] = useState([]);
    const [currentTopic, setCurrentTopic] = useState('');
    const [currentProficiency, setCurrentProficiency] = useState('');
    const [loadingType, setLoadingType] = useState('');
    const [showConfirmButton, setShowConfirmButton] = useState(false);
    const [savedModules, setSavedModules] = useState(() => {
        const saved = localStorage.getItem('savedModules');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedGoals, setSelectedGoals] = useState([]);
    const [learningCards, setLearningCards] = useState([]);
    const [miniModuleLoading, setMiniModuleLoading] = useState(false);
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

    const handleGoalsSelected = async (goalsSelected) => {
        console.log('Received goals in App component:', goalsSelected);
        setSelectedGoals(goalsSelected);
        setLoading(true);
        setLoadingType('roadmap');
        try {
            const roadmapResponse = await generateRoadmap(currentTopic, goalsSelected, currentProficiency);
            setRoadmapData(roadmapResponse.roadmap);
            setResources(roadmapResponse.resources);
            setShowConfirmButton(true);
        } catch (error) {
            console.error('Error generating content:', error);
        } finally {
            setLoading(false);
            setLoadingType('');
        }
    };

    const handleConfirmRoadmap = async () => {
        setLoading(true);
        setLoadingType('module');
        try {
            const moduleResponse = await generateModuleContent(currentTopic, goals, currentProficiency);
            console.log('Module Response:', moduleResponse);
            setModuleData(moduleResponse);
            const moduleId = saveModule(moduleResponse);
            setShowConfirmButton(false);
        } catch (error) {
            console.error('Error generating module content:', error);
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
            goals: goals,
            selectedGoals: selectedGoals,
            roadmap: roadmapData,
            resources: resources,
            moduleContent: {
                ...moduleData,
                topic: currentTopic
            },
            createdAt: new Date().toISOString()
        };
        
        const updatedModules = [...savedModules, newModule];
        setSavedModules(updatedModules);
        localStorage.setItem('savedModules', JSON.stringify(updatedModules));
        return newModule.id;
    };

    return (
        <Router>
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
                    <Typography variant="h6">
                        {loadingType === 'goals' && 'Generating learning goals...'}
                        {loadingType === 'roadmap' && 'Creating your personalized roadmap...'}
                        {loadingType === 'module' && 'Preparing detailed learning content...'}
                    </Typography>
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
                                {goals.length > 0 && (
                                    <Box id="goals-section">
                                        <Goals goals={goals} onGoalsSelected={handleGoalsSelected} />
                                    </Box>
                                )}
                                {roadmapData && (
                                    <Box id="roadmap-section">
                                        <Roadmap roadmapData={roadmapData} resources={resources} />
                                    </Box>
                                )}
                                {moduleData && (
                                    <Box id="module-section">
                                        <ModuleContent moduleData={moduleData} />
                                    </Box>
                                )}
                                {showConfirmButton && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleConfirmRoadmap}
                                        >
                                            Generate Detailed Content
                                        </Button>
                                    </Box>
                                )}
                            </Container>
                        } />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;
