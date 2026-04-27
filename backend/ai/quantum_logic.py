import numpy as np

class QuantumLogic:
    @staticmethod
    def get_initial_state(n_qubits):
        state = np.zeros(2**n_qubits, dtype=complex)
        state[0] = 1.0  # |00...0>
        return state

    @staticmethod
    def apply_gate(state, n_qubits, gate_type, target, control=None):
        I = np.eye(2, dtype=complex)
        X = np.array([[0, 1], [1, 0]], dtype=complex)
        Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
        Z = np.array([[1, 0], [0, -1]], dtype=complex)
        H = (1/np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex)
        
        gates = {"X": X, "Y": Y, "Z": Z, "H": H}
        
        if gate_type == "CNOT" and control is not None:
            # Multi-qubit CNOT construction
            dim = 2**n_qubits
            operator = np.eye(dim, dtype=complex)
            for i in range(dim):
                # Check if control bit is 1 in binary representation
                if (i >> (n_qubits - 1 - control)) & 1:
                    # Flip the target bit
                    j = i ^ (1 << (n_qubits - 1 - target))
                    operator[i, i] = 0
                    operator[i, j] = 1
            new_state = operator @ state
        elif gate_type == "SUPERPOSITION":
            # Apply H to all qubits
            operator = H
            for _ in range(n_qubits - 1):
                operator = np.kron(operator, H)
            new_state = operator @ state
        else:
            # Single Qubit gate on target
            G = gates.get(gate_type, I)
            operator = np.array([[1]])
            for i in range(n_qubits):
                if i == target:
                    operator = np.kron(operator, G)
                else:
                    operator = np.kron(operator, I)
            new_state = operator @ state
            
        return new_state / np.linalg.norm(new_state)

    @staticmethod
    def get_probabilities(state):
        return [float(abs(c)**2) for c in state]

    @staticmethod
    def get_labels(n_qubits):
        return [format(i, f'0{n_qubits}b') for i in range(2**n_qubits)]

    @staticmethod
    def state_to_bloch_idx(state, n_qubits, idx=0):
        # Very simplified visualization: projects the N-qubit state to a representation of one qubit
        # This isn't physically accurate for entangled states but serves the UI's Bloch sphere
        # We look at the first two amplitudes where all other bits are 0
        alpha = state[0]
        beta = state[1 << (n_qubits - 1 - idx)]
        norm = np.sqrt(abs(alpha)**2 + abs(beta)**2)
        if norm < 1e-10: return 0.0, 0.0
        alpha /= norm
        beta /= norm
        
        theta = 2 * np.arccos(min(1.0, np.abs(alpha)))
        phi = np.angle(beta / alpha) if np.abs(alpha) > 1e-10 else 0
        return float(theta), float(phi)
