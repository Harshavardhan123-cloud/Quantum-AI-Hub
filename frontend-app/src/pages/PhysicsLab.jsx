import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Slider, Button, Select, MenuItem, Chip, LinearProgress } from '@mui/material';
import QChart from '../components/QChart';
import SectionTitle from '../components/SectionTitle';
import SimulationExplainer from '../components/SimulationExplainer';
import { motion } from 'framer-motion';

const PhysicsLab = () => {
  const [slitData, setSlitData] = useState(null);
  const [tunnelData, setTunnelData] = useState(null);
  const [schData, setSchData] = useState(null);
  const [wavelength, setWavelength] = useState(0.01);
  const [energy, setEnergy] = useState(3.0);
  const [potential, setPotential] = useState('harmonic');
  const [loading, setLoading] = useState('');

  const runSlit = async () => { 
    setLoading('slit'); 
    try {
      const r = await fetch('/api/physics/double_slit', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ wavelength, slit_distance: 0.5, screen_distance: 2.0 }) 
      }); 
      setSlitData(await r.json());
    } catch (e) { console.error(e); }
    setLoading(''); 
  };

  const runTunnel = async () => { 
    setLoading('tunnel'); 
    try {
      const r = await fetch('/api/physics/tunneling', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ barrier_height: 5.0, barrier_width: 1.0, particle_energy: energy }) 
      }); 
      setTunnelData(await r.json());
    } catch (e) { console.error(e); }
    setLoading(''); 
  };

  const runSchrodinger = async () => { 
    setLoading('sch'); 
    try {
      const r = await fetch('/api/physics/schrodinger', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ potential_type: potential, num_states: 5 }) 
      }); 
      setSchData(await r.json());
    } catch (e) { console.error(e); }
    setLoading(''); 
  };

  return (
    <Box>
      <SectionTitle 
        icon="🌊" 
        title="Quantum Physics Laboratory" 
        subtitle="Wave-particle duality, quantum tunneling, and Schrödinger eigenstates" 
        color="warning.main" 
      />
         {/* Double Slit */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 24, bgcolor: 'primary.main', borderRadius: 4 }} />
          Double-Slit Experiment
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 4, height: '100%', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, mb: 4, display: 'block' }}>EXPERIMENT PARAMETERS</Typography>
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>Wavelength (λ): {wavelength.toFixed(3)}</Typography>
                <Slider 
                  value={wavelength} 
                  onChange={(e, v) => setWavelength(v)} 
                  min={0.001} 
                  max={0.05} 
                  step={0.001}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={runSlit} 
                sx={{ py: 1.5, fontWeight: 900, letterSpacing: 1 }}
              >
                Launch Photons
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, minHeight: 400, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.2)' }}>
              {slitData ? (
                <>
                  <Box sx={{ flex: 1 }}>
                    <QChart 
                      data={{ 
                        labels: slitData.positions.filter((_, i) => i % 4 === 0).map(p => p.toFixed(2)), 
                        datasets: [{ 
                          label: 'Probability Intensity', 
                          data: slitData.intensity.filter((_, i) => i % 4 === 0), 
                          borderColor: '#00f2ff', 
                          fill: true, 
                          backgroundColor: 'rgba(0, 242, 255, 0.1)', 
                          tension: 0.4 
                        }] 
                      }} 
                      type="line" 
                      title="Interference Pattern Distribution" 
                      height={280} 
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <SimulationExplainer 
                      simulationType="Double-Slit Interference" 
                      resultData={{ wavelength, fringe_count: slitData.fringe_count }}
                      context={`Wavelength: ${wavelength}. Slit distance: 0.5 units.`}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                  <Typography variant="body2">Awaiting interference pattern synchronization...</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Tunneling */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 3, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 24, bgcolor: 'secondary.main', borderRadius: 4 }} />
          Quantum Tunneling
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 4, height: '100%', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800, mb: 4, display: 'block' }}>BARRIER PARAMETERS</Typography>
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>Particle Energy (E): {energy.toFixed(2)}</Typography>
                <Slider 
                  value={energy} 
                  onChange={(e, v) => setEnergy(v)} 
                  min={1} 
                  max={10} 
                  step={0.1}
                  color="secondary"
                />
              </Box>
              <Button 
                variant="contained" 
                color="secondary"
                fullWidth 
                size="large"
                onClick={runTunnel} 
                sx={{ py: 1.5, fontWeight: 900, letterSpacing: 1 }}
              >
                Analyze Penetration
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, minHeight: 400, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.2)' }}>
              {tunnelData ? (
                <>
                  <Box sx={{ flex: 1 }}>
                    <QChart 
                      data={{ 
                        labels: tunnelData.positions.filter((_, i) => i % 3 === 0).map(p => p.toFixed(2)), 
                        datasets: [
                          { label: 'Wavefunction (ψ)', data: tunnelData.wavefunction.filter((_, i) => i % 3 === 0), borderColor: '#a855f7', fill: false, tension: 0.4 },
                          { label: 'Barrier V(x)', data: tunnelData.potential.filter((_, i) => i % 3 === 0), borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', fill: true, tension: 0 }
                        ] 
                      }} 
                      type="line" 
                      title="Quantum Barrier Interaction" 
                      height={280} 
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <SimulationExplainer 
                      simulationType="Quantum Tunneling" 
                      resultData={{ transmission: tunnelData.transmission, energy }}
                      context={`Energy: ${energy}. Barrier Height: 5.0. Analysis of evanescent wave coupling.`}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                  <Typography variant="body2">Awaiting wave-packet propagation analysis...</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Schrödinger */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 3, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 24, bgcolor: 'success.main', borderRadius: 4 }} />
          Schrödinger Eigenstates
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 4, height: '100%', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800, mb: 4, display: 'block' }}>POTENTIAL GEOMETRY</Typography>
              <Box sx={{ mb: 4 }}>
                <Select 
                  fullWidth 
                  value={potential} 
                  onChange={(e) => setPotential(e.target.value)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}
                >
                  <MenuItem value="Infinite Well">Infinite Well</MenuItem>
                  <MenuItem value="Harmonic Oscillator">Harmonic Oscillator</MenuItem>
                </Select>
              </Box>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={runSchrodinger} 
                sx={{ bgcolor: '#34d399', color: '#000', '&:hover': { bgcolor: '#10b981' }, fontWeight: 900, letterSpacing: 1 }}
              >
                Solve Eigenvalues
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, minHeight: 400, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.2)' }}>
              {schData ? (
                <>
                  <Box sx={{ flex: 1 }}>
                    <QChart 
                      data={{ 
                        labels: schData.positions.filter((_, i) => i % 4 === 0).map(p => p.toFixed(1)), 
                        datasets: [
                          { label: 'Ground State', data: schData.states[0].filter((_, i) => i % 4 === 0), borderColor: '#34d399', fill: false, tension: 0.4 },
                          { label: '1st Excited', data: schData.states[1].filter((_, i) => i % 4 === 0), borderColor: '#fbbf24', fill: false, tension: 0.4 }
                        ] 
                      }} 
                      type="line" 
                      title="Energy Spectrum & Wavefunctions" 
                      height={280} 
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <SimulationExplainer 
                      simulationType="Schrödinger Eigenstates" 
                      resultData={{ potential, energies: schData.energies }}
                      context={`Potential: ${potential}. Extraction of orthogonal basis states.`}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                  <Typography variant="body2">Awaiting stationary state decomposition...</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PhysicsLab;
