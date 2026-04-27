const { Box, Typography, Paper, Grid, Button, Select, MenuItem, Fade } = MaterialUI;

function QuantumTerminal() {
    const [n, setN] = React.useState(3);
    const [target, setTarget] = React.useState(0);
    const [control, setControl] = React.useState(1);
    const [isCnot, setIsCnot] = React.useState(false);
    const [probs, setProbs] = React.useState([1, 0, 0, 0, 0, 0, 0, 0]);
    const [labels, setLabels] = React.useState(['|000⟩','|001⟩','|010⟩','|011⟩','|100⟩','|101⟩','|110⟩','|111⟩']);
    const [bloch, setBloch] = React.useState({ theta: 0, phi: 0 });
    const [history, setHistory] = React.useState([]);
    const [zoomOpen, setZoomOpen] = React.useState(false);

    const blochRef = React.useRef(null);

    React.useEffect(() => {
        const container = document.getElementById('bloch-3d');
        if(!container || blochRef.current) return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1.33, 0.1, 1000);
        camera.position.set(2, 2, 2.5);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(400, 300);
        container.appendChild(renderer.domElement);
        
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1, 48, 48),
            new THREE.MeshBasicMaterial({ color: 0x00f2ff, wireframe: true, transparent: true, opacity: 0.1 })
        );
        scene.add(sphere);
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1, 0x00f2ff);
        scene.add(arrow);
        
        blochRef.current = { renderer, arrow, scene, camera };
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            if(blochRef.current) {
                renderer.dispose();
                container.removeChild(renderer.domElement);
                blochRef.current = null;
            }
        };
    }, []);

    const updateBloch = (t, p) => {
        if(!blochRef.current) return;
        const v = new THREE.Vector3(Math.sin(t)*Math.cos(p), Math.cos(t), Math.sin(t)*Math.sin(p));
        blochRef.current.arrow.setDirection(v);
        setBloch({ theta: t, phi: p });
    };

    const exec = async (gate) => {
        const res = await fetch('/api/quantum/gate', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ gate, target, control: gate === 'CNOT' ? control : null })
        });
        const data = await res.json();
        setProbs(data.probabilities);
        setLabels(data.labels || labels);
        updateBloch(data.theta, data.phi);
        setHistory(prev => [gate, ...prev].slice(0, 5));
        setIsCnot(false);
    };

    const changeDepth = async (newN) => {
        setN(newN);
        await fetch('/api/quantum/config', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ n: newN })
        });
        exec('RESET');
    };

    const chartData = {
        labels: labels,
        datasets: [{ label: 'Probability', data: probs, backgroundColor: 'rgba(0, 242, 255, 0.5)', borderColor: '#00f2ff', borderWidth: 1 }]
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" sx={{ mb: 2 }} className="neon-text">Quantum Terminal</Typography>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="primary">REGISTER SCALE</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {[2,3,4,5].map(v => (
                                <Button key={v} variant={n === v ? "contained" : "outlined"} onClick={() => changeDepth(v)} size="small">N={v}</Button>
                            ))}
                        </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="primary">TARGET QUBIT</Typography>
                            <Select fullWidth value={target} onChange={(e) => setTarget(e.target.value)} size="small" sx={{ mt: 1 }}>
                                {[...Array(n)].map((_, i) => <MenuItem key={i} value={i}>Qubit {i}</MenuItem>)}
                            </Select>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="primary">CONTROL QUBIT</Typography>
                            <Select fullWidth value={control} onChange={(e) => setControl(e.target.value)} size="small" sx={{ mt: 1 }}>
                                {[...Array(n)].map((_, i) => <MenuItem key={i} value={i}>Qubit {i}</MenuItem>)}
                            </Select>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
                        {['H', 'X', 'Y', 'Z'].map(g => (
                            <Button key={g} variant="contained" color="secondary" onClick={() => exec(g)}>{g}</Button>
                        ))}
                        <Button variant="contained" color="primary" onClick={() => setIsCnot(true)}>CNOT</Button>
                        <Button variant="outlined" color="primary" onClick={() => exec('SUPERPOSITION')}>Σ</Button>
                        <Button variant="outlined" color="error" onClick={() => exec('RESET')}>RESET</Button>
                    </Box>

                    {isCnot && (
                        <Fade in={true}>
                            <Button variant="contained" color="warning" fullWidth sx={{ mt: 2 }} onClick={() => exec('CNOT')}>Confirm Entanglement Pair [Q{control}➔Q{target}]</Button>
                        </Fade>
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2, position: 'relative', height: 320 }}>
                    <div id="bloch-3d" style={{ height: '100%', width: '100%' }}></div>
                    <Box sx={{ position: 'absolute', bottom: 10, left: 10 }}>
                        <Typography variant="caption" sx={{ color: '#00f2ff', display: 'block' }}>θ: {bloch.theta.toFixed(3)}</Typography>
                        <Typography variant="caption" sx={{ color: '#00f2ff', display: 'block' }}>φ: {bloch.phi.toFixed(3)}</Typography>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, mt: 3, height: 280, position: 'relative' }}>
                    <Typography variant="caption" color="primary">STATE DISTRIBUTION</Typography>
                    <Box sx={{ height: 200, mt: 2 }}>
                        <EliteChart data={chartData} type="bar" onZoomClick={() => setZoomOpen(true)} />
                    </Box>
                </Paper>
            </Grid>
            <ZoomChartDialog 
                open={zoomOpen} 
                onClose={() => setZoomOpen(false)} 
                chartData={chartData} 
                title="Quantum Basis Probability Distribution" 
            />
        </Grid>
    );
}

window.QuantumTerminal = QuantumTerminal;
