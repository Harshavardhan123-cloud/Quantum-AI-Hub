// --- Quantum Hub Elite Core Logic ---

let scene, camera, renderer, sphere, arrow, axes;
const container = document.getElementById('bloch-canvas-container');

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
    initBlochSphere();
    initParticleField();
    setupEventListeners();
    logTrace("Neural core sequence initialized...");
    logTrace("Awaiting synaptic signal instructions...");
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

async function applyGate(gateType) {
    logTrace(`Executing Quantum Operator: [${gateType}]`);
    const { theta, phi } = QuantumGHA.applyGate(gateType);
    updateBlochVisual(theta, phi, [`(${QuantumGHA.state[0].re.toFixed(2)})`, `(${QuantumGHA.state[1].re.toFixed(2)})`]);
    saveToVirtualDB("quantum", { gate: gateType }, { theta, phi }, `Applied ${gateType} Gate`);
}

async function resetQuantum() {
    logTrace("Resetting wave function coordinates...");
    QuantumGHA.state = [ { re: 1, im: 0 }, { re: 0, im: 0 } ];
    updateBlochVisual(0, 0, ["(1.00)", "(0.00)"]);
}

function updateBlochVisual(theta, phi, vector) {
    // Smooth transition for the arrow
    const x = Math.sin(theta) * Math.cos(phi);
    const z = Math.sin(theta) * Math.sin(phi);
    const y = Math.cos(theta);

    // Using simple lerping or setDirection
    arrow.setDirection(new THREE.Vector3(x, y, z));
    
    // Update Readouts
    document.getElementById('vector-display').innerText = `|ψ⟩ = ${vector[0].split('+')[0]} |0⟩ + ${vector[1].split('+')[0]} |1⟩`;
    document.getElementById('coords-display').innerText = `θ: ${theta.toFixed(3)}, φ: ${phi.toFixed(3)}`;
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
    const result = HebbianJS.process(inputData, rule);
    
    updateHebbianUI(result);
    logTrace(`Synaptic weight map updated. Projection variance stable.`);
    saveToVirtualDB("hebbian", { vector: inputData, rule }, result, "Hebbian Analysis");
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
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    if (renderer && container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});
