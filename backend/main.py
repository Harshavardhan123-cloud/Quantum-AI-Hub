import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict
import numpy as np
import os
import datetime
from sqlalchemy.orm import Session

from ai.hebbian_engine import HebbianEngine
from ai.quantum_logic import QuantumLogic
from database import SessionLocal, SimulationLog

# --- Logging Setup ---
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

logging.basicConfig(
    filename=f"logs/app.log",
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("QuantumHub")

# --- FastAPI Setup ---
app = FastAPI(title="Quantum AI Hub Elite v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Global Logic State ---
hebbian_engine = HebbianEngine(input_dim=10, output_dim=5)
qubit_state = QuantumLogic.get_initial_state()

class HebbianRequest(BaseModel):
    data: List[float]
    rule: str = "oja"

class GateRequest(BaseModel):
    gate: str

@app.on_event("startup")
async def startup_event():
    logger.info("Quantum AI Hub Backend Started")

@app.get("/api/status")
async def get_status():
    return {"status": "Elite v2 Active", "db": "connected", "logging": "active"}

@app.post("/api/analyze/hebbian")
async def analyze_hebbian(request: HebbianRequest, db: Session = Depends(get_db)):
    try:
        projection, weight_stats = hebbian_engine.transform(request.data, rule=request.rule)
        
        # Log to DB
        db_log = SimulationLog(
            type="hebbian",
            input_data={"vector": request.data, "rule": request.rule},
            result_data={"projection": projection, "weight_stats": weight_stats},
            description=f"Hebbian Analysis using {request.rule}"
        )
        db.add(db_log)
        db.commit()
        
        logger.info(f"Hebbian Analysis executed: Rule={request.rule}")
        return {
            "projection": projection,
            "weight_stats": weight_stats,
            "rule_applied": request.rule
        }
    except Exception as e:
        logger.error(f"Hebbian Analysis Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quantum/gate")
async def apply_gate(request: GateRequest, db: Session = Depends(get_db)):
    global qubit_state
    try:
        qubit_state = QuantumLogic.apply_gate(qubit_state, request.gate)
        theta, phi = QuantumLogic.state_to_bloch(qubit_state)
        
        # Log to DB
        db_log = SimulationLog(
            type="quantum",
            input_data={"gate": request.gate},
            result_data={"theta": theta, "phi": phi},
            description=f"Applied Quantum Gate {request.gate}"
        )
        db.add(db_log)
        db.commit()
        
        logger.info(f"Quantum Gate Applied: {request.gate}")
        return {
            "theta": theta,
            "phi": phi,
            "state_vector": [str(qubit_state[0]), str(qubit_state[1])]
        }
    except Exception as e:
        logger.error(f"Quantum Gate Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs")
async def get_logs(db: Session = Depends(get_db)):
    logs = db.query(SimulationLog).order_by(SimulationLog.timestamp.desc()).limit(10).all()
    return logs

# Serving static frontend
frontend_path = os.path.join(os.path.dirname(__file__), "../frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
