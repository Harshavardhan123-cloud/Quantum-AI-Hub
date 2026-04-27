// --- Quantum Hub Elite Core Logic ---

let scene, camera, renderer, sphere, arrow, axes;
let latentChart, convergenceChart, quantumProbChart;
const container = document.getElementById('bloch-canvas-container');
const simulationPoints = [];

// --- Internal State (Local Database Simulation) ---
let simulationHistory = JSON.parse(localStorage.getItem('quantum_ai_history') || '[]');

function saveToVirtualDB(type, input, result, description) {
    const entry = {
        timestamp: new Date().toISOString(),
        type, input, result, description
    };
    simulationHistory.unshift(entry);
    if (simulationHistory.length > 50) simulationHistory.pop();
    localStorage.setItem('quantum_ai_history', JSON.stringify(simulationHistory));
    logTrace(`Data persisted to Virtual DB: ${type}`);
}

// --- Initialization ---

function init() {
    const page = document.body.id;
    initParticleField();
    
    if (page === 'page-quantum') {
        initBlochSphere();
        initCharts();
        updateQubitCount();
        setupEventListeners();
        logTrace("Quantum Terminal Ready.");
    } else if (page === 'page-hebbian') {
        initCharts();
        setupHebbianMatrix();
        logTrace("Hebbian Workbench Ready.");
    } else if (page === 'page-history') {
        fetchHistory();
        logTrace("Systems Logs Active.");
    }
}

function setupHebbianMatrix() {
    const matrix = document.getElementById('weight-matrix');
    if(!matrix) return;
    matrix.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'weight-cell';
        matrix.appendChild(cell);
    }
}

// --- Pulse Particle Field ---
function initParticleField() {
    const pContainer = document.getElementById('particle-container');
    // Note: Simple CSS/JS particles for background depth
    for(let i=0; i<50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        Object.assign(p.style, {
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: 'white',
            opacity: Math.random() * 0.3,
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
        });
        pContainer.appendChild(p);
    }
}

// --- Three.js Bloch Sphere (Enhanced) ---

function initBlochSphere() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(2.5, 2.5, 3.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const light = new THREE.PointLight(0x00f2ff, 2, 100);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    // Bloch Sphere
    const geometry = new THREE.SphereGeometry(1, 48, 48);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00f2ff,
        transparent: true,
        opacity: 0.1,
        wireframe: true,
        emissive: 0x002233
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Glow Effect (Inner Sphere)
    const innerGeo = new THREE.SphereGeometry(0.98, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x001122, transparent: true, opacity: 0.3 });
    scene.add(new THREE.Mesh(innerGeo, innerMat));

    // Axes with Labels
    createAxis(new THREE.Vector3(1.2, 0, 0), 0xff3333); // X
    createAxis(new THREE.Vector3(0, 1.2, 0), 0x33ff33); // Y
    createAxis(new THREE.Vector3(0, 0, 1.2), 0x3333ff); // Z

    // State Vector
    const dir = new THREE.Vector3(0, 1, 0);
    arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 1, 0x00f2ff, 0.15, 0.08);
    scene.add(arrow);

    animate();
}

function createAxis(to, color) {
    const points = [new THREE.Vector3(0, 0, 0), to];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, opacity: 0.5, transparent: true });
    scene.add(new THREE.Line(geo, mat));
}

function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.002;
    renderer.render(scene, camera);
}

// --- Quantum Logic (Ported from Python) ---
const QuantumGHA = {
    state: [ { re: 1, im: 0 }, { re: 0, im: 0 } ], // |0>

    applyGate(gateType) {
        const H = [[ {re: 1/Math.sqrt(2), im: 0}, {re: 1/Math.sqrt(2), im: 0} ], [ {re: 1/Math.sqrt(2), im: 0}, {re: -1/Math.sqrt(2), im: 0} ]];
        const X = [[ {re: 0, im: 0}, {re: 1, im: 0} ], [ {re: 1, im: 0}, {re: 0, im: 0} ]];
        const Y = [[ {re: 0, im: 0}, {re: 0, im: -1} ], [ {re: 0, im: 1}, {re: 0, im: 0} ]];
        const Z = [[ {re: 1, im: 0}, {re: 0, im: 0} ], [ {re: 0, im: 0}, {re: -1, im: 0} ]];
        
        let gate = (gateType === 'H') ? H : (gateType === 'X') ? X : (gateType === 'Y') ? Y : Z;
        
        // Matrix Multiplication
        let newState = [
            this.add(this.mul(gate[0][0], this.state[0]), this.mul(gate[0][1], this.state[1])),
            this.add(this.mul(gate[1][0], this.state[0]), this.mul(gate[1][1], this.state[1]))
        ];
        
        this.state = newState;
        return this.getBloch();
    },

    // Complex Helpers
    add: (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
    mul: (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }),
    
    getBloch() {
        const alpha = Math.sqrt(this.state[0].re**2 + this.state[0].im**2);
        const theta = 2 * Math.acos(Math.min(1, alpha));
        const phi = Math.atan2(this.state[1].im, this.state[1].re) - Math.atan2(this.state[0].im, this.state[0].re);
        return { theta, phi };
    }
};

async function executeGate(gateType) {
    const target = parseInt(document.getElementById('target-qubit').value);
    const controlEl = document.getElementById('control-qubit');
    const control = (gateType === 'CNOT' && controlEl) ? parseInt(controlEl.value) : null;
    
    if (gateType === 'CNOT' && target === control) {
        logTrace("Control/Target collision.", "error"); return;
    }

    logTrace(`Projecting ${gateType} on Q${target}${control !== null ? ' (C:'+control+')' : ''}`);
    
    try {
        const response = await fetch('/api/quantum/gate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gate: gateType, target: target, control: control })
        });
        const data = await response.json();
        
        updateBlochVisual(data.theta, data.phi, ["|ψ⟩", `Target: Q${target}`]);
        updateQuantumChart(data.probabilities, data.labels);
        addGateToCircuit(gateType, target, control);
        
        if (gateType === 'CNOT') {
            document.getElementById('control-field').style.display = 'none';
            document.getElementById('exec-cnot').style.display = 'none';
        }
    } catch (err) { logTrace(`Op Error: ${err.message}`, "error"); }
}

function showControlField() {
    document.getElementById('control-field').style.display = 'block';
    document.getElementById('exec-cnot').style.display = 'block';
}

function updateSelectors(n) {
    // Handled in universal logic below
}

function updateQuantumChart(probs, labels) {
    if (!quantumProbChart) return;
    
    // For large N, we might want to sample or use a different visualization
    // But for 32 states (N=5), Chart.js can still handle it if the labels are small
    quantumProbChart.data.labels = labels;
    quantumProbChart.data.datasets[0].data = probs;
    
    // Adjust bar thickness for density
    quantumProbChart.data.datasets[0].barThickness = probs.length > 8 ? 10 : 30;
    
    quantumProbChart.update();
}

// --- Universal Virtual Select Logic ---
function toggleVirtualSelect(id) {
    const el = document.getElementById(id + '-options');
    document.querySelectorAll('.vs-options').forEach(opt => { if(opt !== el) opt.classList.remove('active'); });
    if(el) el.classList.toggle('active');
}

function selectVirtualOption(val, label, parentId) {
    const parent = document.getElementById(parentId);
    const hidden = document.getElementById(parentId.replace('-vs', '-qubit'));
    if (hidden) hidden.value = val;
    
    const depthHidden = document.getElementById('qubit-depth');
    if (parentId === 'depth-vs' && depthHidden) depthHidden.value = val;
    
    parent.querySelector('.vs-selected').innerText = label;
    parent.querySelectorAll('.vs-option').forEach(el => el.classList.remove('active'));
    parent.querySelector('.vs-options').classList.remove('active');
    
    if (parentId === 'depth-vs') updateQubitCount();
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('.virtual-select')) {
        document.querySelectorAll('.vs-options').forEach(opt => opt.classList.remove('active'));
    }
});

function updateSelectors(n) {
    const tOpts = document.getElementById('target-vs-options');
    const cOpts = document.getElementById('control-vs-options');
    if (!tOpts || !cOpts) return;
    tOpts.innerHTML = cOpts.innerHTML = '';
    for(let i=0; i<n; i++) {
        tOpts.innerHTML += `<div class="vs-option" onclick="selectVirtualOption(${i}, 'Qubit ${i}', 'target-vs')">Qubit ${i}</div>`;
        cOpts.innerHTML += `<div class="vs-option" onclick="selectVirtualOption(${i}, 'Qubit ${i}', 'control-vs')">Qubit ${i}</div>`;
    }
}

async function updateQubitCount() {
    const n = parseInt(document.getElementById('qubit-depth').value);
    logTrace(`Scaling Hilbert register to N=${n} qubits...`);
    
    try {
        await fetch('/api/quantum/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ n: n })
        });
        
        // Regenerate Wires
        const board = document.getElementById('circuit-board');
        board.innerHTML = '';
        for(let i=0; i<n; i++) {
            const wire = document.createElement('div');
            wire.className = 'circuit-wire';
            wire.id = `circuit-wire-${i}`;
            wire.setAttribute('data-q', `Q${i}`);
            board.appendChild(wire);
        }
        
        resetQuantum();
        updateSelectors(n);
        logTrace(`System scale complete. $2^n$ basis states initialized.`);
    } catch (err) {
        logTrace("Scale error: " + err.message, "error");
    }
}

function addGateToCircuit(gate, target, control) {
    const wire = document.getElementById(`circuit-wire-${target}`);
    if (!wire) return;
    const gateEl = document.createElement('div');
    gateEl.className = 'gate-node';
    gateEl.innerText = gate;
    if (gate === 'CNOT') gateEl.style.borderColor = 'var(--accent-tertiary)';
    wire.appendChild(gateEl);

    if (control !== null) {
        const cWire = document.getElementById(`circuit-wire-${control}`);
        if(cWire) {
            const dot = document.createElement('div');
            dot.className = 'gate-node';
            dot.style.borderRadius = '50%';
            dot.style.width = '12px'; dot.style.height = '12px';
            dot.innerText = 'C';
            cWire.appendChild(dot);
        }
    }
}

async function resetQuantum() {
    logTrace("Resetting wave function coordinates...");
    QuantumGHA.state = [ { re: 1, im: 0 }, { re: 0, im: 0 } ];
    updateBlochVisual(0, 0, ["(1.00)", "(0.00)"]);
}

function updateBlochVisual(theta, phi, vector) {
    if (arrow) arrow.setDirection(new THREE.Vector3(Math.sin(theta)*Math.cos(phi), Math.cos(theta), Math.sin(theta)*Math.sin(phi)));
    
    document.getElementById('vector-display').innerHTML = `Basis: <span class="val">|ψ⟩</span> Type: <span class="val">${vector[1]}</span>`;
    document.getElementById('coords-display').innerHTML = `Polar (θ): <span class="val">${theta.toFixed(3)}</span>, Phase (φ): <span class="val">${phi.toFixed(3)}</span>`;
}

// --- Hebbian Logic (Ported from Python) ---
const HebbianJS = {
    weights: Array.from({length: 5}, () => Array.from({length: 10}, () => Math.random() * 0.1)),
    
    process(input, rule) {
        // Simplified Oja's for JS port
        let projection = this.weights.map(w => w.reduce((sum, val, i) => sum + val * input[i], 0));
        
        // Weight Update (Mock Learning to prevent overhead in JS)
        this.weights = this.weights.map((w, i) => w.map((val, j) => val + 0.01 * (projection[i] * input[j] - projection[i]**2 * val)));
        
        return {
            projection: projection,
            weight_stats: this.weights.map(w => Math.sqrt(w.reduce((s, v) => s + v*v, 0) / w.length))
        };
    }
};

async function runAnalysis() {
    const rule = document.getElementById('rule-select').value;
    logTrace(`Processing neural input via [${rule.toUpperCase()}] rule...`);
    
    const inputData = Array.from({ length: 10 }, () => Math.random() * 2 - 1);

    try {
        const response = await fetch('/api/analyze/hebbian', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: inputData, rule: rule })
        });
        const result = await response.json();
        
        updateHebbianUI(result);
        updateCharts(result.projection, result.weight_stats);
        logTrace(`Synaptic weight map updated. Projection variance stable.`);
        fetchHistory(); 
    } catch (err) {
        logTrace(`Neural loop error: ${err.message}`, "error");
    }
}

async function runBatchAnalysis() {
    const rule = document.getElementById('rule-select').value;
    logTrace(`Executing Batch Simulation [20 samples] via [${rule.toUpperCase()}]...`);

    try {
        const response = await fetch('/api/analyze/hebbian_batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ samples: 20, rule: rule })
        });
        const data = await response.json();
        
        data.results.forEach((res, index) => {
            setTimeout(() => {
                updateHebbianUI(res);
                updateCharts(res.projection, res.weights);
                if (index === data.results.length - 1) fetchHistory();
            }, index * 50);
        });
        
        logTrace(`Batch sequence complete. Latent space clusters converging.`);
    } catch (err) {
        logTrace(`Batch error: ${err.message}`, "error");
    }
}

function initCharts() {
    const latentEl = document.getElementById('latentChart');
    const convergenceEl = document.getElementById('convergenceChart');
    
    if (!latentEl || !convergenceEl) {
        console.error("Chart canvases not found");
        return;
    }

    const ctxL = latentEl.getContext('2d');
    latentChart = new Chart(ctxL, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Latent Space Activity',
                data: [],
                backgroundColor: 'rgba(0, 242, 255, 0.6)',
                borderColor: '#00f2ff',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { color: '#222' }, ticks: { color: '#888' }, title: { display: true, text: 'Latent X', color: '#555' } },
                y: { grid: { color: '#222' }, ticks: { color: '#888' }, title: { display: true, text: 'Latent Y', color: '#555' } }
            },
            plugins: { legend: { labels: { color: '#ccc' } } }
        }
    });

    const ctxC = convergenceEl.getContext('2d');
    convergenceChart = new Chart(ctxC, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Synaptic Stability (Convergence)',
                data: [],
                borderColor: '#7000ff',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(112, 0, 255, 0.1)',
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: false },
                y: { grid: { color: '#222' }, ticks: { color: '#888' }, title: { display: true, text: 'Stability Index', color: '#555' } }
            },
            plugins: { legend: { labels: { color: '#ccc' } } }
        }
    });

    const ctxQ = document.getElementById('quantumProbChart').getContext('2d');
    quantumProbChart = new Chart(ctxQ, {
        type: 'bar',
        data: {
            labels: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
            datasets: [{
                label: 'State Probability Distribution',
                data: [1, 0, 0, 0],
                backgroundColor: 'rgba(0, 242, 255, 0.5)',
                borderColor: '#00f2ff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 1, grid: { color: '#222' }, ticks: { color: '#888' } },
                x: { grid: { display: false }, ticks: { color: '#888' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function updateCharts(projection, weights) {
    // Latent Space (Scatter)
    latentChart.data.datasets[0].data.push({ x: projection[0], y: projection[1] });
    if (latentChart.data.datasets[0].data.length > 50) latentChart.data.datasets[0].data.shift();
    latentChart.update('none');

    // Convergence (Line)
    const stability = weights.reduce((a, b) => a + b, 0) / weights.length;
    convergenceChart.data.labels.push("");
    convergenceChart.data.datasets[0].data.push(stability);
    if (convergenceChart.data.datasets[0].data.length > 30) {
        convergenceChart.data.labels.shift();
        convergenceChart.data.datasets[0].data.shift();
    }
    convergenceChart.update('none');
}

function switchHebbianTab(tab) {
    const views = ['matrix-view', 'latent-view', 'convergence-view'];
    const tabs = ['tab-matrix', 'tab-latent', 'tab-convergence'];
    
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = 'none';
    });
    
    tabs.forEach(t => {
        const el = document.getElementById(t);
        if (el) el.classList.remove('active');
    });
    
    const activeView = document.getElementById(`${tab}-view`);
    if (activeView) activeView.style.display = 'block';
    
    const activeTab = document.getElementById(`tab-${tab}`);
    if (activeTab) activeTab.classList.add('active');

    // Force chart updates after making them visible
    if (tab === 'latent' && latentChart) latentChart.resize();
    if (tab === 'convergence' && convergenceChart) convergenceChart.resize();
}

async function fetchHistory() {
    try {
        const response = await fetch('/api/logs');
        const logs = await response.json();
        const body = document.getElementById('history-body');
        body.innerHTML = '';
        
        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
                <td><span class="badge ${log.type}">${log.type.toUpperCase()}</span></td>
                <td>${log.description}</td>
                <td class="code">${JSON.stringify(log.result_data).substring(0, 30)}...</td>
            `;
            body.appendChild(row);
        });
    } catch (err) { console.error("History fetch error", err); }
}

function updateHebbianUI(data) {
    // Update Stats Bars
    const variance = Math.max(0, Math.min(100, Math.abs(data.projection[0]) * 100));
    const activity = Math.max(0, Math.min(100, data.weight_stats[0] * 500));
    
    document.getElementById('variance-bar').style.width = variance + '%';
    document.getElementById('activity-bar').style.width = activity + '%';

    // Update Matrix Cells with "Firing" Animation
    const cells = document.querySelectorAll('.weight-cell');
    cells.forEach((cell, i) => {
        const delay = Math.random() * 500;
        setTimeout(() => {
            const intensity = Math.random();
            cell.style.background = intensity > 0.7 ? 'var(--accent-primary)' : '#111';
            cell.style.boxShadow = intensity > 0.7 ? '0 0 10px var(--accent-primary)' : 'none';
            
            setTimeout(() => {
                cell.style.background = `rgba(112, 0, 255, ${intensity * 0.3})`;
                cell.style.boxShadow = 'none';
            }, 300);
        }, delay);
    });
}

// --- Utility Functions ---

function logTrace(msg, type = "info") {
    const log = document.getElementById('trace-log');
    const entry = document.createElement('div');
    entry.style.color = type === "error" ? "var(--accent-tertiary)" : "#0f0";
    entry.innerHTML = `> ${msg}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function setupEventListeners() {
    // Sliders
    document.getElementById('theta-slider').addEventListener('input', (e) => {
        const theta = parseFloat(e.target.value);
        const phi = parseFloat(document.getElementById('phi-slider').value);
        updateBlochVisual(theta, phi, ["manual", "manual"]);
    });

    document.getElementById('phi-slider').addEventListener('input', (e) => {
        const phi = parseFloat(e.target.value);
        const theta = parseFloat(document.getElementById('theta-slider').value);
        updateBlochVisual(theta, phi, ["manual", "manual"]);
    });

    // Matrix Initial Grid
    const matrix = document.getElementById('weight-matrix');
    if(!matrix) return;
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'weight-cell';
        matrix.appendChild(cell);
    }
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Init on Load
window.addEventListener('DOMContentLoaded', () => {
    init();
    fetchHistory();
});
window.addEventListener('resize', () => {
    if (renderer && container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});
