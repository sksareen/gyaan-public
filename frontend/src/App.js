import React, { useState } from 'react';
import { Container, CircularProgress, Box, Typography, Button } from '@mui/material';
import LearningForm from './components/LearningForm';
import Roadmap from './components/Roadmap';
import ModuleContent from './components/ModuleContent';
import Goals from './components/Goals';
import { generateRoadmap, generateModuleContent, generateGoals } from './services/api';
import Navigation from './components/Navigation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotebookView from './components/NotebookView';
import ModuleViewer from './components/ModuleViewer';

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

    const handleFormSubmit = async (topic, proficiency) => {
        setLoading(true);
        setLoadingType('goals');
        try {
            const goalsResponse = await generateGoals(topic, proficiency);
            if (!goalsResponse.goals || !Array.isArray(goalsResponse.goals)) {
                throw new Error('Invalid goals format received from server');
            }
            setGoals(goalsResponse.goals);
            setCurrentTopic(topic);
            setCurrentProficiency(proficiency);
        } catch (error) {
            console.error('Error generating goals:', error);
            alert(`Error generating goals: ${error.message}. Please try again.`);
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
            <Navigation />
            <Box sx={{ pt: '64px' }}>
                <Routes>
                    <Route path="/notebook" element={<NotebookView />} />
                    <Route path="/module/:moduleId" element={<ModuleViewer />} />
                    <Route path="/" element={
                        <Container maxWidth="lg">
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
        </Router>
    );
}

export default App;
