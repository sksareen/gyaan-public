import { createTheme } from '@mui/material/styles';
import { alignProperty } from '@mui/material/styles/cssUtils';

const theme = createTheme({
  typography: {
    fontFamily: 'Lato',
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
      fontFamily: 'Poppins',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      fontFamily: 'Poppins',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      fontFamily: 'Poppins',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      paddingTop: '1.5rem',
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: 'Poppins',
      textTransform: 'none',
      // boxShadow: '1px 0px 7px -3px #00000080',
      fontWeight: 'bold',
      padding: '0.3rem 1rem',
      margin: '.6rem .5rem .6rem .5rem',
      transition: 'all 0.2s ease-in-out',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      '& span': {
        verticalAlign: 'middle',
      },
      '&:hover': {
        transform: 'translateY(-1px)',
        transition: 'all 0.3s ease-in-out'
      }
    },
    subtitle1: {
      fontSize: '1.3rem',
      fontWeight: 400,
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#2D3748', // Dark gray color for better readability
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#00c464', // Use your preferred primary color
    },
    secondary: {
      main: '#008B8B', // Use your preferred secondary color
    },
    background: {
      main: '#ffffff', // Use your preferred tertiary color
    },
  },
});

export default theme;

// Possible colors:
// #69dc18
// #00c464
// #00a787
// #008790
// #00677e
// #2f4858
