import numpy as np
from typing import List, Tuple

class HebbianEngine:
    def __init__(self, input_dim: int, output_dim: int, learning_rate: float = 0.01):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.lr = learning_rate
        limit = np.sqrt(6 / (input_dim + output_dim))
        self.weights = np.random.uniform(-limit, limit, (output_dim, input_dim))
        self.threshold = np.zeros(output_dim) + 0.1

    def train_oja(self, x: np.ndarray) -> np.ndarray:
        y = self.weights @ x
        for i in range(self.output_dim):
            self.weights[i, :] += self.lr * y[i] * (x.T - y[i] * self.weights[i, :]).flatten()
        return y

    def train_sanger(self, x: np.ndarray) -> np.ndarray:
        y = self.weights @ x
        for i in range(self.output_dim):
            sum_prev = np.zeros(self.input_dim)
            for k in range(i + 1):
                sum_prev += y[k] * self.weights[k, :]
            self.weights[i, :] += self.lr * y[i] * (x.T.flatten() - sum_prev)
        return y

    def train_bcm(self, x: np.ndarray) -> np.ndarray:
        y = self.weights @ x
        for i in range(self.output_dim):
            phi = y[i] * (y[i] - self.threshold[i])
            self.weights[i, :] += self.lr * phi * x.T.flatten()
            self.threshold[i] += 0.01 * (y[i]**2 - self.threshold[i])
        return y

    def transform(self, x: List[float], rule: str = "oja") -> Tuple[List[float], List[float]]:
        x_norm = np.array(x).reshape(-1, 1)
        if rule == "sanger": y = self.train_sanger(x_norm)
        elif rule == "bcm": y = self.train_bcm(x_norm)
        else: y = self.train_oja(x_norm)
        return y.flatten().tolist(), [float(np.std(w)) for w in self.weights]
