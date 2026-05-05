import numpy as np

class QuantumLogic:
    @staticmethod
    def get_initial_state(n_qubits):
        state = np.zeros(2**n_qubits, dtype=complex)
        state[0] = 1.0  # |00...0>
        return state

    @staticmethod
    def get_pauli_op(n_qubits, target, op_type):
        I = np.eye(2, dtype=complex)
        X = np.array([[0, 1], [1, 0]], dtype=complex)
        Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
        Z = np.array([[1, 0], [0, -1]], dtype=complex)
        
        gates = {"X": X, "Y": Y, "Z": Z}
        G = gates.get(op_type, I)
        
        operator = np.array([[1]])
        for i in range(n_qubits):
            # Bit ordering: Q0 is the first bit (MSB in our format)
            if i == target:
                operator = np.kron(operator, G)
            else:
              operator = np.kron(operator, I)
        return operator

    @staticmethod
    def apply_gate(state, n_qubits, gate_type, target, control=None):
        I = np.eye(2, dtype=complex)
        X = np.array([[0, 1], [1, 0]], dtype=complex)
        Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
        Z = np.array([[1, 0], [0, -1]], dtype=complex)
        H = (1/np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex)
        
        gates = {"X": X, "Y": Y, "Z": Z, "H": H}
        
        if gate_type == "CNOT" and control is not None:
            if target == control: return state
            dim = 2**n_qubits
            operator = np.eye(dim, dtype=complex)
            for i in range(dim):
                # Check if control bit is 1
                if (i >> (n_qubits - 1 - control)) & 1:
                    j = i ^ (1 << (n_qubits - 1 - target))
                    operator[i, i] = 0
                    operator[i, j] = 1
            new_state = operator @ state
        elif gate_type == "SUPERPOSITION":
            operator = H
            for _ in range(n_qubits - 1):
                operator = np.kron(operator, H)
            new_state = operator @ state
        else:
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
        # Physically accurate Bloch vector calculation using Pauli expectation values
        # <σ> = <ψ| σ |ψ>
        
        # Get Pauli operators for the target qubit
        sigma_x = QuantumLogic.get_pauli_op(n_qubits, idx, "X")
        sigma_y = QuantumLogic.get_pauli_op(n_qubits, idx, "Y")
        sigma_z = QuantumLogic.get_pauli_op(n_qubits, idx, "Z")
        
        # Calculate expectation values
        x = np.real(state.conj().T @ sigma_x @ state)
        y = np.real(state.conj().T @ sigma_y @ state)
        z = np.real(state.conj().T @ sigma_z @ state)
        
        # Convert Bloch vector (x, y, z) to spherical coordinates (theta, phi)
        # z = cos(theta)
        # x = sin(theta)cos(phi), y = sin(theta)sin(phi)
        
        theta = np.arccos(np.clip(z, -1.0, 1.0))
        phi = np.arctan2(y, x)
        
        return float(theta), float(phi)
