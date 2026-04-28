"""
Quantum LLM Engine
Quantum-inspired attention mechanism, token superposition, and text generation.
"""
import numpy as np
from typing import List, Dict

class QLLMEngine:
    # Vocabulary for quantum-themed text generation
    VOCAB = [
        "quantum", "entanglement", "superposition", "decoherence", "qubit",
        "wavefunction", "measurement", "collapse", "eigenstate", "hamiltonian",
        "unitary", "hermitian", "tensor", "hilbert", "photon",
        "interference", "tunneling", "spin", "orbital", "phase",
        "coherence", "amplitude", "probability", "operator", "observable",
        "bosonic", "fermionic", "topology", "symmetry", "gauge",
        "field", "particle", "energy", "momentum", "angular",
        "magnetic", "electric", "potential", "barrier", "resonance",
        "coupling", "lattice", "crystal", "band", "density",
        "matrix", "state", "vector", "space", "transform"
    ]
    
    def __init__(self, embed_dim: int = 16, n_heads: int = 4):
        self.embed_dim = embed_dim
        self.n_heads = n_heads
        self.head_dim = embed_dim // n_heads
        self.vocab_size = len(self.VOCAB)
        
        # Token embeddings
        self.embeddings = np.random.randn(self.vocab_size, embed_dim) * 0.1
        # Normalize to unit vectors (quantum states on unit sphere)
        norms = np.linalg.norm(self.embeddings, axis=1, keepdims=True)
        self.embeddings = self.embeddings / norms
        
        # Q, K, V projection matrices
        self.W_Q = np.random.randn(embed_dim, embed_dim) * 0.1
        self.W_K = np.random.randn(embed_dim, embed_dim) * 0.1
        self.W_V = np.random.randn(embed_dim, embed_dim) * 0.1
    
    def quantum_attention(self, token_indices: List[int]) -> Dict:
        """
        Compute quantum-inspired attention.
        Keys and Queries exist in superposition; attention scores
        are computed as Born-rule probabilities |⟨Q|K⟩|².
        """
        n_tokens = len(token_indices)
        tokens = [self.VOCAB[i % self.vocab_size] for i in token_indices]
        
        # Get embeddings
        E = np.array([self.embeddings[i % self.vocab_size] for i in token_indices])
        
        # Project to Q, K, V
        Q = E @ self.W_Q
        K = E @ self.W_K
        V = E @ self.W_V
        
        # Quantum attention: |⟨Q_i|K_j⟩|² (Born rule)
        # Inner products
        raw_scores = Q @ K.T / np.sqrt(self.embed_dim)
        
        # Convert to probabilities via quantum measurement (softmax analog)
        # Phase interference: some scores amplify, others cancel
        amplitudes = raw_scores
        probabilities = np.abs(amplitudes)**2
        
        # Normalize rows (Born rule normalization)
        row_sums = probabilities.sum(axis=1, keepdims=True)
        attention_weights = probabilities / (row_sums + 1e-10)
        
        # Apply attention to values
        output = attention_weights @ V
        
        # Superposition state: each token is in a superposition of all tokens
        superposition_coefficients = attention_weights.tolist()
        
        # "Entanglement measure" between token pairs
        entanglement = np.zeros((n_tokens, n_tokens))
        for i in range(n_tokens):
            for j in range(n_tokens):
                # Von Neumann mutual information approximation
                p = attention_weights[i, j]
                entanglement[i, j] = -p * np.log2(p + 1e-10) if p > 0 else 0
        
        return {
            "tokens": tokens,
            "attention_weights": attention_weights.tolist(),
            "entanglement_matrix": entanglement.tolist(),
            "superposition_coefficients": superposition_coefficients,
            "raw_scores": raw_scores.tolist(),
            "n_tokens": n_tokens,
            "embed_dim": self.embed_dim,
            "n_heads": self.n_heads,
            "max_attention_pair": {
                "from": tokens[int(np.unravel_index(np.argmax(attention_weights), attention_weights.shape)[0])],
                "to": tokens[int(np.unravel_index(np.argmax(attention_weights), attention_weights.shape)[1])],
                "weight": float(np.max(attention_weights))
            }
        }
    
    def generate_text(self, seed_indices: List[int], max_length: int = 15, 
                      temperature: float = 0.8) -> Dict:
        """
        Quantum-inspired text generation.
        Each next token is selected via "wavefunction collapse" — 
        probability distribution over vocab collapses to a single token.
        """
        generated_indices = list(seed_indices)
        generated_tokens = [self.VOCAB[i % self.vocab_size] for i in seed_indices]
        collapse_probabilities = []
        
        for step in range(max_length):
            # Context: last few tokens
            ctx_indices = generated_indices[-min(5, len(generated_indices)):]
            ctx_embeddings = np.array([self.embeddings[i % self.vocab_size] for i in ctx_indices])
            
            # Mean context vector (superposition of context)
            ctx_vec = ctx_embeddings.mean(axis=0)
            
            # Compute "quantum probability amplitudes" with all vocab tokens
            similarities = self.embeddings @ ctx_vec
            
            # Apply temperature (controls measurement sharpness)
            scaled = similarities / temperature
            
            # Wavefunction collapse: Born rule probabilities
            amplitudes = np.exp(scaled - np.max(scaled))
            probs = amplitudes**2  # Born rule
            probs = probs / probs.sum()
            
            # Collapse (measurement)
            next_idx = int(np.random.choice(self.vocab_size, p=probs))
            
            generated_indices.append(next_idx)
            generated_tokens.append(self.VOCAB[next_idx])
            collapse_probabilities.append({
                "step": step,
                "top_5": sorted(
                    [{"token": self.VOCAB[i], "prob": float(probs[i])} for i in range(self.vocab_size)],
                    key=lambda x: x["prob"], reverse=True
                )[:5],
                "selected": self.VOCAB[next_idx],
                "entropy": float(-np.sum(probs * np.log2(probs + 1e-10)))
            })
        
        return {
            "generated_text": " ".join(generated_tokens),
            "tokens": generated_tokens,
            "token_indices": generated_indices,
            "collapse_probabilities": collapse_probabilities,
            "total_tokens": len(generated_tokens),
            "temperature": temperature,
            "avg_entropy": float(np.mean([cp["entropy"] for cp in collapse_probabilities]))
        }
    
    def get_vocab(self) -> Dict:
        """Return the full vocabulary with embedding norms."""
        return {
            "vocab": self.VOCAB,
            "size": self.vocab_size,
            "embed_dim": self.embed_dim,
            "norms": [float(np.linalg.norm(e)) for e in self.embeddings]
        }
