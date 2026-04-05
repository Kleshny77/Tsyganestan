from fastapi import FastAPI
from app.interfaces.api import auth, tours, users
from app.infra.db import Base, engine

# Создаём таблицы (для локальной разработки)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Travel App Backend")

app.include_router(auth.router)
app.include_router(tours.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Travel API is running"}
