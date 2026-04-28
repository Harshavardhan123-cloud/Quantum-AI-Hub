import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, LinearProgress, Divider } from '@mui/material';
import QChart from '../components/QChart';
import SectionTitle from '../components/SectionTitle';
import SimulationExplainer from '../components/SimulationExplainer';
import { motion } from 'framer-motion';

const QuantumDL = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const trainVQC = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/qdl/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_samples: 20, epochs: 15 })
      });
      setResult(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <Box>
      <SectionTitle 
        icon="🤖" 
        title="Quantum Deep Learning" 
        subtitle="Variational Quantum Circuit (VQC) training with parameter-shift gradients" 
        color="#f97316" 
      />
      
      <Grid container spacing={4}>
        {/* Control Panel */}
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <Paper sx={{ p: 4, height: '100%', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#f97316' }} />
              <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 3, color: '#f97316' }}>VQC Configuration</Typography>
              
              <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(249, 115, 22, 0.05)', borderRadius: 2, border: '1px solid rgba(249, 115, 22, 0.1)' }}>
                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1, fontWeight: 700 }}>ARCHITECTURE: 4 Qubits</Typography>
                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1, fontWeight: 700 }}>GRADIENT: Parameter-Shift</Typography>
                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', fontWeight: 700 }}>EPOCHS: 15 (Scheduled)</Typography>
              </Box>

              <Button 
                variant="contained" 
                fullWidth 
                size="large" 
                onClick={trainVQC} 
                disabled={loading} 
                sx={{ py: 2, bgcolor: '#f97316', color: '#000', '&:hover': { bgcolor: '#ea580c' }, fontWeight: 900, mb: 2 }}
              >
                {loading ? 'Optimizing Parameters...' : 'Train Neural Circuit'}
              </Button>

              {loading && <LinearProgress color="warning" sx={{ mt: 1, borderRadius: 1 }} />}

              {result && (
                <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
                  <Typography variant="body2" sx={{ color: '#f97316', fontWeight: 800, mb: 1 }}>
                    Accuracy: {(result.final_accuracy * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>Final Loss: {result.final_loss.toFixed(4)}</Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Paper sx={{ p: 4, minHeight: 450, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="caption" sx={{ color: '#f97316', fontWeight: 800, mb: 3, display: 'block' }}>TRAINING CONVERGENCE METRICS</Typography>
              <Box sx={{ flex: 1 }}>
                {result ? (
                  <>
                    <QChart 
                        data={{
                          labels: result.history.map(h => `Epoch ${h.epoch}`),
                          datasets: [
                            {
                              label: 'Accuracy',
                              data: result.history.map(h => h.accuracy),
                              borderColor: '#34d399',
                              backgroundColor: 'rgba(52, 211, 153, 0.1)',
                              fill: true,
                              yAxisID: 'y'
                            },
                            {
                              label: 'Loss',
                              data: result.history.map(h => h.loss),
                              borderColor: '#f43f5e',
                              fill: false,
                              yAxisID: 'y1'
                            }
                          ]
                        }} 
                      type="line" 
                      title="VQC Learning Curve" 
                      height={320} 
                    />
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Variational Quantum Circuit Training" 
                        resultData={{ accuracy: result.final_accuracy, loss: result.final_loss, epochs: 15 }}
                        context="Hybrid quantum-classical optimization using gradient-based parameter updates."
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Orbitron' }}>Awaiting Quantum Circuit Initialization...</Typography>
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

export default QuantumDL;
