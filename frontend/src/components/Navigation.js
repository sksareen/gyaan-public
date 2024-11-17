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

    const buttonSx = {
        '&:hover': {
            backgroundColor: 'grey.100'
        }
    };

    const buttonSx2 = {
        '&:hover': {
            backgroundColor: 'grey.500',
            color: 'white',
            transition: 'all 0.3s ease'
        }
    };

    return (
        <AppBar 
            position="fixed" 
            color="default" 
            elevation={0}
            sx={{
                backgroundColor: 'grey.300',
                backdropFilter: 'blur(8px)',
            }}
        >
            <Toolbar>
                <Box sx={{ display: 'flex', gap: 2, margin: '0 auto' }}>
                    <Button 
                        color="primary"
                        onClick={() => window.location.href = '/'}
                        sx={buttonSx}
                    >
                        Home
                    </Button>
                    <Button 
                        color="primary"
                        border="1px solid grey"
                        onClick={() => window.location.href = '/notebook'}
                        sx={buttonSx2}
                    >
                        My Notebook
                    </Button>
                    {window.location.pathname === '/' && (
                        <>
                            {/* <Button 
                                color="primary"
                                onClick={() => scrollToSection('goals-section')}
                                sx={buttonSx}
                            >
                                Goals
                            </Button>
                            <Button 
                                color="primary"
                                onClick={() => scrollToSection('roadmap-section')}
                                sx={buttonSx}
                            >
                                Learning Roadmap
                            </Button>
                            <Button 
                                color="primary"
                                onClick={() => scrollToSection('module-section')}
                                sx={buttonSx}
                            >
                                Module
                            </Button> */}
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation;
