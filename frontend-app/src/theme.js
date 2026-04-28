import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f2ff', // Neon Cyan
    },
    secondary: {
      main: '#a855f7', // Neon Purple
    },
    error: {
      main: '#f472b6', // Neon Pink
    },
    warning: {
      main: '#fbbf24', // Neon Gold
    },
    success: {
      main: '#34d399', // Emerald
    },
    background: {
      default: '#03030a',
      paper: '#0a0a1a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Orbitron", sans-serif',
    h1: {
      fontFamily: 'Orbitron',
      fontWeight: 900,
    },
    h2: {
      fontFamily: 'Orbitron',
      fontWeight: 800,
    },
    h3: {
      fontFamily: 'Orbitron',
      fontWeight: 700,
    },
    h4: {
      fontFamily: 'Orbitron',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Orbitron',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'Orbitron',
      fontWeight: 500,
    },
    overline: {
      fontFamily: 'Orbitron',
      letterSpacing: '0.2em',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(10, 10, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
