import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Navigation = () => {
    const theme = useTheme();

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
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.main,
            transition: 'all 0.3s ease',
            transform: 'translateY(-1px)'
        }
    };

    const buttonSx2 = {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.main,
        borderRadius: '50px',
        padding: theme.typography.button.padding,
        fontSize: theme.typography.button.fontSize,
        '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.main,
            transition: 'all 0.3s ease',
            borderRadius: '50px',
            transform: 'translateY(-1px)'
        }
    };

    return (
        <AppBar 
            position="fixed" 
            color="default" 
            elevation={0}
            sx={{
                backgroundColor: theme.palette.primary.main,
                backdropFilter: 'blur(8px)',
                color: theme.components.MuiTypography.styleOverrides.root.color,
                fontWeight: 'bold',
                fontFamily: theme.typography.fontFamily,
                boxShadow: '0px -4px 15px 2px #00000080',
            }}
        >
            <Toolbar>
                <Box sx={{ display: 'flex', gap: 2, margin: '0 auto' }}>
                <Button 
                        onClick={() => window.location.href = '/'}
                        sx={{
                            ...buttonSx,
                            borderRadius: '50px', // Pill shape
                            padding: '6px 16px', // Adjust padding for pill shape
                            backgroundColor: theme.palette.background.main,
                            transition: 'all 0.3s ease',
                            fontWeight: '750',
                            fontSize: '14px',
                            color: theme.palette.primary.main
                        }}
                    >
                        + New Journey
                    </Button>
                    <Button 
                        onClick={() => window.location.href = '/notebook'}
                        sx={{
                            ...buttonSx2,
                        }}
                    >
                        My Notebook
                    </Button>
                    <Button 
                        onClick={() => window.location.href = '/saved'}
                        sx={{
                            ...buttonSx2,
                        }}
                    >
                        Saved Notes
                    </Button>
                    {/* <Button
                        onClick={() => window.location.href = '/settings'}
                        sx={{
                            ...buttonSx2,
                        }}
                    >
                        |||
                    </Button> */}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation;
