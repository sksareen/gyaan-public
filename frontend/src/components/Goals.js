import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Button, Checkbox, FormGroup, FormControlLabel } from '@mui/material';

const Goals = ({ goals, onGoalsSelected }) => {
    const [selectedGoals, setSelectedGoals] = useState([]);
    const [processedGoals, setProcessedGoals] = useState([]);
    const goalsRef = React.useRef(null);

    useEffect(() => {
        if (goals) {
            // Ensure goals is an array
            let finalGoals = Array.isArray(goals) ? goals : [goals];

            // Process each goal
            finalGoals = finalGoals
                .flatMap(goal => {
                    // Ensure goal is a string
                    goal = typeof goal === 'string' ? goal : JSON.stringify(goal);

                    // Use regex to extract text inside TextBlock
                    const regex = /^\s*\[?TextBlock\(text="([\s\S]*?)"\s*(?:,\s*type='[^']+')?\)\]?\s*$/;

                    const match = goal.match(regex);
                    if (match) {
                        goal = match[1];
                    }

                    // Clean up the goal text
                    goal = goal
                        .replace(/^#\s*@[^#\n]+/gm, '') // Remove header markers like "# @Goals.js"
                        .replace(/\\n/g, '\n')          // Replace escaped newlines

                    // Split into individual goals
                    return goal
                        .split('\n')                                        // Split into lines
                        .map(g => g.replace(/^\d+\.\s*/, '').trim())         // Remove leading numbers and trim
                        .filter(g => g.length > 0);                          // Remove empty lines
                });

            setProcessedGoals(finalGoals);
        }
    }, [goals]);

    React.useEffect(() => {
        if (processedGoals.length > 0 && goalsRef.current) {
            goalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [processedGoals]);

    const handleGoalToggle = (goal) => {
        setSelectedGoals(prev => {
            if (prev.includes(goal)) {
                return prev.filter(g => g !== goal);
            } else {
                return [...prev, goal];
            }
        });
    };

    const handleGenerateRoadmap = () => {
        if (selectedGoals.length === 0) {
            alert('Please select at least one goal');
            return;
        }
        console.log('Selected goals in Goals component:', selectedGoals);
        onGoalsSelected(selectedGoals);
    };

    return (
        <Box ref={goalsRef} sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Learning Goals
                </Typography>
                <FormGroup>
                    {processedGoals.map((goal, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedGoals.includes(goal)}
                                        onChange={() => handleGoalToggle(goal)}
                                    />
                                }
                                label={
                                    <Box sx={{ ml: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            Goal {index + 1}:
                                        </Typography>
                                        <Typography variant="body1">
                                            {goal}
                                        </Typography>
                                    </Box>
                                }
                                sx={{ alignItems: 'flex-start', mr: 0 }}
                            />
                        </Box>
                    ))}
                </FormGroup>
                {processedGoals.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGenerateRoadmap}
                            sx={{ mt: 2 }}
                            disabled={selectedGoals.length === 0}
                        >
                            Generate Roadmap
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default Goals;
