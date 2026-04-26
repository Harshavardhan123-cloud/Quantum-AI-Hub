import numpy as np

class QuantumLogic:
    """
    Detailed Quantum Gate Simulator for a single qubit.
    Supports matrix operations for standard quantum gates.
    """

    @staticmethod
    def get_initial_state():
        return np.array([1, 0], dtype=complex)  # |0>

    @staticmethod
    def apply_gate(state, gate_type):
        """
        Applies a quantum gate to the qubit state vector.
        """
        # Define Gates
        I = np.array([[1, 0], [0, 1]])
        X = np.array([[0, 1], [1, 0]])  # NOT gate
        Y = np.array([[0, -1j], [1j, 0]])
        Z = np.array([[1, 0], [0, -1]])
        H = (1/np.sqrt(2)) * np.array([[1, 1], [1, -1]])  # Hadamard
        S = np.array([[1, 0], [0, 1j]])  # Phase gate
        T = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]])

        gates = {
            "X": X, "Y": Y, "Z": Z, "H": H, "S": S, "T": T, "I": I
        }

        gate = gates.get(gate_type, I)
        new_state = gate @ state
        
        # Ensure normalization
        norm = np.linalg.norm(new_state)
        return new_state / norm

    @staticmethod
    def state_to_bloch(state):
        """
        Converts a qubit state vector [alpha, beta] to Bloch Sphere coordinates (theta, phi).
        alpha = cos(theta/2)
        beta = e^(i*phi) * sin(theta/2)
        """
        alpha = state[0]
        beta = state[1]
        
        # theta
        theta = 2 * np.arccos(np.abs(alpha))
        
        # phi - using phase of beta/alpha
        if np.abs(alpha) < 1e-10:
            phi = 0
        else:
            phi = np.angle(beta / alpha)
            
        return float(theta), float(phi)
