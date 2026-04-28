"""
Quantum Deep Learning Engine
Variational Quantum Circuit (VQC) simulation, quantum-classical hybrid training.
"""
import numpy as np
from typing import List, Dict

class QDLEngine:
    def __init__(self, n_qubits: int = 4, n_layers: int = 3):
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        # Variational parameters (rotation angles)
        self.params = np.random.uniform(0, 2*np.pi, (n_layers, n_qubits, 3))
        self.training_history = []
    
    def _rotation_gate(self, theta: float, axis: str = 'y') -> np.ndarray:
        """Single-qubit rotation gate."""
        if axis == 'x':
            return np.array([[np.cos(theta/2), -1j*np.sin(theta/2)],
                           [-1j*np.sin(theta/2), np.cos(theta/2)]], dtype=complex)
        elif axis == 'y':
            return np.array([[np.cos(theta/2), -np.sin(theta/2)],
                           [np.sin(theta/2), np.cos(theta/2)]], dtype=complex)
        else:  # z
            return np.array([[np.exp(-1j*theta/2), 0],
                           [0, np.exp(1j*theta/2)]], dtype=complex)
    
    def _build_circuit(self, x_input: np.ndarray) -> np.ndarray:
        """Build and execute the variational quantum circuit."""
        n = self.n_qubits
        dim = 2**n
        
        # Initial state |0...0⟩
        state = np.zeros(dim, dtype=complex)
        state[0] = 1.0
        
        # Encode input data via RY rotations
        for i in range(min(len(x_input), n)):
            gate = self._rotation_gate(x_input[i] * np.pi, 'y')
            op = np.array([[1]], dtype=complex)
            for j in range(n):
                op = np.kron(op, gate if j == i else np.eye(2, dtype=complex))
            state = op @ state
        
        # Apply variational layers
        for layer in range(self.n_layers):
            for qubit in range(n):
                for k, axis in enumerate(['x', 'y', 'z']):
                    gate = self._rotation_gate(self.params[layer, qubit, k], axis)
                    op = np.array([[1]], dtype=complex)
                    for j in range(n):
                        op = np.kron(op, gate if j == qubit else np.eye(2, dtype=complex))
                    state = op @ state
            
            # Entangling CNOT layer (nearest-neighbor)
            for qubit in range(n - 1):
                cnot = np.eye(dim, dtype=complex)
                for i in range(dim):
                    if (i >> (n - 1 - qubit)) & 1:
                        j = i ^ (1 << (n - 1 - qubit - 1))
                        cnot[i, i] = 0
                        cnot[i, j] = 1
                state = cnot @ state
        
        return state
    
    def _measure_expectation(self, state: np.ndarray) -> float:
        """Measure expectation value of Z on first qubit (classification output)."""
        n = self.n_qubits
        dim = 2**n
        
        # Z_0 ⊗ I ⊗ I ⊗ ...
        Z_op = np.zeros((dim, dim), dtype=complex)
        for i in range(dim):
            if (i >> (n - 1)) & 1:
                Z_op[i, i] = -1
            else:
                Z_op[i, i] = 1
        
        return float(np.real(state.conj() @ Z_op @ state))
    
    def train_vqc(self, X: List[List[float]], y: List[float], 
                  epochs: int = 30, lr: float = 0.1) -> Dict:
        """
        Train the VQC using parameter-shift rule for gradient computation.
        Binary classification: output = sign(⟨Z₀⟩).
        """
        X_arr = np.array(X)
        y_arr = np.array(y)
        
        self.training_history = []
        accuracy_history = []
        
        for epoch in range(epochs):
            total_loss = 0.0
            correct = 0
            
            for xi, yi in zip(X_arr, y_arr):
                # Forward pass
                state = self._build_circuit(xi)
                prediction = self._measure_expectation(state)
                
                # Loss (MSE)
                loss = (prediction - yi)**2
                total_loss += loss
                
                # Accuracy
                pred_label = 1.0 if prediction > 0 else -1.0
                if pred_label == yi:
                    correct += 1
                
                # Parameter-shift gradient approximation
                shift = np.pi / 2
                for l in range(self.n_layers):
                    for q in range(self.n_qubits):
                        for k in range(3):
                            # f(θ+s)
                            self.params[l, q, k] += shift
                            state_plus = self._build_circuit(xi)
                            f_plus = self._measure_expectation(state_plus)
                            
                            # f(θ-s)
                            self.params[l, q, k] -= 2 * shift
                            state_minus = self._build_circuit(xi)
                            f_minus = self._measure_expectation(state_minus)
                            
                            # Restore
                            self.params[l, q, k] += shift
                            
                            # Gradient
                            grad = (f_plus - f_minus) / 2
                            
                            # Update (gradient descent on loss)
                            self.params[l, q, k] -= lr * 2 * (prediction - yi) * grad
            
            avg_loss = total_loss / len(X_arr)
            accuracy = correct / len(X_arr)
            
            self.training_history.append({
                "epoch": epoch,
                "loss": float(avg_loss),
                "accuracy": float(accuracy)
            })
            accuracy_history.append(float(accuracy))
        
        return {
            "history": self.training_history,
            "final_loss": float(self.training_history[-1]["loss"]),
            "final_accuracy": float(self.training_history[-1]["accuracy"]),
            "n_qubits": self.n_qubits,
            "n_layers": self.n_layers,
            "total_params": int(self.n_layers * self.n_qubits * 3)
        }
    
    def predict(self, X: List[List[float]]) -> Dict:
        """Run predictions on trained VQC."""
        X_arr = np.array(X)
        predictions = []
        raw_outputs = []
        
        for xi in X_arr:
            state = self._build_circuit(xi)
            exp = self._measure_expectation(state)
            raw_outputs.append(float(exp))
            predictions.append(1.0 if exp > 0 else -1.0)
        
        return {
            "predictions": predictions,
            "raw_outputs": raw_outputs,
            "n_samples": len(X_arr)
        }
    
    @staticmethod
    def generate_classification_data(n_samples: int = 40) -> Dict:
        """Generate a simple binary classification dataset."""
        X = []
        y = []
        for i in range(n_samples):
            if i % 2 == 0:
                x = np.random.randn(4) * 0.5 + 1.0
                X.append(x.tolist())
                y.append(1.0)
            else:
                x = np.random.randn(4) * 0.5 - 1.0
                X.append(x.tolist())
                y.append(-1.0)
        return {"X": X, "y": y, "n_samples": n_samples}
