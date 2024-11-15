import React, { useState } from 'react';
import { Container, CircularProgress, Box, Typography, Button } from '@mui/material';
import LearningForm from './components/LearningForm';
import Roadmap from './components/Roadmap';
import ModuleContent from './components/ModuleContent';
import Goals from './components/Goals';
import { generateRoadmap, generateModuleContent, generateGoals, generateLearningCards } from './services/api';
import Navigation from './components/Navigation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotebookView from './components/NotebookView';
import ModuleViewer from './components/ModuleViewer';
import LearningCard from './components/LearningCard';

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
    const [learningCards, setLearningCards] = useState([]); // Add state for learning cards
    const [dummyCards, setDummyCards] = useState([
        { id: 1, title: 'Getting Started with React', description: 'A basic introduction to React', type: 'Article' },
        { id: 2, title: 'Understanding JSX', description: 'A deep dive into JSX syntax', type: 'Article' },
        { id: 3, title: 'React State Management', description: 'Exploring different state management libraries', type: 'Article' }
    ]);

    const handleFormSubmit = async (topic, proficiency) => {
        setLoading(true);
        setLoadingType('learningCards');
        try {
            const data = await generateLearningCards(topic, proficiency);
            
            // Use dummy cards if no cards are returned
            const cards = data.cards || dummyCards;
            
            const formattedCards = cards.map(card => ({
                id: card.id,
                title: card.title,
                description: card.description,
                type: card.type
            }));

            setLearningCards(formattedCards);
            setCurrentTopic(topic);
            setCurrentProficiency(proficiency);
        } catch (error) {
            console.error('Error generating learning cards:', error);
            // Fallback to dummy cards on error
            setLearningCards(dummyCards);
            setCurrentTopic(topic);
            setCurrentProficiency(proficiency);
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
                            {learningCards.length > 0 && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    justifyContent: 'center',
                                    mt: 4 
                                }}>
                                    {learningCards.map(card => (
                                        <LearningCard
                                            key={card.id}
                                            title={card.title}
                                            description={card.description}
                                            type={card.type}
                                        />
                                    ))}
                                </Box>
                            )}
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
