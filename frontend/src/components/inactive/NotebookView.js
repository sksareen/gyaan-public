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
                        boxShadow: 2,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                        }
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
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': {
                                transition: 'all 0.2s ease-in-out',
                                transform: 'translateY(-2px)',
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
                                    padding: isListView ? '0' : '12px',
                                    '&:last-child': { pb: 2 },
                                    '&:hover': {
                                        cursor: 'pointer'
                                    }
                                }}
                            >
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" paddingBottom={0} marginBottom={0} lineHeight={1.2}>
                                        {module.topic}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2" paddingBottom={0} marginTop={1.5}>
                                        From: {formatDate(module.createdAt)}
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions sx={{ 
                                display: 'flex',
                                flexDirection: 'row',
                                padding: isListView ? '0' : '12px',
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