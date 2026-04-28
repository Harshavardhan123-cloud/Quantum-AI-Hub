import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, LinearProgress } from '@mui/material';
import QChart from '../components/QChart';
import SectionTitle from '../components/SectionTitle';
import SimulationExplainer from '../components/SimulationExplainer';
import { motion } from 'framer-motion';

const QuantumLLM = () => {
  const [attention, setAttention] = useState(null);
  const [spectrum, setSpectrum] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAttention = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/qllm/attention', { method: 'POST' });
      setAttention(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const runEntanglement = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/qllm/entanglement', { method: 'POST' });
      setSpectrum(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <Box>
      <SectionTitle 
        icon="💬" 
        title="Quantum Large Language Models" 
        subtitle="Transformer-inspired attention mechanisms mapped onto Hilbert space correlations" 
        color="#f472b6" 
      />
      
      <Grid container spacing={4}>
        {/* Attention Panel */}
        <Grid item xs={12} lg={6}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Paper sx={{ p: 4, height: '100%', minHeight: 650, display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.3)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#f472b6' }} />
              <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#f472b6' }}>Quantum Attention Heatmap</Typography>
              
              <Button 
                variant="contained" 
                fullWidth 
                onClick={runAttention} 
                disabled={loading}
                sx={{ mb: 4, py: 2, bgcolor: '#f472b6', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#e879f9' } }}
              >
                {loading ? 'Synthesizing Weights...' : 'Compute Attention Coefficients'}
              </Button>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {attention ? (
                  <>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(10, 1fr)', 
                      gap: 1, 
                      bgcolor: 'rgba(0,0,0,0.5)', 
                      p: 3, 
                      borderRadius: 3,
                      border: '1px solid rgba(244, 114, 182, 0.1)' 
                    }}>
                      {attention.matrix.flat().map((val, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.005 }}
                          style={{ 
                            aspectRatio: '1', 
                            backgroundColor: `rgba(244, 114, 182, ${val})`, 
                            borderRadius: '4px',
                            boxShadow: val > 0.7 ? '0 0 10px rgba(244, 114, 182, 0.4)' : 'none'
                          }} 
                        />
                      ))}
                    </Box>
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Quantum LLM Attention" 
                        resultData={{ entanglement_entropy: attention.entropy }}
                        context="Measuring non-local dependence between sequence tokens using Von Neumann entropy."
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', opacity: 0.3 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Orbitron' }}>Awaiting Attention Matrix Synthesis...</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Entanglement Panel */}
        <Grid item xs={12} lg={6}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paper sx={{ p: 4, height: '100%', minHeight: 650, display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.3)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#a855f7' }} />
              <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#a855f7' }}>Entanglement Spectrum</Typography>

              <Button 
                variant="contained" 
                fullWidth 
                onClick={runEntanglement} 
                disabled={loading}
                sx={{ mb: 4, py: 2, bgcolor: '#a855f7', color: '#fff', fontWeight: 900, '&:hover': { bgcolor: '#9333ea' } }}
              >
                {loading ? 'Decomposing Hilbert Space...' : 'Map Hilbert Subspaces'}
              </Button>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {spectrum ? (
                  <>
                    <QChart 
                      data={{ 
                        labels: spectrum.levels.map((_, i) => `λ${i}`), 
                        datasets: [{ 
                          label: 'Schmidt Coefficients', 
                          data: spectrum.coefficients, 
                          backgroundColor: 'rgba(168, 85, 247, 0.5)', 
                          borderColor: '#a855f7',
                          borderWidth: 2,
                          borderRadius: 8 
                        }] 
                      }} 
                      type="bar" 
                      title="Quantum Correlations (Schmidt Rank)" 
                      height={320} 
                    />
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Entanglement Spectrum Analysis" 
                        resultData={{ coefficients: spectrum.coefficients }}
                        context="Quantifying bipartite entanglement across the LLM embedding space."
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', opacity: 0.3 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Orbitron' }}>Awaiting Spectral Decomposition...</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuantumLLM;
