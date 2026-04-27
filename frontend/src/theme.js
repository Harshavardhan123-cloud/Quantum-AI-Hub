const { createTheme } = MaterialUI;

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#00f2ff', contrastText: '#000' },
        secondary: { main: '#7000ff' },
        background: { default: '#0a0a15', paper: 'rgba(10, 10, 21, 0.8)' },
        text: { primary: '#e0e0e0', secondary: '#888' }
    },
    typography: {
        fontFamily: '"Inter", sans-serif',
        h1: { fontFamily: 'Orbitron', fontWeight: 900 },
        h2: { fontFamily: 'Orbitron', fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 700 }
    },
    shape: { borderRadius: 12 },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(10, 10, 21, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }
            }
        }
    }
});

window.EliteTheme = theme;
