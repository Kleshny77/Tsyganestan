from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.interfaces.api import auth, tours, users
from app.infra.db import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Travel App Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tours.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Travel API is running"}
