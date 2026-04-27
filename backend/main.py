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
from database import SessionLocal, SimulationLog

if not os.path.exists("logs"): os.makedirs("logs")
logging.basicConfig(filename="logs/app.log", level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("QuantumHub")

app = FastAPI(title="Quantum AI Hub Full-Stack")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

num_qubits = 3
hebbian_engine = HebbianEngine(10, 5)
qubit_state = QuantumLogic.get_initial_state(num_qubits)

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
    
    # Log the last point of the batch
    last_res = results[-1]
    db.add(SimulationLog(type="hebbian_batch", input_data={"samples": request.samples, "rule": request.rule}, result_data={"final_projection": last_res["projection"]}, description=f"Batch Training: {request.samples} samples"))
    db.commit()
    return {"results": results, "rule_applied": request.rule}

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
    
    return {
        "theta": theta, "phi": phi, 
        "probabilities": probs, "labels": [f"|{l}⟩" for l in labels]
    }

@app.post("/api/quantum/config")
async def set_quantum_config(config: dict):
    global num_qubits, qubit_state
    num_qubits = max(1, min(6, config.get("n", 3)))
    qubit_state = QuantumLogic.get_initial_state(num_qubits)
    return {"status": "ok", "n": num_qubits}

@app.get("/", response_class=HTMLResponse)
@app.get("/quantum", response_class=HTMLResponse)
@app.get("/hebbian", response_class=HTMLResponse)
@app.get("/history", response_class=HTMLResponse)
async def get_spa_entry():
    with open("../frontend/index.html") as f:
        return f.read()

@app.get("/api/logs")
async def get_logs(db: Session = Depends(get_db)):
    return db.query(SimulationLog).order_by(SimulationLog.timestamp.desc()).limit(10).all()

app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
