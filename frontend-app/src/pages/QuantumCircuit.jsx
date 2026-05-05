import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Paper, Button, Select, MenuItem, Fade, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import * as THREE from 'three';
import QChart from '../components/QChart';
import SectionTitle from '../components/SectionTitle';
import SimulationExplainer from '../components/SimulationExplainer';
import { motion } from 'framer-motion';

const QuantumCircuit = () => {
  const [n, setN] = useState(3);
  const [target, setTarget] = useState(0);
  const [control, setControl] = useState(1);
  const [probs, setProbs] = useState(Array(Math.pow(2, n)).fill(0).map((_, i) => i === 0 ? 1 : 0));
  const [labels, setLabels] = useState(Array.from({ length: Math.pow(2, n) }).map((_, i) => `|${i.toString(2).padStart(n, '0')}⟩`));
  const [history, setHistory] = useState([]);
  const [blochState, setBlochState] = useState({ theta: 0, phi: 0 });
  const [selectedGate, setSelectedGate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const blochRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || blochRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.0, 1.2, 2.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00f2ff, 
      transparent: true, 
      opacity: 0.15, 
      shininess: 100 
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00f2ff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.2 
    });
    const wireframe = new THREE.Mesh(sphereGeometry, wireframeMaterial);
    scene.add(wireframe);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Axes
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
    const addAxis = (x, y, z) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-x, -y, -z), new THREE.Vector3(x, y, z)]);
      scene.add(new THREE.Line(geometry, axisMaterial));
    };
    addAxis(1.3, 0, 0);
    addAxis(0, 1.3, 0);
    addAxis(0, 0, 1.3);

    // Arrow
    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      1,
      0x00f2ff,
      0.15,
      0.08
    );
    scene.add(arrow);

    blochRef.current = { renderer, arrow, scene, camera };

    const animate = () => {
      if (blochRef.current) {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && blochRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        if (w === 0 || h === 0) return;
        blochRef.current.camera.aspect = w / h;
        blochRef.current.camera.updateProjectionMatrix();
        blochRef.current.renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (blochRef.current) {
        renderer.dispose();
        containerRef.current?.removeChild(renderer.domElement);
        blochRef.current = null;
      }
    };
  }, []);

  const executeGate = async (gate) => {
    try {
      const response = await fetch('/api/quantum/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gate,
          target,
          control: gate === 'CNOT' ? control : null
        })
      });
      const data = await response.json();
      
      setProbs(data.probabilities);
      setLabels(data.labels || labels);
      setBlochState({ theta: data.theta, phi: data.phi });

      if (blochRef.current) {
        const direction = new THREE.Vector3(
          Math.sin(data.theta) * Math.cos(data.phi),
          Math.cos(data.theta),
          Math.sin(data.theta) * Math.sin(data.phi)
        );
        blochRef.current.arrow.setDirection(direction);
      }

      if (gate !== 'RESET') {
        setHistory(prev => [...prev, { gate, target, control: gate === 'CNOT' ? control : null }].slice(-15));
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Gate execution failed:", err);
    }
  };

  const showGateDetail = (gateInfo) => {
    setSelectedGate(gateInfo);
    setIsDialogOpen(true);
  };

  const gateFormulas = {
    'H': {
      name: 'Hadamard Gate',
      formula: 'H = 1/√2 [[1, 1], [1, -1]]',
      desc: 'Creates an equal superposition of |0⟩ and |1⟩. Maps Z-basis to X-basis.',
      matrix: [[ '1/√2', '1/√2' ], [ '1/√2', '-1/√2' ]]
    },
    'X': {
      name: 'Pauli-X (NOT)',
      formula: 'X = [[0, 1], [1, 0]]',
      desc: 'Quantum equivalent of the NOT gate. Flips |0⟩ to |1⟩ and vice versa.',
      matrix: [[ 0, 1 ], [ 1, 0 ]]
    },
    'Y': {
      name: 'Pauli-Y',
      formula: 'Y = [[0, -i], [i, 0]]',
      desc: 'A bit and phase flip. Rotates the state around the Y-axis of the Bloch sphere.',
      matrix: [[ 0, '-i' ], [ 'i', 0 ]]
    },
    'Z': {
      name: 'Pauli-Z (Phase Flip)',
      formula: 'Z = [[1, 0], [0, -1]]',
      desc: 'Leaves |0⟩ unchanged and flips the phase of |1⟩ to -|1⟩.',
      matrix: [[ 1, 0 ], [ 0, -1 ]]
    },
    'CNOT': {
      name: 'Controlled-NOT',
      formula: 'CNOT = |0⟩⟨0|⊗I + |1⟩⟨1|⊗X',
      desc: 'Flips the target qubit if and only if the control qubit is |1⟩. Essential for entanglement.',
      matrix: [[ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, 0, 1 ], [ 0, 0, 1, 0 ]]
    },
    'MEASURE': {
      name: 'Measurement',
      formula: 'P(i) = |⟨i|ψ⟩|²',
      desc: 'Collapses the quantum state into a classical basis state according to Born\'s rule.',
      matrix: null
    }
  };

  const changeRegisterSize = async (newN) => {
    setN(newN);
    setHistory([]);
    try {
      await fetch('/api/quantum/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: newN })
      });
      executeGate('RESET');
    } catch (e) { console.error(e); }
  };

  const { theta, phi } = blochState;

  return (
    <Box>
      <SectionTitle icon="⚛️" title="Quantum Circuit Builder" subtitle="N-qubit register simulation with unitary gate operations and state diagnostics" />
      <Grid container spacing={5}>
        {/* Left: Controls */}
        <Grid item xs={12} xl={4}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <Paper sx={{ p: 4, position: 'relative', height: '100%', border: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #a855f7, #00f2ff)' }} />
              <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 4, letterSpacing: 2, color: 'rgba(255,255,255,0.9)' }}>
                GATE CONSOLE
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, mb: 1, display: 'block' }}>SYSTEM SCALE (n Qubits → 2ⁿ States)</Typography>
                <Grid container spacing={1}>
                  {[2,3,4,5,6].map(val => (
                    <Grid item xs={6} key={val}>
                      <Button 
                        fullWidth
                        onClick={() => changeRegisterSize(val)}
                        variant={n === val ? "contained" : "outlined"}
                        size="small"
                        sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          py: 1,
                          borderRadius: 2,
                          borderWidth: 2,
                          borderColor: n === val ? 'primary.main' : 'rgba(255,255,255,0.05)',
                          bgcolor: n === val ? 'primary.main' : 'transparent',
                          color: n === val ? '#000' : '#fff',
                          '&:hover': { borderWidth: 2, bgcolor: n === val ? 'primary.main' : 'rgba(255,255,255,0.05)' }
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.75rem' }}>n = {val}</Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.7 }}>{Math.pow(2, val)} States</Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, mb: 1, display: 'block' }}>TARGET QUBIT</Typography>
                  <Select 
                    fullWidth 
                    value={target} 
                    onChange={(e) => setTarget(e.target.value)}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}
                  >
                    {Array.from({ length: n }).map((_, i) => <MenuItem key={i} value={i}>Qubit {i}</MenuItem>)}
                  </Select>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, mb: 1, display: 'block' }}>CONTROL QUBIT</Typography>
                  <Select 
                    fullWidth 
                    value={control} 
                    onChange={(e) => setControl(e.target.value)}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}
                  >
                    {Array.from({ length: n }).map((_, i) => <MenuItem key={i} value={i}>Qubit {i}</MenuItem>)}
                  </Select>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                {['H', 'X', 'Y', 'Z'].map(gate => (
                  <Grid item xs={6} key={gate}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => executeGate(gate)}
                      sx={{ bgcolor: 'secondary.main', color: '#fff', '&:hover': { bgcolor: 'secondary.dark' }, fontWeight: 900 }}
                    >
                      {gate}
                    </Button>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    onClick={() => executeGate('CNOT')}
                    sx={{ fontWeight: 900, mb: 1 }}
                  >
                    CNOT
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={() => executeGate('MEASURE')}
                    sx={{ color: 'primary.main', borderColor: 'primary.main', fontWeight: 800 }}
                  >
                    Σ ALL
                  </Button>
                </Grid>
              </Grid>

              <Button 
                fullWidth 
                sx={{ mt: 4, color: 'error.main', opacity: 0.6, fontSize: '0.7rem' }}
                onClick={() => executeGate('RESET')}
              >
                FACTORY RESET
              </Button>
            </Paper>
          </motion.div>
        </Grid>

        {/* Right: Results */}
        <Grid item xs={12} xl={8}>
          <Grid container spacing={5}>
            {/* Top Row: Circuit Trace */}
            <Grid item xs={12}>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Paper sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', minHeight: 300, borderRadius: 4 }}>
                  <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 900, mb: 4, display: 'block', letterSpacing: 2 }}>
                    QUANTUM CIRCUIT TRACE (n={n} Qubits | 2ⁿ={Math.pow(2, n)} States)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 2, overflowX: 'auto' }}>
                    {Array.from({ length: n }).map((_, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 900, minWidth: 50 }}>Q{i}</Typography>
                        <Box sx={{ height: '2px', flex: 1, bgcolor: 'rgba(255,255,255,0.15)', position: 'relative' }}>
                          <Box sx={{ position: 'absolute', top: -10, left: 0, display: 'flex', gap: 1 }}>
                            {history.filter(h => h.target === i || h.control === i).map((h, idx) => (
                              <Chip 
                                key={idx} 
                                label={h.gate} 
                                size="medium" 
                                onClick={() => showGateDetail(h)}
                                sx={{ 
                                  height: 32, 
                                  px: 1,
                                  fontSize: '0.8rem', 
                                  bgcolor: h.gate === 'CNOT' ? 'primary.main' : 'secondary.main',
                                  color: '#fff',
                                  fontWeight: 900,
                                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                  cursor: 'help',
                                  '&:hover': { transform: 'scale(1.1)', filter: 'brightness(1.2)' }
                                }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Bottom Row: Diagnostics - Now Full Width and Enlarged */}
            <Grid item xs={12}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Paper sx={{ p: 5, height: 750, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6 }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Orbitron', color: 'primary.main', fontWeight: 900, mb: 4, display: 'block', letterSpacing: 4, textAlign: 'center' }}>BLOCH SPHERE ANALYSIS (Q{target})</Typography>
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 4, mb: 3 }}>
                    <Box ref={containerRef} sx={{ width: '100%', height: 550, position: 'relative' }} />
                  </Box>
                  <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <Typography variant="h6" sx={{ color: 'grey.500', fontFamily: 'Fira Code' }}>THETA (θ): {theta.toFixed(4)} rad</Typography>
                    <Typography variant="h6" sx={{ color: 'grey.500', fontFamily: 'Fira Code' }}>PHI (φ): {phi.toFixed(4)} rad</Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Paper sx={{ p: 5, height: 750, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6 }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Orbitron', color: 'primary.main', fontWeight: 900, mb: 4, display: 'block', letterSpacing: 4, textAlign: 'center' }}>STATE PROBABILITY DISTRIBUTION</Typography>
                  <Box sx={{ flex: 1, bgcolor: 'rgba(0,0,0,0.3)', p: 4, borderRadius: 4, mb: 3 }}>
                    <QChart 
                      data={{ 
                        labels: Array.from({ length: Math.pow(2, n) }).map((_, i) => `|${i.toString(2).padStart(n, '0')}⟩`), 
                        datasets: [{ 
                          label: 'Probability Density', 
                          data: probs, 
                          backgroundColor: 'rgba(0, 242, 255, 0.6)', 
                          borderColor: '#00f2ff', 
                          borderWidth: 3,
                          borderRadius: 8
                        }] 
                      }} 
                      type="bar" 
                      title="Quantum State Probability Vector" 
                      height={500} 
                    />
                  </Box>
                  <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                    <SimulationExplainer 
                      simulationType="Quantum Circuit Builder" 
                      resultData={{ probabilities: probs, depth: history.length, qubits: n }}
                      context={`Register: ${n} qubits. Gates: ${history.map(h => h.gate).join(', ')}.`}
                    />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Gate Detail Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{ 
          sx: { 
            bgcolor: 'rgba(10, 10, 20, 0.95)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(0, 242, 255, 0.2)',
            borderRadius: 4,
            minWidth: 400
          } 
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Orbitron', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 2 }}>
          🚀 {selectedGate && gateFormulas[selectedGate.gate]?.name}
        </DialogTitle>
        <DialogContent>
          {selectedGate && (
            <Box>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 3 }}>
                {gateFormulas[selectedGate.gate]?.desc}
              </Typography>
              
              <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
              
              <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800, mb: 1, display: 'block' }}>UNITARY OPERATOR (U)</Typography>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'rgba(0,0,0,0.4)', 
                borderRadius: 2, 
                fontFamily: 'Fira Code', 
                fontSize: '0.9rem',
                color: '#fff',
                textAlign: 'center',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                {gateFormulas[selectedGate.gate]?.formula}
              </Box>

              {gateFormulas[selectedGate.gate]?.matrix && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800, mb: 2, display: 'block' }}>MATRIX REPRESENTATION</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${gateFormulas[selectedGate.gate].matrix[0].length}, 1fr)`, gap: 1 }}>
                    {gateFormulas[selectedGate.gate].matrix.flat().map((val, i) => (
                      <Box key={i} sx={{ p: 1, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'Fira Code' }}>{val}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 242, 255, 0.05)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>APPLICATION CONTEXT:</Typography>
                <Typography variant="body2" sx={{ color: 'grey.300', fontSize: '0.75rem' }}>
                  Target: Qubit {selectedGate.target}
                  {selectedGate.control !== null && ` | Control: Qubit ${selectedGate.control}`}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsDialogOpen(false)} variant="contained" fullWidth sx={{ borderRadius: 2 }}>DISMISS</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuantumCircuit;
