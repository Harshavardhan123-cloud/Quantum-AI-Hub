import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Select, MenuItem, Button, LinearProgress } from '@mui/material';
import QChart from '../components/QChart';
import SectionTitle from '../components/SectionTitle';
import SimulationExplainer from '../components/SimulationExplainer';
import { motion } from 'framer-motion';

const HebbianHub = () => {
  const [history, setHistory] = useState([]);
  const [wStats, setWStats] = useState(Array(100).fill(0));
  const [rule, setRule] = useState("Oja's Rule (Principal Component)");
  const [loading, setLoading] = useState(false);

  const runSimulation = async (batch = false) => {
    setLoading(true);
    try {
      const r = await fetch('/api/hebbian/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule, iterations: batch ? 20 : 1 })
      });
      const data = await r.json();
      setHistory(prev => [...prev, ...data.latent_history]);
      setWStats(data.weights_flat);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <Box>
      <SectionTitle 
        icon="🧠" 
        title="Hebbian Neural Hub" 
        subtitle="Unsupervised synaptic learning protocols: Oja, Sanger, and BCM rules" 
        color="#a855f7" 
      />
      
      <Grid container spacing={4}>
        {/* Controls */}
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <Paper sx={{ p: 4, height: '100%', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#a855f7' }} />
              <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 3, color: '#a855f7' }}>Learning Control</Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>SYNAPTIC PROTOCOL</Typography>
                <Select 
                  fullWidth 
                  value={rule} 
                  onChange={(e) => setRule(e.target.value)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}
                >
                  <MenuItem value="Oja's Rule (Principal Component)">Oja's Rule (Principal Component)</MenuItem>
                  <MenuItem value="Sanger's Rule (Recursive PCA)">Sanger's Rule (Recursive PCA)</MenuItem>
                  <MenuItem value="BCM Rule (Bienenstock-Cooper-Munro)">BCM Rule (Bienenstock-Cooper-Munro)</MenuItem>
                </Select>
              </Box>

              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                onClick={() => runSimulation(false)} 
                sx={{ mb: 2, py: 1.5, fontWeight: 900 }}
              >
                Execute Single Trial
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                fullWidth 
                onClick={() => runSimulation(true)} 
                sx={{ py: 1.5, fontWeight: 800 }}
              >
                Run Batch Training (20x)
              </Button>
              {loading && <LinearProgress color="secondary" sx={{ mt: 3 }} />}
            </Paper>
          </motion.div>
        </Grid>

        {/* Latent Trajectory */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, minHeight: 450, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="caption" sx={{ color: '#a855f7', fontWeight: 800, mb: 2, display: 'block' }}>NEURAL TRAJECTORY (LATENT PROJECTION)</Typography>
            <Box sx={{ flex: 1 }}>
              {history.length > 0 ? (
                <>
                  <QChart 
                    data={{ 
                      labels: Array.from({ length: history.length }).map((_, i) => i), 
                      datasets: [{ 
                        label: 'Latent Activity', 
                        data: history, 
                        borderColor: '#a855f7', 
                        fill: true, 
                        backgroundColor: 'rgba(168, 85, 247, 0.1)', 
                        tension: 0.4 
                      }] 
                    }} 
                    type="line" 
                    title="Synaptic Weight Evolution" 
                    height={300} 
                  />
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <SimulationExplainer 
                      simulationType="Hebbian Learning" 
                      resultData={{ rule, iterations: history.length, last_value: history[history.length - 1] }}
                      context={`Unsupervised synaptic update using ${rule}. Tracking convergence to principal subspace.`}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Orbitron' }}>Awaiting Synaptic Update Initiation...</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Weight Matrix */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="caption" sx={{ color: '#a855f7', fontWeight: 800, mb: 3, display: 'block' }}>SYNAPTIC WEIGHT MATRIX (10x10)</Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: 'repeat(5, 1fr)', sm: 'repeat(10, 1fr)' }, 
              gap: 1.5, 
              maxWidth: 800, 
              mx: 'auto' 
            }}>
              {wStats.map((w, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    backgroundColor: `rgba(168, 85, 247, ${Math.min(1, Math.abs(w) * 5)})`,
                    boxShadow: Math.abs(w) > 0.5 ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none'
                  }}
                  style={{ 
                    aspectRatio: '1', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(168, 85, 247, 0.1)' 
                  }} 
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HebbianHub;
