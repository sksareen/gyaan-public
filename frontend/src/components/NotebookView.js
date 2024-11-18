import React, { useState } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    CardActions,
    Grid,
    Chip,
    IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

const NotebookView = () => {
    const [savedModules, setSavedModules] = React.useState([]);
    const navigate = useNavigate();
    const [isListView, setIsListView] = useState(false);

    React.useEffect(() => {
        try {
            const modules = JSON.parse(localStorage.getItem('savedModules') || '[]');
            setSavedModules(Array.isArray(modules) ? modules : []);
        } catch (error) {
            console.error('Error parsing savedModules from localStorage:', error);
            setSavedModules([]);
        }
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleOpenMiniModule = (moduleId) => {
        navigate(`/mini-module/${moduleId}`);
    };

    const handleDeleteModule = (moduleId) => {
        const updatedModules = savedModules.filter(module => module.id !== moduleId);
        localStorage.setItem('savedModules', JSON.stringify(updatedModules));
        setSavedModules(updatedModules);
    };

    const toggleView = () => {
        setIsListView(prev => !prev);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h3" gutterBottom>
                        My Learning Notebook
                    </Typography>
                </Box>
                <IconButton 
                    onClick={toggleView} 
                    color="primary" 
                    sx={{ 
                        marginLeft: 'auto', 
                        boxShadow: 2 
                    }}
                >
                    {isListView ? <ViewModuleIcon /> : <ViewListIcon />}
                </IconButton>
            </Box>
            <Grid container spacing={2}>
                {Array.isArray(savedModules) && savedModules.map((module) => (
                    <Grid item 
                        key={module.id} 
                        xs={isListView ? 12 : 12}
                        sm={isListView ? 12 : 6}
                        md={isListView ? 12 : 4}
                    >
                        <Card sx={{ 
                            display: 'flex', 
                            flexDirection: isListView ? 'row' : 'column',
                            alignItems: isListView ? 'center' : 'flex-start',
                            padding: isListView ? '8px 16px' : '16px',
                            minHeight: isListView ? 'auto' : '180px',
                            maxHeight: isListView ? '80px' : '180px',
                            height: isListView ? '80px' : 'auto',
                            '&:hover': {

                                boxShadow: 3
                            }
                        }}>
                            <CardContent 
                                onClick={() => handleOpenMiniModule(module.id)}
                                sx={{ 
                                    flex: '1 0 auto',
                                    display: 'flex',
                                    flexDirection: isListView ? 'row' : 'column',
                                    alignItems: isListView ? 'center' : 'flex-start',
                                    padding: isListView ? '0' : '16px',
                                    '&:last-child': { pb: 2 },
                                    '&:hover': {
                                        cursor: 'pointer'
                                    }
                                }}
                            >
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {module.topic}
                                    </Typography>
                                    {/* <Chip 
                                        label={module.proficiency} 
                                        color="primary" 
                                        size="small" 
                                        sx={{ mr: 2 }}
                                    /> */}
                                    <Typography color="textSecondary" variant="body2">
                                        Started: {formatDate(module.createdAt)}
                                    </Typography>
                                    {/* Only show goals in grid view */}
                                    {/* {!isListView && module.selectedGoals && (
                                        <>
                                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                                Selected Goals:
                                            </Typography>
                                            <Box sx={{ pl: 2 }}>
                                                {module.selectedGoals.map((goal, index) => (
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
                                        </>
                                    )} */}
                                </Box>
                            </CardContent>
                            <CardActions sx={{ 
                                display: 'flex',
                                flexDirection: 'row',
                                padding: isListView ? '0' : '16px',
                                alignSelf: 'center'
                            }}>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenMiniModule(module.id)}
                                    aria-label="open mini module"
                                >
                                    <OpenInNewIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteModule(module.id);
                                    }}
                                    aria-label="delete module"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default NotebookView;
