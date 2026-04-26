// --- Quantum Hub Elite Core Logic ---

let scene, camera, renderer, sphere, arrow, axes;
const container = document.getElementById('bloch-canvas-container');

// --- Initialization ---

function init() {
    initBlochSphere();
    initParticleField();
    setupEventListeners();
    logTrace("Neural core sequence initialized...");
    logTrace("Awaiting synaptic signal instructions...");
}

// --- 3D Particle Field ---
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

// --- Quantum Logic Functions ---

async function applyGate(gateType) {
    logTrace(`Executing Quantum Operator: [${gateType}]`);
    try {
        const response = await fetch('/api/quantum/gate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gate: gateType })
        });
        const data = await response.json();
        updateBlochVisual(data.theta, data.phi, data.state_vector);
    } catch (err) {
        logTrace(`CRITICAL: Gate execution failure - ${err.message}`, "error");
    }
}

async function resetQuantum() {
    logTrace("Resetting wave function coordinates...");
    try {
        await fetch('/api/quantum/reset');
        updateBlochVisual(0, 0, ["(1+0j)", "(0+0j)"]);
    } catch (err) { logTrace("Reset failed", "error"); }
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

// --- Hebbian Workbench Logic ---

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
        logTrace(`Synaptic weight map updated. Projection variance stable.`);
    } catch (err) {
        logTrace(`Neural loop error: ${err.message}`, "error");
    }
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
