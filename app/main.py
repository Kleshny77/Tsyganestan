import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.interfaces.api import auth, tours, users
from app.infra.db import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Travel App Backend")

_default_origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3010",
    "http://127.0.0.1:3010",
]
_extra_origins = [
    x.strip()
    for x in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if x.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[*_default_origins, *_extra_origins],
    # GitHub Pages: Origin = https://<user>.github.io (без пути к репо)
    allow_origin_regex=r"https://[a-zA-Z0-9_.-]+\.github\.io",
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
