import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MissionControl = () => {
  const [stats, setStats] = useState({ total: 0, quantum: 0, hebbian: 0, physics: 0, mechanics: 0, qml: 0, qdl: 0, qllm: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(err => console.error("Failed to fetch stats:", err));
  }, []);

  const cards = [
    { title: 'Quantum Gates', value: stats.quantum, route: '/quantum', color: '#00f2ff', icon: '⚛️' },
    { title: 'Physics Lab', value: stats.physics, route: '/physics', color: '#fbbf24', icon: '🌊' },
    { title: 'QM Engine', value: stats.mechanics, route: '/mechanics', color: '#34d399', icon: '🔬' },
    { title: 'Neural Hub', value: stats.hebbian, route: '/hebbian', color: '#a855f7', icon: '🧠' },
    { title: 'Quantum ML', value: stats.qml, route: '/qml', color: '#06b6d4', icon: '📊' },
    { title: 'Quantum DL', value: stats.qdl, route: '/qdl', color: '#f97316', icon: '🤖' },
    { title: 'Quantum LLM', value: stats.qllm, route: '/qllm', color: '#f472b6', icon: '💬' },
    { title: 'Total Runs', value: stats.total, route: '/history', color: '#fff', icon: '📜' },
  ];

  return (
    <Box>
      <Box sx={{ textAlign: 'center', py: { xs: 8, md: 15 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="overline" 
            sx={{ 
              color: 'primary.main', 
              letterSpacing: 12, 
              fontSize: '0.8rem',
              display: 'block',
              mb: 3,
              fontWeight: 900
            }}
          >
            ULTIMATE EDITION v18
          </Typography>
          <Typography 
            variant="h1" 
            sx={{ 
              fontFamily: 'Orbitron', 
              fontWeight: 900, 
              fontSize: { xs: '3rem', sm: '4.5rem', md: '7rem' },
              background: 'linear-gradient(90deg, #00f2ff, #a855f7, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 50px rgba(0,242,255,0.4)',
              mb: 4,
              letterSpacing: -2
            }}
          >
            QUANTUM AI
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'grey.400', 
              maxWidth: 900, 
              mx: 'auto', 
              lineHeight: 2,
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 300,
              px: 4
            }}
          >
            The world's most comprehensive Quantum Computing and Artificial Intelligence simulation platform. 
            Explore the frontiers of Quantum Physics, Mechanics, Machine Learning, Deep Learning, and Large Language Models.
          </Typography>
        </motion.div>
      </Box>

      <Box 
        sx={{ 
          mt: 8, 
          pb: 10, 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: 4,
          px: { xs: 2, md: 0 }
        }}
      >
        {cards.map((c, i) => (
          <Box 
            key={i}
            sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 32px)', 
                md: 'calc(25% - 32px)' 
              },
              maxWidth: { md: 350 }
            }}
          >
            <motion.div
              whileHover={{ scale: 1.02, translateY: -8 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Paper 
                onClick={() => navigate(c.route)}
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  height: '100%',
                  minHeight: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: `0 20px 40px ${c.color}15`,
                    borderColor: `${c.color}66`,
                    background: 'rgba(255, 255, 255, 0.04)',
                  }
                }}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', bgcolor: c.color }} />
                <Typography sx={{ fontSize: '3.5rem', mb: 2, filter: `drop-shadow(0 0 10px ${c.color}44)` }}>{c.icon}</Typography>
                <Typography variant="h2" sx={{ fontFamily: 'Orbitron', fontWeight: 900, color: c.color, fontSize: '3rem', mb: 1 }}>
                  {c.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.500', mt: 1, display: 'block', letterSpacing: 3, fontWeight: 800, fontSize: '0.75rem' }}>
                  {c.title.toUpperCase()}
                </Typography>
              </Paper>
            </motion.div>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MissionControl;
