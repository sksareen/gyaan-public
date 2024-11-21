import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AddCircle from '@mui/icons-material/AddCircle';

const Navigation = () => {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const scrollToSection = (elementId) => {
        setTimeout(() => {
            const element = document.getElementById(elementId);
            if (element) {
                const navbarHeight = '100%'; // Height of the navbar
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
        padding: '6px 20px',
        backgroundColor: theme.palette.background.main,
        transition: 'all 0.3s ease',
        fontWeight: '750',
        fontSize: '14px',
        color: 'theme.palette.primary.main',
        width: '80%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.main
        }
    };

    const buttonSx2 = {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.main,
        padding: theme.typography.button.padding,
        fontSize: theme.typography.button.fontSize,
        '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.main,
        }
    };

    return (
        <>
            <AppBar 
                position="fixed" 
                sx={{
                    width: isOpen ? '220px' : '90px',
                    height: '100vh',
                    backgroundColor: theme.palette.primary.main,
                    backdropFilter: 'blur(8px)',
                    color: theme.components.MuiTypography.styleOverrides.root.color,
                    fontWeight: 'bold',
                    fontFamily: theme.typography.fontFamily,
                    boxShadow: '1px 0px 5px 1px #00000050',
                    left: 0,
                    right: 'auto',
                    transition: 'width 0.3s ease',
                    position: 'fixed', // Change to relative
                    zIndex: theme.zIndex.drawer,
                }}
            >

                <Toolbar sx={{ 
                    flexDirection: 'column', 
                    height: '100vh', 
                    gap: 2, 
                    pt: 4,
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2, 
                        width: '100%',
                        alignItems: 'center',
                    }}>
                        <Box sx={{ mt: 4, mb: 4 }}>
                            <img src="logo.png" alt="logo" 
                                style={{ 
                                    borderRadius: '50%',
                                    height: isOpen ? '100px' : '60px',
                                    width: isOpen ? '100px' : '60px', 
                                    marginBottom: isOpen ? '10px' : '40px',
                                    marginLeft: 'auto', 
                                    marginRight: 'auto', 
                                    display: 'block', 
                                    margin: '0 auto', 
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0px 1px 8px -3px #00000080', 
                                }}/>
                        </Box>
                        <Button 
                            onClick={() => window.location.href = '/'}
                            title="New Journey"
                            sx={{
                                ...buttonSx,
                                width: '100%',
                                color: isOpen ? theme.palette.primary.main : theme.palette.background.main,
                                backgroundColor: isOpen ? theme.palette.background.main : theme.palette.primary.main
                            }}
                        >
                            <span>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AddCircle sx={{ ml: isOpen ? 1 : 0, padding: '0px 4px', fontSize: isOpen ? '1.6rem' : '2rem' }} /> {/* Increased size */}
                                    {isOpen && 'New Journey'}
                                </Box>
                            </span>
                        </Button>
                        <hr style={{ width: '90%', border: '.5px solid #fff', margin: '.5rem 0' }} />
                        <Button 
                            onClick={() => window.location.href = '/notebook'}
                            title="My Notebook"
                            sx={{
                                ...buttonSx2,
                                width: '100%'
                            }}
                        >
                            <span>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LibraryBooksIcon sx={{ mr: isOpen ? 1 : 0 }} />
                                    {isOpen && 'My Notebook'}
                                </Box>
                            </span>
                        </Button>
                        <Button 
                            onClick={() => window.location.href = '/saved'}
                            title="Saved Notes"
                            sx={{
                                ...buttonSx2,
                                width: '100%'
                            }}
                        >
                            <span>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BookmarkIcon sx={{ mr: isOpen ? 1 : 0 }} />
                                    {isOpen && 'Saved Notes'}
                                </Box>
                            </span>
                        </Button>
                    </Box>
                </Toolbar>
                <IconButton
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        position: 'relative',
                        width: isOpen ? '70%' : '40px',
                        borderRadius: isOpen ? '8px' : '50%',
                        height: '40px',
                        bottom: '40px',
                        right: '-50%',
                        transform: 'translateX(-50%)',
                        fontSize: '1rem',
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: 'bold',
                        // backgroundColor: theme.palette.background.main,
                        color: theme.palette.background.main,
                        // boxShadow: '0px 1px 7px -3px #00000080',
                        '&:hover': {
                            backgroundColor: theme.palette.secondary.main,
                            color: theme.palette.background.main,
                            // boxShadow: '0px 2px 8px -3px #ffffff80',
                        },
                        zIndex: 1,
                    }}
                >
                    {isOpen ? <><ChevronLeftIcon /> Collapse</> : <ChevronRightIcon />}
                </IconButton>
            </AppBar>
        </>
    );
};

export default Navigation;
