import React from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    CardActions,
    Button,
    Grid,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotebookView = () => {
    const [savedModules, setSavedModules] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const modules = JSON.parse(localStorage.getItem('savedModules') || '[]');
        setSavedModules(modules);
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const processGoals = (goals, selectedGoals) => {
        if (!goals || !selectedGoals) return [];
        
        let finalGoals = Array.isArray(goals) ? goals : [goals];
        
        return finalGoals
            .flatMap(goal => {
                if (typeof goal === 'string') {
                    return goal
                        .replace(/\\n\\n/g, '\n\n')
                        .replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\')
                        .split(/\n+/)
                        .map(g => g.replace(/^\d+\.\s*/, ''));
                }
                return [goal];
            })
            .map(goal => goal.trim())
            .filter(goal => goal && goal.length > 0)
            .filter(goal => selectedGoals.includes(goal));
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    My Learning Notebook
                </Typography>
                <Grid container spacing={3}>
                    {savedModules.map((module) => (
                        <Grid item xs={12} md={6} key={module.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        {module.topic}
                                    </Typography>
                                    <Chip 
                                        label={module.proficiency} 
                                        color="primary" 
                                        size="small" 
                                        sx={{ mb: 2 }}
                                    />
                                    <Typography color="textSecondary" gutterBottom>
                                        Created: {formatDate(module.createdAt)}
                                    </Typography>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Selected Goals:
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        {processGoals(module.goals, module.selectedGoals).map((goal, index) => (
                                            <Typography 
                                                key={index} 
                                                variant="body2" 
                                                sx={{ 
                                                    mb: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    '&:before': {
                                                        content: '"•"',
                                                        marginRight: '8px',
                                                        color: 'primary.main',
                                                        fontSize: '1.2em'
                                                    }
                                                }}
                                            >
                                                {goal}
                                            </Typography>
                                        ))}
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        color="primary"
                                        onClick={() => navigate(`/module/${module.id}`)}
                                    >
                                        View Full Module
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default NotebookView;