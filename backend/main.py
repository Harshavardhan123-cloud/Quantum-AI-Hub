import logging, os, datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
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

hebbian_engine = HebbianEngine(10, 5)
qubit_state = QuantumLogic.get_initial_state()

class HebbianRequest(BaseModel):
    data: List[float]
    rule: str = "oja"

class GateRequest(BaseModel):
    gate: str

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
    global qubit_state
    qubit_state = QuantumLogic.apply_gate(qubit_state, request.gate)
    theta, phi = QuantumLogic.state_to_bloch(qubit_state)
    db.add(SimulationLog(type="quantum", input_data={"gate": request.gate}, result_data={"theta": theta, "phi": phi}, description=f"Applied Gate {request.gate}"))
    db.commit()
    return {"theta": theta, "phi": phi, "state_vector": [str(qubit_state[0]), str(qubit_state[1])]}

@app.get("/api/logs")
async def get_logs(db: Session = Depends(get_db)):
    return db.query(SimulationLog).order_by(SimulationLog.timestamp.desc()).limit(10).all()

app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
