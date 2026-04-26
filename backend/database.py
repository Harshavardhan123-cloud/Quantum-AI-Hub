from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./quantum_hub.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class SimulationLog(Base):
    __tablename__ = "simulation_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    type = Column(String)  # "quantum" or "hebbian"
    input_data = Column(JSON, nullable=True)
    result_data = Column(JSON)
    description = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)
