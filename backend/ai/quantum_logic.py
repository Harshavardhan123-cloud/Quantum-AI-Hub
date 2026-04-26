import numpy as np

class QuantumLogic:
    @staticmethod
    def get_initial_state():
        return np.array([1, 0], dtype=complex)

    @staticmethod
    def apply_gate(state, gate_type):
        I = np.array([[1, 0], [0, 1]])
        X = np.array([[0, 1], [1, 0]])
        Y = np.array([[0, -1j], [1j, 0]])
        Z = np.array([[1, 0], [0, -1]])
        H = (1/np.sqrt(2)) * np.array([[1, 1], [1, -1]])
        S = np.array([[1, 0], [0, 1j]])
        T = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]])
        gates = {"X": X, "Y": Y, "Z": Z, "H": H, "S": S, "T": T}
        gate = gates.get(gate_type, I)
        new_state = gate @ state
        return new_state / np.linalg.norm(new_state)

    @staticmethod
    def state_to_bloch(state):
        alpha, beta = state[0], state[1]
        theta = 2 * np.arccos(min(1.0, np.abs(alpha)))
        phi = 0 if np.abs(alpha) < 1e-10 else np.angle(beta / alpha)
        return float(theta), float(phi)
