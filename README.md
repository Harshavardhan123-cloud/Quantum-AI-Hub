# Quantum AI Hub Elite v2

An advanced, full-stack research platform designed to explore the intersection of **Quantum Computing Logic** and **Synaptic Plasticity-driven Artificial Intelligence**.

![Elite Edition](https://img.shields.io/badge/Edition-Elite_v2-purple?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-darkgreen?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Graphics-Three.js-blue?style=for-the-badge)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue?style=for-the-badge)

## 🌌 Overview

Quantum AI Hub Elite v2 provides a high-fidelity environment for simulating quantum gates and unsupervised synaptic learning rules. It bridges the gap between qubit operations and neural network optimization through persistent state management and real-time 3D visualizations.

## 🚀 Features

### 1. Quantum Logic Terminal
*   **Unitary Matrix Operations**: Apply fundamental quantum gates: **H** (Hadamard), **X**, **Y**, **Z**, **S**, and **T**.
*   **3D Bloch Sphere**: Real-time rendering of the qubit state vector $|\psi\rangle$ on a unit sphere using **Three.js**.
*   **State Analysis**: Instant mathematical representation update of the probability amplitudes.

### 2. Synaptic Plasticity Workbench
*   **Hebbian Engines**: Simulation of neural learning via multiple unsupervised rules:
    *   **Oja's Rule**: Stabilized Hebbian learning for simple feature extraction.
    *   **Sanger's GHA**: Generalized Hebbian Algorithm for principal component analysis.
    *   **BCM Rule**: Bienenstock-Cooper-Munro rule for modeling cortical selectivity.
*   **Weight Dynamics**: Visual representation of firing synapses and adaptive weight matrices.

### 3. Persistent Data & Logging
*   **SQLite Integration**: Full historical record of every simulation stored in `quantum_hub.db`.
*   **System Audit**: Comprehensive internal logging system tracking neural core activity.
*   **Frontend History Viewer**: Retrieve and inspect past simulation vectors directly from the browser.

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+), Three.js, CSS3 (Glassmorphism), GSAP.
- **Backend**: Python 3.9+, FastAPI, SQLAlchemy.
- **AI/Math**: NumPy, SciPy (for matrix operations).
- **Database**: SQLite3.

## 🏃 Getting Started

### Prerequisites
- Python 3.9 or higher
- Pip (Python Package Manager)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Harshavardhan123-cloud/Quantum-AI-Hub.git
   cd Quantum-AI-Hub
   ```
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy numpy scikit-learn
   ```
3. Run the platform:
   ```bash
   cd backend
   python3 -m uvicorn main:app --reload
   ```
4. Open your browser and navigate to `http://localhost:8000`.

## 📜 License
This project is for research and educational purposes.
