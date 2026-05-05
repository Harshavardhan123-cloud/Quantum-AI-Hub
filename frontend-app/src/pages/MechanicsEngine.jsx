import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Slider, Chip } from '@mui/material';
import QChart from '../components/QChart';
import SectionTitle from '../components/SectionTitle';
import SimulationExplainer from '../components/SimulationExplainer';
import { motion } from 'framer-motion';
import { Terminal, BrainCircuit } from 'lucide-react';

const MechanicsEngine = () => {
  const [uncData, setUncData] = useState(null);
  const [spinData, setSpinData] = useState(null);
  const [hamData, setHamData] = useState(null);
  const [oscData, setOscData] = useState(null);
  const [theta, setTheta] = useState(1.0);
  const [phi, setPhi] = useState(0.0);
  const [loading, setLoading] = useState('');

  const runUnc = async () => { 
    setLoading('unc');
    const r = await fetch('/api/mechanics/uncertainty', { method: 'POST' }); 
    setUncData(await r.json()); 
    setLoading('');
  };
  
  const runSpin = async () => { 
    setLoading('spin');
    const r = await fetch('/api/mechanics/spin', { 
      method: 'POST', 
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({ theta, phi }) 
    }); 
    setSpinData(await r.json()); 
    setLoading('');
  };
  
  const runHam = async () => { 
    setLoading('ham');
    const r = await fetch('/api/mechanics/hamiltonian', { 
      method: 'POST', 
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({ size: 4 }) 
    }); 
    setHamData(await r.json()); 
    setLoading('');
  };
  
  const runOsc = async () => { 
    setLoading('osc');
    const r = await fetch('/api/mechanics/oscillator', { method: 'POST' }); 
    setOscData(await r.json()); 
    setLoading('');
  };

  return (
    <Box>
      <SectionTitle 
        icon="🔬" 
        title="Quantum Mechanics Engine" 
        subtitle="Heisenberg uncertainty, Pauli spin states, and Hamiltonian eigendecomposition" 
        color="success.main" 
      />
      
      <Grid container spacing={4}>
        {/* Heisenberg Uncertainty */}
        <Grid item xs={12} lg={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Paper sx={{ p: 4, height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#00f2ff' }} />
              <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#00f2ff', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Terminal size={20} /> Heisenberg Uncertainty
              </Typography>
              
              <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(0, 242, 255, 0.03)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>
                  Analyzing the non-commutativity of [X, P] operators in a Gaussian wave-packet.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={runUnc} 
                  disabled={loading === 'unc'}
                  sx={{ py: 1.5, bgcolor: '#00f2ff', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#00d8e4' } }}
                >
                  {loading === 'unc' ? 'Computing Phase Space...' : 'Solve Uncertainty Relation'}
                </Button>
              </Box>

              <Box sx={{ minHeight: 250, display: 'flex', flexDirection: 'column' }}>
                {uncData ? (
                  <>
                    <QChart 
                      data={{ 
                        labels: uncData.delta_x.filter((_, i) => i % 3 === 0).map(d => d.toFixed(2)), 
                        datasets: [
                          { label: 'Minimum Δp', data: uncData.delta_p_minimum.filter((_, i) => i % 3 === 0), borderColor: '#00f2ff', fill: false, tension: 0.4 }, 
                          { label: 'Measured Δp', data: uncData.delta_p_spread.filter((_, i) => i % 3 === 0), borderColor: '#f472b6', borderDash: [4, 4], fill: false, tension: 0.4 }
                        ] 
                      }} 
                      type="line" 
                      title="Uncertainty Limit Visualization" 
                      height={200} 
                    />
                    <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Heisenberg Uncertainty" 
                        resultData={{ hbar_over_2: uncData.hbar_over_2 }}
                        context="Analysis of position-momentum trade-offs in quantum states."
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                    <Typography variant="caption">Ready for state computation...</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Pauli Spin */}
        <Grid item xs={12} lg={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paper sx={{ p: 4, height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#a855f7' }} />
              <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#a855f7', display: 'flex', alignItems: 'center', gap: 2 }}>
                <BrainCircuit size={20} /> Pauli Spin Analysis
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#a855f7', fontWeight: 800, mb: 1, display: 'block' }}>THETA (θ) = {theta.toFixed(2)}</Typography>
                  <Slider value={theta} onChange={(e, v) => setTheta(v)} min={0} max={Math.PI} step={0.05} color="secondary" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#a855f7', fontWeight: 800, mb: 1, display: 'block' }}>PHI (φ) = {phi.toFixed(2)}</Typography>
                  <Slider value={phi} onChange={(e, v) => setPhi(v)} min={0} max={2 * Math.PI} step={0.05} color="secondary" />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    fullWidth 
                    onClick={runSpin} 
                    disabled={loading === 'spin'}
                    sx={{ py: 1.5, fontWeight: 900 }}
                  >
                    Measure Spin Projections
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ minHeight: 250, display: 'flex', flexDirection: 'column' }}>
                {spinData ? (
                  <>
                    <QChart 
                      data={{ 
                        labels: ['σx', 'σy', 'σz'], 
                        datasets: [{ 
                          label: 'Expectation Values', 
                          data: [spinData.expectations.x, spinData.expectations.y, spinData.expectations.z], 
                          backgroundColor: ['rgba(0,242,255,0.6)', 'rgba(168,85,247,0.6)', 'rgba(244,114,182,0.6)'],
                          borderRadius: 6
                        }] 
                      }} 
                      type="bar" 
                      title="Bloch Vector Projections" 
                      height={200} 
                    />
                    <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Pauli Spin Analysis" 
                        resultData={{ expectations: spinData.expectations, purity: spinData.purity }}
                        context={`Angles: θ=${theta}, φ=${phi}. Measuring projection in arbitrary basis.`}
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                    <Typography variant="caption">Ready for spin measurement...</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Hamiltonian */}
        <Grid item xs={12} lg={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Paper sx={{ p: 4, height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#34d399' }} />
              <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#34d399', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Terminal size={20} /> Hamiltonian Spectrum
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={runHam} 
                  disabled={loading === 'ham'}
                  sx={{ py: 1.5, bgcolor: '#34d399', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#10b981' } }}
                >
                  Generate & Eigendecompose H
                </Button>
              </Box>

              <Box sx={{ minHeight: 250, display: 'flex', flexDirection: 'column' }}>
                {hamData ? (
                  <>
                    <QChart 
                      data={{ 
                        labels: hamData.eigenvalues.map((_, i) => `λ${i}`), 
                        datasets: [{ 
                          label: 'Energy (eV)', 
                          data: hamData.eigenvalues, 
                          backgroundColor: hamData.eigenvalues.map(e => e > 0 ? 'rgba(0,242,255,0.6)' : 'rgba(244,114,182,0.6)'),
                          borderRadius: 6
                        }] 
                      }} 
                      type="bar" 
                      title="Eigenvalue Distribution" 
                      height={200} 
                    />
                    <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Hamiltonian Eigendecomposition" 
                        resultData={{ eigenvalues: hamData.eigenvalues, trace: hamData.trace }}
                        context="Solving the time-independent Schrödinger equation for a synthetic system."
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                    <Typography variant="caption">Ready for spectral analysis...</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Oscillator */}
        <Grid item xs={12} lg={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Paper sx={{ p: 4, height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#fbbf24' }} />
              <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Terminal size={20} /> Harmonic Oscillator
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={runOsc} 
                  disabled={loading === 'osc'}
                  sx={{ py: 1.5, bgcolor: '#fbbf24', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#f59e0b' } }}
                >
                  Quantize Energy Levels
                </Button>
              </Box>

              <Box sx={{ minHeight: 250, display: 'flex', flexDirection: 'column' }}>
                {oscData ? (
                  <>
                    <QChart 
                      data={{ 
                        labels: oscData.levels.map(l => `n=${l}`), 
                        datasets: [{ 
                          label: 'Energy (ℏω)', 
                          data: oscData.energies, 
                          backgroundColor: 'rgba(251,191,36,0.3)', 
                          borderColor: '#fbbf24', 
                          borderWidth: 2,
                          borderRadius: 6
                        }] 
                      }} 
                      type="bar" 
                      title="Equidistant Spectrum (Ladders)" 
                      height={200} 
                    />
                    <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                      <SimulationExplainer 
                        simulationType="Quantum Harmonic Oscillator" 
                        resultData={{ energies: oscData.energies, spacing: oscData.spacing }}
                        context="Analyzing the zero-point energy and ladder operators of a 1D oscillator."
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                    <Typography variant="caption">Ready for quantization analysis...</Typography>
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

export default MechanicsEngine;
