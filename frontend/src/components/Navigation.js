import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const Navigation = () => {
    const scrollToSection = (elementId) => {
        setTimeout(() => {
            const element = document.getElementById(elementId);
            if (element) {
                const navbarHeight = 64; // Height of the navbar
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100); // Small delay to ensure elements are rendered
    };

    return (
        <AppBar 
            position="fixed" 
            color="default" 
            elevation={0}
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
            }}
        >
            <Toolbar>
                <Box sx={{ display: 'flex', gap: 2, margin: '0 auto' }}>
                    <Button 
                        color="primary"
                        onClick={() => window.location.href = '/'}
                    >
                        Home
                    </Button>
                    <Button 
                        color="primary"
                        onClick={() => window.location.href = '/notebook'}
                    >
                        My Notebook
                    </Button>
                    {window.location.pathname === '/' && (
                        <>
                            <Button 
                                color="primary"
                                onClick={() => scrollToSection('goals-section')}
                            >
                                Goals
                            </Button>
                            <Button 
                                color="primary"
                                onClick={() => scrollToSection('roadmap-section')}
                            >
                                Roadmap
                            </Button>
                            <Button 
                                color="primary"
                                onClick={() => scrollToSection('module-section')}
                            >
                                Module
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation;
