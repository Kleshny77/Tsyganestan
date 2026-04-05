from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infra.db import get_db
from app.infra.repo.users import SQLAlchemyUserRepository
from app.services.auth import AuthService
from app.interfaces.schemas import UserCreate, UserResponse, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    repo = SQLAlchemyUserRepository(db)
    service = AuthService(repo)
    try:
        user = service.register(user_data.username, user_data.email, user_data.password, user_data.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return UserResponse(id=user.id, username=user.username, email=user.email, role=user.role, created_at=user.created_at)

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    repo = SQLAlchemyUserRepository(db)
    service = AuthService(repo)
    try:
        token = service.login(login_data.username, login_data.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    return TokenResponse(access_token=token)
