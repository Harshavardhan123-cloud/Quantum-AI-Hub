import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import { 
  Home, 
  Waves, 
  Microscope, 
  Cpu, 
  Brain, 
  BarChart3, 
  Bot, 
  MessageSquare, 
  History,
  Menu as MenuIcon
} from 'lucide-react';
import theme from './theme';
import MissionControl from './pages/MissionControl';
import QuantumCircuit from './pages/QuantumCircuit';
import HistoryLogs from './pages/HistoryLogs';
import PhysicsLab from './pages/PhysicsLab';
import MechanicsEngine from './pages/MechanicsEngine';
import HebbianHub from './pages/HebbianHub';
import QuantumML from './pages/QuantumML';
import QuantumDL from './pages/QuantumDL';
import QuantumLLM from './pages/QuantumLLM';
import GrokChatbot from './components/GrokChatbot';
import ParticleField from './components/ParticleField';

const NavItems = [
  { label: 'HUB', path: '/', icon: <Home size={18} /> },
  { label: 'PHYSICS', path: '/physics', icon: <Waves size={18} /> },
  { label: 'MECHANICS', path: '/mechanics', icon: <Microscope size={18} /> },
  { label: 'CIRCUIT', path: '/quantum', icon: <Cpu size={18} /> },
  { label: 'NEURAL', path: '/hebbian', icon: <Brain size={18} /> },
  { label: 'ML', path: '/qml', icon: <BarChart3 size={18} /> },
  { label: 'DL', path: '/qdl', icon: <Bot size={18} /> },
  { label: 'LLM', path: '/qllm', icon: <MessageSquare size={18} /> },
  { label: 'LOGS', path: '/history', icon: <History size={18} /> },
];

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activePath = location.pathname;

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'rgba(3, 3, 10, 0.8)', 
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(0, 242, 255, 0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                cursor: 'pointer' 
              }} 
              onClick={() => navigate('/')}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Orbitron', 
                  color: 'primary.main', 
                  fontWeight: 900, 
                  letterSpacing: 2,
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                QUANTUM AI
              </Typography>
              <Chip 
                label="v18" 
                size="small" 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: '#000', 
                  fontWeight: 900, 
                  fontSize: '0.6rem', 
                  height: 20 
                }} 
              />
            </Box>

            {isMobile ? (
              <IconButton onClick={() => setDrawerOpen(true)} color="primary">
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {NavItems.map(item => (
                  <Button 
                    key={item.path} 
                    size="small" 
                    onClick={() => navigate(item.path)} 
                    startIcon={item.icon}
                    sx={{ 
                      color: activePath === item.path ? 'primary.main' : 'grey.500', 
                      fontSize: '0.7rem', 
                      fontWeight: 700,
                      px: 2,
                      borderBottom: activePath === item.path ? '2px solid #00f2ff' : '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': {
                        bgcolor: 'rgba(0, 242, 255, 0.05)',
                        color: 'primary.main'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 280, bgcolor: '#03030a', borderLeft: '1px solid rgba(0, 242, 255, 0.1)' }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Orbitron', color: 'primary.main', mb: 4 }}>NAVIGATE</Typography>
          <List>
            {NavItems.map(item => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton 
                  onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                  selected={activePath === item.path}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0, 242, 255, 0.1)',
                      '&:hover': { bgcolor: 'rgba(0, 242, 255, 0.15)' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: activePath === item.path ? 'primary.main' : 'grey.600', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700,
                      color: activePath === item.path ? 'primary.main' : 'grey.400'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 'auto', textAlign: 'center', p: 2 }}>
            <Typography variant="caption" sx={{ color: 'grey.800', letterSpacing: 2 }}>QUANTUM AI v18</Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ParticleField />
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navigation />
          <Container maxWidth="xl" sx={{ py: 6, flex: 1 }}>
            <Routes>
              <Route path="/" element={<MissionControl />} />
              <Route path="/physics" element={<PhysicsLab />} />
              <Route path="/mechanics" element={<MechanicsEngine />} />
              <Route path="/quantum" element={<QuantumCircuit />} />
              <Route path="/hebbian" element={<HebbianHub />} />
              <Route path="/qml" element={<QuantumML />} />
              <Route path="/qdl" element={<QuantumDL />} />
              <Route path="/qllm" element={<QuantumLLM />} />
              <Route path="/history" element={<HistoryLogs />} />
              <Route path="*" element={<MissionControl />} />
            </Routes>
          </Container>
          <GrokChatbot />
          <Box 
            component="footer" 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderTop: '1px solid rgba(255, 255, 255, 0.03)', 
              color: 'grey.800', 
              fontSize: '0.7rem', 
              letterSpacing: 3,
              mt: 'auto'
            }}
          >
            QUANTUM AI ULTIMATE EDITION | RESEARCH PLATFORM 2026
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
