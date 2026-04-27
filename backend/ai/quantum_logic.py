import numpy as np

class QuantumLogic:
    @staticmethod
    def get_initial_state(n_qubits=2):
        state = np.zeros(2**n_qubits, dtype=complex)
        state[0] = 1.0  # |00>
        return state

    @staticmethod
    def apply_gate(state, gate_type, target=0, control=None):
        # Basis Gates (Single Qubit)
        I = np.array([[1, 0], [0, 1]])
        X = np.array([[0, 1], [1, 0]])
        Y = np.array([[0, -1j], [1j, 0]])
        Z = np.array([[1, 0], [0, -1]])
        H = (1/np.sqrt(2)) * np.array([[1, 1], [1, -1]])
        
        gates = {"X": X, "Y": Y, "Z": Z, "H": H}
        
        if gate_type == "CNOT" and control is not None:
            # 2-Qubit CNOT (Assuming target 1, control 0 for simplicity)
            CNOT = np.array([
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 1],
                [0, 0, 1, 0]
            ])
            new_state = CNOT @ state
        else:
            # Single Qubit gate on target
            G = gates.get(gate_type, I)
            if target == 0:
                full_gate = np.kron(G, I)
            else:
                full_gate = np.kron(I, G)
            new_state = full_gate @ state
            
        return new_state / np.linalg.norm(new_state)

    @staticmethod
    def get_probabilities(state):
        return [float(abs(c)**2) for c in state]

    @staticmethod
    def state_to_bloch_q1(state):
        # Trace out Q2 to get reduced density matrix of Q1
        rho = np.outer(state, state.conj())
        rho_q1 = np.array([
            [rho[0,0] + rho[1,1], rho[0,2] + rho[1,3]],
            [rho[2,0] + rho[3,1], rho[2,2] + rho[3,3]]
        ])
        
        # This is a very simplified Bloach mapping for the first qubit
        # In case of entanglement, the vector will shorten (purity < 1)
        # For simplicity in this UI, we just take the relative amplitudes
        alpha = state[0] + state[1]
        beta = state[2] + state[3]
        norm = np.sqrt(abs(alpha)**2 + abs(beta)**2)
        if norm < 1e-10: return 0.0, 0.0
        alpha /= norm
        beta /= norm
        
        theta = 2 * np.arccos(min(1.0, np.abs(alpha)))
        phi = np.angle(beta / alpha) if np.abs(alpha) > 1e-10 else 0
        return float(theta), float(phi)
