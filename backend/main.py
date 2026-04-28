import logging, os, datetime, numpy as np
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from ai.hebbian_engine import HebbianEngine
from ai.quantum_logic import QuantumLogic
from ai.wave_simulator import WaveSimulator
from ai.qm_engine import QMEngine
from ai.qml_engine import QMLEngine
from ai.qdl_engine import QDLEngine
from ai.qllm_engine import QLLMEngine
from ai.grok_chat import chat_with_grok
from database import SessionLocal, SimulationLog

if not os.path.exists("logs"): os.makedirs("logs")
logging.basicConfig(filename="logs/app.log", level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("QuantumAI")

app = FastAPI(title="Quantum AI — Ultimate Edition")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# ═══════════════════ Engine Instances ═══════════════════
num_qubits = 3
hebbian_engine = HebbianEngine(10, 5)
qubit_state = QuantumLogic.get_initial_state(num_qubits)
qml_engine = QMLEngine(input_dim=10, n_components=2)
qdl_engine = QDLEngine(n_qubits=4, n_layers=2)
qllm_engine = QLLMEngine(embed_dim=16, n_heads=4)

# ═══════════════════ Request Models ═══════════════════
class HebbianRequest(BaseModel):
    data: List[float]
    rule: str = "oja"

class GateRequest(BaseModel):
    gate: str
    target: int = 0
    control: Optional[int] = None

class BatchRequest(BaseModel):
    samples: int = 20
    rule: str = "oja"

class DoubleSplitRequest(BaseModel):
    slit_distance: float = 0.5
    wavelength: float = 0.01
    screen_distance: float = 2.0

class TunnelingRequest(BaseModel):
    barrier_height: float = 5.0
    barrier_width: float = 1.0
    particle_energy: float = 3.0

class SchrodingerRequest(BaseModel):
    potential_type: str = "harmonic"
    num_states: int = 5

class SpinRequest(BaseModel):
    theta: float = 0.0
    phi: float = 0.0

class HamiltonianRequest(BaseModel):
    size: int = 4

class QMLPCARequest(BaseModel):
    n_samples: int = 60
    epochs: int = 30

class KMeansRequest(BaseModel):
    n_samples: int = 100
    k: int = 3

class VQCTrainRequest(BaseModel):
    n_samples: int = 20
    epochs: int = 15

class QLLMAttentionRequest(BaseModel):
    token_indices: List[int] = [0, 1, 2, 3, 4]

class QLLMGenerateRequest(BaseModel):
    seed_indices: List[int] = [0, 4]
    max_length: int = 12
    temperature: float = 0.8

# ═══════════════════ QUANTUM GATE APIs ═══════════════════
@app.post("/api/quantum/gate")
async def apply_gate(request: GateRequest, db: Session = Depends(get_db)):
    global qubit_state, num_qubits
    if request.gate == "RESET":
        qubit_state = QuantumLogic.get_initial_state(num_qubits)
    else:
        qubit_state = QuantumLogic.apply_gate(qubit_state, num_qubits, request.gate, target=request.target, control=request.control)
    theta, phi = QuantumLogic.state_to_bloch_idx(qubit_state, num_qubits, request.target)
    probs = QuantumLogic.get_probabilities(qubit_state)
    labels = QuantumLogic.get_labels(num_qubits)
    db.add(SimulationLog(type="quantum", input_data={"gate": request.gate, "t": request.target, "c": request.control}, result_data={"probs": probs}, description=f"Gate {request.gate} on Q{request.target}"))
    db.commit()
    return {"theta": theta, "phi": phi, "probabilities": probs, "labels": [f"|{l}⟩" for l in labels]}

@app.post("/api/quantum/config")
async def set_quantum_config(config: dict):
    global num_qubits, qubit_state
    num_qubits = max(1, min(6, config.get("n", 3)))
    qubit_state = QuantumLogic.get_initial_state(num_qubits)
    return {"status": "ok", "n": num_qubits}

# ═══════════════════ HEBBIAN APIs ═══════════════════
@app.post("/api/analyze/hebbian")
async def analyze_hebbian(request: HebbianRequest, db: Session = Depends(get_db)):
    projection, weight_stats = hebbian_engine.transform(request.data, rule=request.rule)
    db.add(SimulationLog(type="hebbian", input_data={"vector": request.data, "rule": request.rule}, result_data={"projection": projection, "weight_stats": weight_stats}, description=f"Hebbian Analysis: {request.rule}"))
    db.commit()
    return {"projection": projection, "weight_stats": weight_stats, "rule_applied": request.rule}

@app.post("/api/analyze/hebbian_batch")
async def analyze_hebbian_batch(request: BatchRequest, db: Session = Depends(get_db)):
    batch_data = [np.random.normal(0, 1, 10).tolist() for _ in range(request.samples)]
    results = hebbian_engine.train_batch(batch_data, rule=request.rule)
    last_res = results[-1]
    db.add(SimulationLog(type="hebbian_batch", input_data={"samples": request.samples, "rule": request.rule}, result_data={"final_projection": last_res["projection"]}, description=f"Batch Training: {request.samples} samples"))
    db.commit()
    return {"results": results, "rule_applied": request.rule}

# ═══════════════════ PHYSICS APIs ═══════════════════
@app.post("/api/physics/double_slit")
async def double_slit(request: DoubleSplitRequest, db: Session = Depends(get_db)):
    result = WaveSimulator.double_slit(request.slit_distance, request.wavelength, request.screen_distance)
    db.add(SimulationLog(type="physics", input_data={"experiment": "double_slit", "wavelength": request.wavelength}, result_data={"fringe_count": result["fringe_count"]}, description=f"Double-Slit: λ={request.wavelength}"))
    db.commit()
    return result

@app.post("/api/physics/tunneling")
async def tunneling(request: TunnelingRequest, db: Session = Depends(get_db)):
    result = WaveSimulator.quantum_tunneling(request.barrier_height, request.barrier_width, request.particle_energy)
    db.add(SimulationLog(type="physics", input_data={"experiment": "tunneling", "energy": request.particle_energy}, result_data={"transmission": result["transmission"]}, description=f"Tunneling: T={result['transmission']:.4f}"))
    db.commit()
    return result

@app.post("/api/physics/schrodinger")
async def schrodinger(request: SchrodingerRequest, db: Session = Depends(get_db)):
    result = WaveSimulator.schrodinger_evolution(request.potential_type, request.num_states)
    db.add(SimulationLog(type="physics", input_data={"potential": request.potential_type}, result_data={"energies": result["energies"]}, description=f"Schrödinger: {request.potential_type}"))
    db.commit()
    return result

# ═══════════════════ MECHANICS APIs ═══════════════════
@app.post("/api/mechanics/uncertainty")
async def uncertainty(db: Session = Depends(get_db)):
    result = QMEngine.heisenberg_uncertainty()
    db.add(SimulationLog(type="mechanics", input_data={}, result_data={"hbar_over_2": result["hbar_over_2"]}, description="Heisenberg Uncertainty Analysis"))
    db.commit()
    return result

@app.post("/api/mechanics/spin")
async def spin_analysis(request: SpinRequest, db: Session = Depends(get_db)):
    result = QMEngine.pauli_spin_analysis(request.theta, request.phi)
    db.add(SimulationLog(type="mechanics", input_data={"theta": request.theta, "phi": request.phi}, result_data=result["expectations"], description=f"Spin Analysis: θ={request.theta:.2f}"))
    db.commit()
    return result

@app.post("/api/mechanics/hamiltonian")
async def hamiltonian(request: HamiltonianRequest, db: Session = Depends(get_db)):
    result = QMEngine.hamiltonian_eigen(size=request.size)
    db.add(SimulationLog(type="mechanics", input_data={"size": request.size}, result_data={"eigenvalues": result["eigenvalues"]}, description=f"Hamiltonian Eigen ({request.size}x{request.size})"))
    db.commit()
    return result

@app.post("/api/mechanics/oscillator")
async def oscillator(db: Session = Depends(get_db)):
    result = QMEngine.harmonic_oscillator()
    db.add(SimulationLog(type="mechanics", input_data={}, result_data={"energies": result["energies"]}, description="Harmonic Oscillator Spectrum"))
    db.commit()
    return result

# ═══════════════════ QML APIs ═══════════════════
@app.post("/api/qml/pca")
async def qml_pca(request: QMLPCARequest, db: Session = Depends(get_db)):
    global qml_engine
    qml_engine = QMLEngine(input_dim=10, n_components=2)
    data = np.random.randn(request.n_samples, 10).tolist()
    result = qml_engine.quantum_pca(data, epochs=request.epochs)
    db.add(SimulationLog(type="qml", input_data={"n_samples": request.n_samples, "epochs": request.epochs}, result_data={"final_loss": result["loss_history"][-1]}, description=f"Quantum PCA: {request.n_samples} samples"))
    db.commit()
    return result

@app.post("/api/qml/kmeans")
async def qml_kmeans(request: KMeansRequest, db: Session = Depends(get_db)):
    sample = QMLEngine.generate_sample_data(request.n_samples, n_features=2, n_clusters=request.k)
    result = QMLEngine.quantum_kmeans(sample["data"], k=request.k)
    result["data"] = sample["data"]
    result["true_labels"] = sample["true_labels"]
    db.add(SimulationLog(type="qml", input_data={"n_samples": request.n_samples, "k": request.k}, result_data={"final_inertia": result["final_inertia"]}, description=f"Quantum K-Means: k={request.k}"))
    db.commit()
    return result

# ═══════════════════ QDL APIs ═══════════════════
@app.post("/api/qdl/train")
async def qdl_train(request: VQCTrainRequest, db: Session = Depends(get_db)):
    global qdl_engine
    qdl_engine = QDLEngine(n_qubits=4, n_layers=2)
    dataset = QDLEngine.generate_classification_data(request.n_samples)
    result = qdl_engine.train_vqc(dataset["X"], dataset["y"], epochs=request.epochs)
    db.add(SimulationLog(type="qdl", input_data={"n_samples": request.n_samples, "epochs": request.epochs}, result_data={"final_accuracy": result["final_accuracy"]}, description=f"VQC Training: acc={result['final_accuracy']:.2f}"))
    db.commit()
    return result

@app.post("/api/qdl/predict")
async def qdl_predict(db: Session = Depends(get_db)):
    dataset = QDLEngine.generate_classification_data(10)
    result = qdl_engine.predict(dataset["X"])
    return {**result, "true_labels": dataset["y"]}

# ═══════════════════ QLLM APIs ═══════════════════
@app.post("/api/qllm/attention")
async def qllm_attention(request: QLLMAttentionRequest, db: Session = Depends(get_db)):
    result = qllm_engine.quantum_attention(request.token_indices)
    db.add(SimulationLog(type="qllm", input_data={"tokens": request.token_indices}, result_data={"max_pair": result["max_attention_pair"]}, description=f"Quantum Attention: {result['n_tokens']} tokens"))
    db.commit()
    return result

@app.post("/api/qllm/generate")
async def qllm_generate(request: QLLMGenerateRequest, db: Session = Depends(get_db)):
    result = qllm_engine.generate_text(request.seed_indices, request.max_length, request.temperature)
    db.add(SimulationLog(type="qllm", input_data={"seed": request.seed_indices, "temp": request.temperature}, result_data={"text": result["generated_text"]}, description=f"QLLM Gen: {result['total_tokens']} tokens"))
    db.commit()
    return result

@app.get("/api/qllm/vocab")
async def qllm_vocab():
    return qllm_engine.get_vocab()

# ═══════════════════ SYSTEM APIs ═══════════════════
@app.get("/api/logs")
async def get_logs(db: Session = Depends(get_db)):
    return db.query(SimulationLog).order_by(SimulationLog.timestamp.desc()).limit(50).all()

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    total = db.query(SimulationLog).count()
    quantum = db.query(SimulationLog).filter(SimulationLog.type == "quantum").count()
    hebbian = db.query(SimulationLog).filter(SimulationLog.type.in_(["hebbian", "hebbian_batch"])).count()
    physics = db.query(SimulationLog).filter(SimulationLog.type == "physics").count()
    mechanics = db.query(SimulationLog).filter(SimulationLog.type == "mechanics").count()
    qml = db.query(SimulationLog).filter(SimulationLog.type == "qml").count()
    qdl = db.query(SimulationLog).filter(SimulationLog.type == "qdl").count()
    qllm = db.query(SimulationLog).filter(SimulationLog.type == "qllm").count()
    return {"total": total, "quantum": quantum, "hebbian": hebbian, "physics": physics, "mechanics": mechanics, "qml": qml, "qdl": qdl, "qllm": qllm}

# ═══════════════════ GROK CHAT API ═══════════════════
class ChatRequest(BaseModel):
    messages: List[dict]
    page: str = "general"

@app.post("/api/chat")
async def chat(request: ChatRequest):
    reply = await chat_with_grok(request.messages, request.page)
    return {"reply": reply}

# ═══════════════════ SPA ROUTES ═══════════════════
@app.get("/style.css")
async def get_style():
    return FileResponse("../frontend/style.css")

@app.get("/favicon.ico")
async def get_favicon():
    return FileResponse("../frontend/favicon.ico") if os.path.exists("../frontend/favicon.ico") else ""

@app.get("/")
@app.get("/physics")
@app.get("/mechanics")
@app.get("/quantum")
@app.get("/hebbian")
@app.get("/qml")
@app.get("/qdl")
@app.get("/qllm")
@app.get("/history")
async def get_spa_entry():
    if os.path.exists("../frontend/index.html"):
        return FileResponse("../frontend/index.html")
    return "<h1>Front-end sequence not found.</h1>"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
