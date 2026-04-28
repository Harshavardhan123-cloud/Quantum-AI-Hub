"""
Wave Simulator — Quantum Physics Engine
Simulates double-slit interference, quantum tunneling, and Schrödinger wave evolution.
"""
import numpy as np
from typing import List, Dict

class WaveSimulator:
    @staticmethod
    def double_slit(slit_distance: float = 0.5, wavelength: float = 0.01, 
                    screen_distance: float = 2.0, num_points: int = 200) -> Dict:
        """
        Simulate double-slit experiment interference pattern.
        Uses Huygens-Fresnel principle for wave superposition.
        """
        d = slit_distance
        lam = wavelength
        L = screen_distance
        
        # Screen positions
        y = np.linspace(-2.0, 2.0, num_points)
        
        # Path difference from two slits
        r1 = np.sqrt(L**2 + (y - d/2)**2)
        r2 = np.sqrt(L**2 + (y + d/2)**2)
        delta = r2 - r1
        
        # Intensity: I = 4 * I0 * cos^2(pi * d * sin(theta) / lambda)
        phase = (2 * np.pi / lam) * delta
        intensity = (np.cos(phase / 2))**2
        
        # Envelope (single slit diffraction)
        slit_width = 0.05
        alpha = (np.pi * slit_width / lam) * (y / L)
        alpha = np.where(np.abs(alpha) < 1e-10, 1e-10, alpha)
        envelope = (np.sin(alpha) / alpha)**2
        
        combined = intensity * envelope
        combined = combined / np.max(combined)  # Normalize
        
        return {
            "positions": y.tolist(),
            "intensity": combined.tolist(),
            "wavelength": lam,
            "slit_distance": d,
            "screen_distance": L,
            "max_intensity": float(np.max(combined)),
            "fringe_count": int(np.sum(np.diff(np.sign(np.diff(combined))) < 0))
        }
    
    @staticmethod
    def quantum_tunneling(barrier_height: float = 5.0, barrier_width: float = 1.0,
                          particle_energy: float = 3.0, num_points: int = 300) -> Dict:
        """
        Simulate quantum tunneling through a rectangular potential barrier.
        Calculates transmission coefficient and wavefunction amplitude.
        """
        V0 = barrier_height
        a = barrier_width
        E = min(particle_energy, V0 - 0.01)  # Ensure E < V0 for tunneling
        
        hbar = 1.0
        m = 1.0
        
        k1 = np.sqrt(2 * m * E) / hbar
        kappa = np.sqrt(2 * m * (V0 - E)) / hbar
        
        # Transmission coefficient
        T = 1.0 / (1.0 + (V0**2 * np.sinh(kappa * a)**2) / (4 * E * (V0 - E)))
        R = 1 - T
        
        # Generate wavefunction across space
        x = np.linspace(-5, 5 + a, num_points)
        psi = np.zeros(num_points)
        potential = np.zeros(num_points)
        
        for i, xi in enumerate(x):
            if xi < 0:  # Region I (before barrier)
                psi[i] = np.cos(k1 * xi) + R * np.cos(k1 * xi + np.pi)
                potential[i] = 0
            elif xi < a:  # Region II (inside barrier)
                psi[i] = np.exp(-kappa * xi) * np.sqrt(T + R)
                potential[i] = V0
            else:  # Region III (after barrier)
                psi[i] = np.sqrt(T) * np.cos(k1 * (xi - a))
                potential[i] = 0
        
        psi = np.abs(psi)
        psi = psi / np.max(psi)
        
        return {
            "positions": x.tolist(),
            "wavefunction": psi.tolist(),
            "potential": potential.tolist(),
            "transmission": float(T),
            "reflection": float(R),
            "barrier_height": V0,
            "barrier_width": a,
            "particle_energy": E
        }
    
    @staticmethod
    def schrodinger_evolution(potential_type: str = "harmonic", 
                              num_states: int = 5, num_points: int = 200) -> Dict:
        """
        Compute energy eigenstates for common quantum potentials.
        Supports: harmonic oscillator, infinite well, and hydrogen-like.
        """
        x = np.linspace(-5, 5, num_points)
        dx = x[1] - x[0]
        
        states = []
        energies = []
        
        if potential_type == "harmonic":
            # Quantum harmonic oscillator: V(x) = 0.5 * x^2
            V = 0.5 * x**2
            for n in range(num_states):
                E_n = n + 0.5  # ℏω units
                # Hermite polynomial approximation via recurrence
                psi = np.exp(-x**2 / 2)
                if n == 0:
                    psi = psi
                elif n == 1:
                    psi = 2 * x * psi
                elif n == 2:
                    psi = (4 * x**2 - 2) * np.exp(-x**2 / 2)
                elif n == 3:
                    psi = (8 * x**3 - 12 * x) * np.exp(-x**2 / 2)
                elif n == 4:
                    psi = (16 * x**4 - 48 * x**2 + 12) * np.exp(-x**2 / 2)
                norm = np.sqrt(np.sum(psi**2) * dx)
                psi = psi / norm if norm > 0 else psi
                states.append(psi.tolist())
                energies.append(float(E_n))
        
        elif potential_type == "infinite_well":
            # Particle in a box: V = 0 for |x| < L, inf otherwise
            L = 4.0
            V = np.where(np.abs(x) < L/2, 0, 100)
            for n in range(1, num_states + 1):
                E_n = (n * np.pi / L)**2 / 2
                psi = np.where(np.abs(x) < L/2, np.sin(n * np.pi * (x + L/2) / L), 0)
                norm = np.sqrt(np.sum(psi**2) * dx)
                psi = psi / norm if norm > 0 else psi
                states.append(psi.tolist())
                energies.append(float(E_n))
        
        elif potential_type == "hydrogen":
            # Hydrogen-like radial wavefunctions (1D projection)
            r = np.abs(x) + 0.01  # Avoid division by zero
            V = -1.0 / r
            for n in range(1, num_states + 1):
                E_n = -1.0 / (2 * n**2)
                psi = (2.0 / n) * r * np.exp(-r / n)
                if n == 2:
                    psi = (1 - r / 2) * np.exp(-r / 2)
                elif n == 3:
                    psi = (1 - 2*r/3 + 2*r**2/27) * np.exp(-r / 3)
                norm = np.sqrt(np.sum(psi**2) * dx)
                psi = psi / norm if norm > 0 else psi
                states.append(psi.tolist())
                energies.append(float(E_n))
        
        return {
            "positions": x.tolist(),
            "potential": V.tolist(),
            "states": states,
            "energies": energies,
            "potential_type": potential_type,
            "num_states": num_states
        }
