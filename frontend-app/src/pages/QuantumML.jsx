import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, LinearProgress, MenuItem, Select } from '@mui/material';
import QChart from '../components/QChart';
import SectionTitle from '../components/SectionTitle';
import SimulationExplainer from '../components/SimulationExplainer';
import { motion } from 'framer-motion';

const QuantumML = () => {
  const [pcaData, setPcaData] = useState(null);
  const [kmeansData, setKmeansData] = useState(null);
  const [loading, setLoading] = useState('');

  const runPCA = async () => { 
    setLoading('pca'); 
    try {
      const r = await fetch('/api/qml/pca', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ n_samples: 60, epochs: 30 }) 
      }); 
      setPcaData(await r.json());
    } catch (e) { console.error(e); }
    setLoading(''); 
  };

  const runKMeans = async () => { 
    setLoading('km'); 
    try {
      const r = await fetch('/api/qml/kmeans', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ n_samples: 100, k: 3 }) 
      }); 
      setKmeansData(await r.json());
    } catch (e) { console.error(e); }
    setLoading(''); 
  };

  return (
    <Box>
      <SectionTitle 
        icon="📊" 
        title="Quantum Machine Learning" 
        subtitle="Unsupervised quantum-inspired algorithms for dimensionality reduction and clustering" 
        color="#06b6d4" 
      />
      
      <Grid container spacing={4}>
        {/* Q-PCA */}
        <Grid item xs={12} lg={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Paper sx={{ p: 4, height: '100%', minHeight: 600, display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(0,0,0,0.3)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', bgcolor: '#00f2ff' }} />
              <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#00f2ff' }}>Quantum PCA</Typography>
              
              <Button 
                variant="contained" 
                fullWidth 
                onClick={runPCA} 
                disabled={loading === 'pca'}
                sx={{ mb: 4, py: 2, bgcolor: '#00f2ff', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#00d8e4' } }}
              >
                {loading === 'pca' ? 'Training Variational Circuit...' : 'Train Q-PCA Module (60 samples)'}
              </Button>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {pcaData ? (
                  <>
                    <QChart 
                      data={{ 
                        labels: pcaData.loss_history.filter((_, i) => i % 2 === 0).map((_, i) => i * 2), 
                        datasets: [{ 
                          label: 'Reconstruction Loss', 
                          data: pcaData.loss_history.filter((_, i) => i % 2 === 0), 
                          borderColor: '#00f2ff', 
                          fill: true,
                          backgroundColor: 'rgba(0, 242, 255, 0.1)',
                          tension: 0.4
                        }] 
                      }} 
                      type="line" 
                      title="PCA Convergence Log" 
                      height={300} 
                    />
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Quantum PCA" 
                        resultData={{ variance: pcaData.explained_variance }}
                        context="Dimensionality reduction using quantum-inspired eigenvalue decomposition."
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', opacity: 0.3 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Orbitron' }}>Awaiting Dataset Injection...</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Q-KMeans */}
        <Grid item xs={12} lg={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paper sx={{ p: 4, height: '100%', minHeight: 600, display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(0,0,0,0.3)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', bgcolor: '#fb923c' }} />
              <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#fb923c' }}>Quantum K-Means</Typography>

              <Button 
                variant="contained" 
                fullWidth 
                onClick={runKMeans} 
                disabled={loading === 'km'}
                sx={{ mb: 4, py: 2, bgcolor: '#fb923c', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#f59e0b' } }}
              >
                {loading === 'km' ? 'Optimizing Centroids...' : 'Cluster 100 Points (k=3)'}
              </Button>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {kmeansData ? (
                  <>
                    <QChart 
                      data={{ 
                        labels: kmeansData.history.map(h => h.iteration), 
                        datasets: [{ 
                          label: 'Centroid Inertia', 
                          data: kmeansData.history.map(h => h.inertia), 
                          borderColor: '#fb923c', 
                          backgroundColor: 'rgba(251, 146, 60, 0.1)',
                          fill: true,
                          tension: 0.4
                        }] 
                      }} 
                      type="line" 
                      title="K-Means Cluster Assignment" 
                      height={300} 
                    />
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Quantum K-Means" 
                        resultData={{ final_inertia: kmeansData.final_inertia, converged: kmeansData.converged_at }}
                        context="Unsupervised clustering using iterative quantum-inspired centroid optimization."
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', opacity: 0.3 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Orbitron' }}>Awaiting Cluster Initialization...</Typography>
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

export default QuantumML;
