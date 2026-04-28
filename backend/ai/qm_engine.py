"""
Quantum Mechanics Engine
Heisenberg uncertainty, Pauli spin matrices, harmonic oscillator, Hamiltonian eigenvalue decomposition.
"""
import numpy as np
from typing import List, Dict

class QMEngine:
    # Pauli Matrices
    SIGMA_X = np.array([[0, 1], [1, 0]], dtype=complex)
    SIGMA_Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
    SIGMA_Z = np.array([[1, 0], [0, -1]], dtype=complex)
    IDENTITY = np.eye(2, dtype=complex)
    
    @staticmethod
    def heisenberg_uncertainty(delta_x_range: int = 50) -> Dict:
        """
        Compute Heisenberg uncertainty relation: Δx · Δp ≥ ℏ/2
        Returns paired values showing the fundamental limit.
        """
        hbar = 1.0  # Natural units
        dx_values = np.linspace(0.1, 5.0, delta_x_range)
        dp_min = hbar / (2 * dx_values)  # Minimum Δp for given Δx
        
        # Gaussian wave packet: achieves minimum uncertainty
        dp_gaussian = hbar / (2 * dx_values)
        
        # A non-minimum uncertainty state (e.g., square well)
        dp_spread = hbar / dx_values + 0.2 * np.random.random(delta_x_range)
        
        product_min = dx_values * dp_min
        product_spread = dx_values * dp_spread
        
        return {
            "delta_x": dx_values.tolist(),
            "delta_p_minimum": dp_min.tolist(),
            "delta_p_spread": dp_spread.tolist(),
            "product_minimum": product_min.tolist(),
            "product_spread": product_spread.tolist(),
            "hbar_over_2": float(hbar / 2),
            "description": "Heisenberg Uncertainty Principle: position-momentum complementarity"
        }
    
    @staticmethod
    def pauli_spin_analysis(state_theta: float = 0.0, state_phi: float = 0.0) -> Dict:
        """
        Analyze a spin-1/2 state |ψ⟩ = cos(θ/2)|↑⟩ + e^(iφ)sin(θ/2)|↓⟩
        Compute expectation values ⟨σ_x⟩, ⟨σ_y⟩, ⟨σ_z⟩.
        """
        theta = state_theta
        phi = state_phi
        
        # Spin state
        psi = np.array([np.cos(theta/2), np.exp(1j*phi)*np.sin(theta/2)], dtype=complex)
        psi_dag = psi.conj()
        
        # Expectation values
        exp_x = float(np.real(psi_dag @ QMEngine.SIGMA_X @ psi))
        exp_y = float(np.real(psi_dag @ QMEngine.SIGMA_Y @ psi))
        exp_z = float(np.real(psi_dag @ QMEngine.SIGMA_Z @ psi))
        
        # Eigenvalues of each Pauli matrix
        eig_x = np.linalg.eigvalsh(QMEngine.SIGMA_X).tolist()
        eig_y = np.linalg.eigvalsh(QMEngine.SIGMA_Y).tolist()
        eig_z = np.linalg.eigvalsh(QMEngine.SIGMA_Z).tolist()
        
        # Pauli matrices as nested lists for frontend rendering
        matrices = {
            "sigma_x": [[str(c) for c in row] for row in QMEngine.SIGMA_X.tolist()],
            "sigma_y": [[str(c) for c in row] for row in QMEngine.SIGMA_Y.tolist()],
            "sigma_z": [[str(c) for c in row] for row in QMEngine.SIGMA_Z.tolist()]
        }
        
        return {
            "state": {"theta": theta, "phi": phi},
            "expectations": {"x": exp_x, "y": exp_y, "z": exp_z},
            "bloch_vector": [exp_x, exp_y, exp_z],
            "eigenvalues": {"x": eig_x, "y": eig_y, "z": eig_z},
            "matrices": matrices,
            "purity": float(exp_x**2 + exp_y**2 + exp_z**2)
        }
    
    @staticmethod
    def hamiltonian_eigen(matrix_elements: List[List[float]] = None, size: int = 4) -> Dict:
        """
        Compute eigenvalues and eigenvectors of a user-defined Hamiltonian.
        If no matrix provided, generates a random Hermitian matrix.
        """
        if matrix_elements:
            H = np.array(matrix_elements, dtype=complex)
            # Ensure Hermitian
            H = (H + H.conj().T) / 2
        else:
            # Random Hermitian matrix
            A = np.random.randn(size, size) + 1j * np.random.randn(size, size)
            H = (A + A.conj().T) / 2
        
        eigenvalues, eigenvectors = np.linalg.eigh(H)
        
        # Energy level diagram data
        energy_levels = sorted(eigenvalues.tolist())
        degeneracies = {}
        for e in energy_levels:
            key = round(e, 4)
            degeneracies[key] = degeneracies.get(key, 0) + 1
        
        return {
            "hamiltonian": [[str(complex(c)) for c in row] for row in H.tolist()],
            "eigenvalues": eigenvalues.tolist(),
            "eigenvectors": [[str(complex(c)) for c in vec] for vec in eigenvectors.T.tolist()],
            "energy_levels": energy_levels,
            "degeneracies": degeneracies,
            "dimension": int(H.shape[0]),
            "trace": float(np.real(np.trace(H))),
            "determinant": float(np.real(np.linalg.det(H)))
        }
    
    @staticmethod
    def harmonic_oscillator(num_levels: int = 8, omega: float = 1.0) -> Dict:
        """
        Quantum harmonic oscillator energy spectrum.
        E_n = ℏω(n + 1/2)
        """
        hbar = 1.0
        levels = list(range(num_levels))
        energies = [(n + 0.5) * hbar * omega for n in levels]
        
        # Transition energies (between adjacent levels)
        transitions = [energies[i+1] - energies[i] for i in range(len(energies)-1)]
        
        # Zero-point energy
        zpe = energies[0]
        
        return {
            "levels": levels,
            "energies": energies,
            "transitions": transitions,
            "omega": omega,
            "zero_point_energy": zpe,
            "spacing": float(hbar * omega),
            "description": "Quantum Harmonic Oscillator: equally spaced energy levels"
        }
