"""
Grok AI Chat Engine
Proxies chat requests to the xAI Grok API for quantum-themed assistance.
"""
import os
import httpx
from typing import List, Dict

GROK_API_KEY = os.environ.get("GROK_API_KEY", "")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

SYSTEM_PROMPT = """You are Quantum AI Assistant — an expert in quantum physics, quantum mechanics, quantum computing, quantum machine learning, quantum deep learning, and quantum-inspired language models. 

You help users understand:
- Quantum Physics: wave-particle duality, interference, tunneling, Schrödinger equation
- Quantum Mechanics: uncertainty principle, spin states, Hamiltonians, energy eigenstates
- Quantum Computing: qubits, gates (H, X, Y, Z, CNOT), circuits, Bloch sphere
- Quantum ML: quantum PCA, quantum k-means, feature maps
- Quantum DL: variational quantum circuits (VQC), parameter-shift rule, hybrid networks
- Quantum LLM: quantum attention, Born-rule scoring, wavefunction collapse generation

Keep answers concise, accurate, and engaging. Use mathematical notation when helpful. You are part of the Quantum AI platform — the world's most comprehensive quantum simulation suite."""


async def chat_with_grok(messages: List[Dict], context_page: str = "general") -> str:
    """
    Send a chat request to the Grok API.
    messages: list of {"role": "user"/"assistant", "content": "..."}
    """
    # Prepend system prompt with page context  
    system = SYSTEM_PROMPT + f"\n\nThe user is currently on the '{context_page}' page of the Quantum AI platform."
    
    full_messages = [{"role": "system", "content": system}] + messages
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": full_messages,
                    "max_tokens": 1024,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                error_detail = response.text
                print(f"Grok API Error {response.status_code}: {error_detail}")
                return f"Grok API returned status {response.status_code}. Detail: {error_detail[:100]}"
    except Exception as e:
        print(f"Grok Connection Error: {str(e)}")
        return f"Connection error: {str(e)}. Please check your network."
