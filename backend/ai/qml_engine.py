"""
Quantum Machine Learning Engine
Quantum PCA (via Hebbian rules), Quantum-inspired K-Means clustering, feature mapping.
"""
import numpy as np
from typing import List, Dict, Tuple

class QMLEngine:
    def __init__(self, input_dim: int = 10, n_components: int = 2):
        self.input_dim = input_dim
        self.n_components = n_components
        self.W = np.random.randn(n_components, input_dim) * 0.1
        
    def quantum_pca(self, data: List[List[float]], learning_rate: float = 0.01, 
                    epochs: int = 50) -> Dict:
        """
        Quantum-inspired PCA using Oja's learning rule.
        Extracts principal components from data via iterative weight updates.
        """
        X = np.array(data)
        if X.ndim == 1:
            X = X.reshape(1, -1)
        
        loss_history = []
        projection_history = []
        weight_norms = []
        
        for epoch in range(epochs):
            epoch_loss = 0.0
            for x in X:
                x = x.reshape(-1, 1)
                y = self.W @ x  # Project
                
                # Oja update: W += lr * (y * x^T - y * y^T * W)
                outer = y @ x.T
                correction = y @ y.T @ self.W
                self.W += learning_rate * (outer - correction)
                
                # Reconstruction loss
                x_hat = self.W.T @ y
                epoch_loss += float(np.sum((x - x_hat)**2))
            
            loss_history.append(epoch_loss / len(X))
            
            # Project all data at this epoch
            projections = (self.W @ X.T).T
            projection_history.append(projections.tolist())
            weight_norms.append([float(np.linalg.norm(w)) for w in self.W])
        
        # Final projections
        final_proj = (self.W @ X.T).T
        
        # Explained variance
        total_var = float(np.var(X))
        proj_var = float(np.var(final_proj))
        explained = min(1.0, proj_var / total_var) if total_var > 0 else 0.0
        
        return {
            "projections": final_proj.tolist(),
            "loss_history": loss_history,
            "weight_norms": weight_norms,
            "explained_variance": explained,
            "epochs": epochs,
            "n_samples": len(X),
            "n_components": self.n_components
        }
    
    @staticmethod
    def quantum_kmeans(data: List[List[float]], k: int = 3, 
                       max_iter: int = 30) -> Dict:
        """
        Quantum-inspired K-Means: uses superposition-like probabilistic assignment.
        Instead of hard assignment, uses quantum probability amplitudes.
        """
        X = np.array(data)
        n_samples, n_features = X.shape
        
        # Initialize centroids randomly from data
        indices = np.random.choice(n_samples, k, replace=False)
        centroids = X[indices].copy()
        
        history = []
        assignments = np.zeros(n_samples, dtype=int)
        
        for iteration in range(max_iter):
            # Quantum-inspired soft assignment
            # Compute "probability amplitudes" based on distance
            distances = np.zeros((n_samples, k))
            for j in range(k):
                distances[:, j] = np.linalg.norm(X - centroids[j], axis=1)
            
            # Convert to probabilities (Born rule analog)
            inv_dist = 1.0 / (distances + 1e-10)
            probs = inv_dist**2 / np.sum(inv_dist**2, axis=1, keepdims=True)
            
            # Hard assignment (measurement / collapse)
            assignments = np.argmax(probs, axis=1)
            
            # Update centroids
            new_centroids = np.zeros_like(centroids)
            for j in range(k):
                mask = assignments == j
                if np.sum(mask) > 0:
                    new_centroids[j] = X[mask].mean(axis=0)
                else:
                    new_centroids[j] = centroids[j]
            
            # Convergence check
            shift = np.linalg.norm(new_centroids - centroids)
            centroids = new_centroids
            
            # Inertia
            inertia = sum(np.linalg.norm(X[assignments == j] - centroids[j])**2 
                         for j in range(k) if np.sum(assignments == j) > 0)
            
            history.append({
                "iteration": iteration,
                "centroids": centroids.tolist(),
                "inertia": float(inertia),
                "shift": float(shift)
            })
            
            if shift < 1e-6:
                break
        
        return {
            "centroids": centroids.tolist(),
            "assignments": assignments.tolist(),
            "probabilities": probs.tolist(),
            "history": history,
            "k": k,
            "converged_at": len(history),
            "final_inertia": float(history[-1]["inertia"])
        }
    
    @staticmethod
    def generate_sample_data(n_samples: int = 100, n_features: int = 2, 
                              n_clusters: int = 3) -> Dict:
        """Generate synthetic clustered data for QML demonstrations."""
        centers = np.random.randn(n_clusters, n_features) * 3
        data = []
        true_labels = []
        for i in range(n_samples):
            cluster = i % n_clusters
            point = centers[cluster] + np.random.randn(n_features) * 0.5
            data.append(point.tolist())
            true_labels.append(cluster)
        
        return {
            "data": data,
            "true_labels": true_labels,
            "centers": centers.tolist(),
            "n_samples": n_samples,
            "n_features": n_features
        }
